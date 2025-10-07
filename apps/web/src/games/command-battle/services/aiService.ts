import { BattleState, Command, AIBehavior } from '@/games/command-battle/types';

class AIService {
	private enemies: AIBehavior[] = [];

	constructor() {
		this.initializeEnemies();
	}

	private initializeEnemies() {
		this.enemies = [
			{
				name: '莽夫',
				description: '极度侵略型，会不断前冲并高频率使用攻击',
				selectCommand: this.selectBrawlerCommand.bind(this)
			},
			{
				name: '铁壁',
				description: '极度防御型，倾向于使用格挡和后撤',
				selectCommand: this.selectFortressCommand.bind(this)
			},
			{
				name: '宿敌',
				description: '机会主义者，会根据距离和战况切换战术',
				selectCommand: this.selectRivalCommand.bind(this)
			}
		];
	}

	private selectBrawlerCommand(state: BattleState): Command {
		const availableCommands = state.enemy.commands.filter(cmd => 
			cmd.effectiveDistance.includes(state.distance)
		);

		if (availableCommands.length === 0) {
			return state.enemy.commands[0];
		}

		const advanceCommand = availableCommands.find(cmd => cmd.type === 'advance');
		const attackCommands = availableCommands.filter(cmd => 
			cmd.type === 'light_attack' || cmd.type === 'heavy_attack'
		);

		if (state.distance === 'far' && advanceCommand) {
			return advanceCommand;
		}

		if (attackCommands.length > 0) {
			const randomIndex = Math.floor(Math.random() * attackCommands.length);
			return attackCommands[randomIndex];
		}

		return availableCommands[0];
	}

	private selectFortressCommand(state: BattleState): Command {
		const availableCommands = state.enemy.commands.filter(cmd => 
			cmd.effectiveDistance.includes(state.distance)
		);

		if (availableCommands.length === 0) {
			return state.enemy.commands[0];
		}

		const blockCommand = availableCommands.find(cmd => cmd.type === 'block');
		const retreatCommand = availableCommands.find(cmd => cmd.type === 'retreat');

		if (state.distance === 'near' && retreatCommand) {
			return retreatCommand;
		}

		if (blockCommand) {
			return blockCommand;
		}

		return availableCommands[0];
	}

	private selectRivalCommand(state: BattleState): Command {
		const availableCommands = state.enemy.commands.filter(cmd => 
			cmd.effectiveDistance.includes(state.distance)
		);

		if (availableCommands.length === 0) {
			return state.enemy.commands[0];
		}

		const playerHpPercentage = state.player.currentHp / state.player.maxHp;
		const enemyHpPercentage = state.enemy.currentHp / state.enemy.maxHp;

		if (state.distance === 'far' || state.distance === 'mid') {
			const blockCommand = availableCommands.find(cmd => cmd.type === 'block');
			if (blockCommand) {
				return blockCommand;
			}
		}

		if (state.distance === 'near') {
			const attackCommands = availableCommands.filter(cmd => 
				cmd.type === 'light_attack' || cmd.type === 'heavy_attack'
			);
			
			if (attackCommands.length > 0 && enemyHpPercentage > 0.3) {
				const randomIndex = Math.floor(Math.random() * attackCommands.length);
				return attackCommands[randomIndex];
			}
		}

		const advanceCommand = availableCommands.find(cmd => cmd.type === 'advance');
		if (advanceCommand && state.distance !== 'near') {
			return advanceCommand;
		}

		return availableCommands[0];
	}

	public getEnemy(index: number): AIBehavior | null {
		return this.enemies[index] || null;
	}

	public getAllEnemies(): AIBehavior[] {
		return this.enemies;
	}

	public selectEnemyCommand(state: BattleState): Command {
		const enemy = this.getEnemy(state.currentEnemyIndex);
		if (!enemy) {
			return state.enemy.commands[0];
		}

		return enemy.selectCommand(state);
	}
}

export const aiService = new AIService();
