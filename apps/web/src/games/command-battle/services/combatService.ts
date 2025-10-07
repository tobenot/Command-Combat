import { BattleState, Command, Distance, GameConfig } from '@/games/command-battle/types';

class CombatService {
	private config: GameConfig = {
		decisionTime: 5,
		maxRounds: 50,
		enemies: []
	};

	public initializeGame(): BattleState {
		const playerCommands = this.createPlayerCommands();
		const enemyCommands = this.createEnemyCommands();

		return {
			round: 1,
			distance: 'mid',
			player: {
				id: 'player',
				name: '剑客 K',
				maxHp: 100,
				currentHp: 100,
				maxMeter: 100,
				currentMeter: 0,
				commands: playerCommands,
				isPlayer: true
			},
			enemy: {
				id: 'enemy',
				name: '莽夫',
				maxHp: 100,
				currentHp: 100,
				maxMeter: 100,
				currentMeter: 0,
				commands: enemyCommands,
				isPlayer: false
			},
			playerCommand: null,
			enemyCommand: null,
			phase: 'decision',
			timeRemaining: this.config.decisionTime,
			isPlayerTurn: true,
			combatLog: ['战斗开始！'],
			gameStatus: 'playing',
			currentEnemyIndex: 0
		};
	}

	private createPlayerCommands(): Command[] {
		return [
			{
				id: 'light_slash',
				name: '轻斩',
				type: 'light_attack',
				description: '快速的斩击，优先级高，伤害低',
				damage: 15,
				meterCost: 0,
				meterGain: 10,
				effectiveDistance: ['near', 'mid'],
				priority: 3,
				canInterrupt: true
			},
			{
				id: 'heavy_slash',
				name: '重斩',
				type: 'heavy_attack',
				description: '势大力沉的劈砍，伤害高，但被防御后会陷入失衡',
				damage: 25,
				meterCost: 0,
				meterGain: 15,
				effectiveDistance: ['near', 'mid'],
				priority: 2,
				canInterrupt: false,
				effects: ['stagger_on_block']
			},
			{
				id: 'sheath_strike',
				name: '剑鞘打击',
				type: 'throw',
				description: '一次投技，消耗少量体力，可以破解对手的防御',
				damage: 20,
				meterCost: 0,
				meterGain: 5,
				effectiveDistance: ['near'],
				priority: 1,
				canInterrupt: false
			},
			{
				id: 'block',
				name: '格挡',
				type: 'block',
				description: '防御姿态，大幅减伤',
				damage: 0,
				meterCost: 0,
				meterGain: 5,
				effectiveDistance: ['near', 'mid', 'far'],
				priority: 2,
				canInterrupt: false
			},
			{
				id: 'advance',
				name: '前冲',
				type: 'advance',
				description: '向前移动，缩短距离',
				damage: 0,
				meterCost: 0,
				meterGain: 0,
				effectiveDistance: ['mid', 'far'],
				priority: 1,
				canInterrupt: false
			},
			{
				id: 'retreat',
				name: '后撤',
				type: 'retreat',
				description: '向后移动，拉开距离',
				damage: 0,
				meterCost: 0,
				meterGain: 0,
				effectiveDistance: ['near', 'mid'],
				priority: 1,
				canInterrupt: false
			},
			{
				id: 'swallow_return',
				name: '燕返',
				type: 'special',
				description: '一次极快、无法被普通攻击中断的突进斩击',
				damage: 35,
				meterCost: 50,
				meterGain: 0,
				effectiveDistance: ['mid'],
				priority: 4,
				canInterrupt: true
			}
		];
	}

	private createEnemyCommands(): Command[] {
		return [
			{
				id: 'enemy_light_attack',
				name: '轻击',
				type: 'light_attack',
				description: '快速的攻击',
				damage: 12,
				meterCost: 0,
				meterGain: 8,
				effectiveDistance: ['near', 'mid'],
				priority: 3,
				canInterrupt: true
			},
			{
				id: 'enemy_heavy_attack',
				name: '重击',
				type: 'heavy_attack',
				description: '强力的攻击',
				damage: 22,
				meterCost: 0,
				meterGain: 12,
				effectiveDistance: ['near', 'mid'],
				priority: 2,
				canInterrupt: false,
				effects: ['stagger_on_block']
			},
			{
				id: 'enemy_block',
				name: '防御',
				type: 'block',
				description: '防御姿态',
				damage: 0,
				meterCost: 0,
				meterGain: 5,
				effectiveDistance: ['near', 'mid', 'far'],
				priority: 2,
				canInterrupt: false
			},
			{
				id: 'enemy_advance',
				name: '前进',
				type: 'advance',
				description: '向前移动',
				damage: 0,
				meterCost: 0,
				meterGain: 0,
				effectiveDistance: ['mid', 'far'],
				priority: 1,
				canInterrupt: false
			},
			{
				id: 'enemy_retreat',
				name: '后退',
				type: 'retreat',
				description: '向后移动',
				damage: 0,
				meterCost: 0,
				meterGain: 0,
				effectiveDistance: ['near', 'mid'],
				priority: 1,
				canInterrupt: false
			}
		];
	}

	public processTurn(state: BattleState): BattleState {
		const newState = { ...state };
		
		if (!newState.playerCommand || !newState.enemyCommand) {
			return newState;
		}

		const playerCmd = newState.playerCommand;
		const enemyCmd = newState.enemyCommand;

		let playerDamage = 0;
		let enemyDamage = 0;
		let logEntry = '';

		if (this.isCommandEffective(playerCmd, newState.distance) && this.isCommandEffective(enemyCmd, newState.distance)) {
			const result = this.resolveCommands(playerCmd, enemyCmd);
			
			if (result.winner === 'player') {
				enemyDamage = this.calculateDamage(playerCmd, enemyCmd, 'player');
				logEntry = this.generateCombatLog(playerCmd, enemyCmd, 'player', enemyDamage);
			} else if (result.winner === 'enemy') {
				playerDamage = this.calculateDamage(playerCmd, enemyCmd, 'enemy');
				logEntry = this.generateCombatLog(playerCmd, enemyCmd, 'enemy', playerDamage);
			} else {
				logEntry = this.generateCombatLog(playerCmd, enemyCmd, 'tie', 0);
			}
		} else {
			if (this.isCommandEffective(playerCmd, newState.distance)) {
				enemyDamage = playerCmd.damage;
				logEntry = `${newState.player.name}使用了[${playerCmd.name}]，${newState.enemy.name}没有有效应对！`;
			} else if (this.isCommandEffective(enemyCmd, newState.distance)) {
				playerDamage = enemyCmd.damage;
				logEntry = `${newState.enemy.name}使用了[${enemyCmd.name}]，${newState.player.name}没有有效应对！`;
			} else {
				logEntry = '双方都没有有效的行动！';
			}
		}

		newState.player.currentHp = Math.max(0, newState.player.currentHp - playerDamage);
		newState.enemy.currentHp = Math.max(0, newState.enemy.currentHp - enemyDamage);

		newState.player.currentMeter = Math.min(100, newState.player.currentMeter + playerCmd.meterGain);
		newState.enemy.currentMeter = Math.min(100, newState.enemy.currentMeter + enemyCmd.meterGain);

		newState.combatLog.push(logEntry);

		newState.distance = this.updateDistance(newState.distance, playerCmd, enemyCmd);

		if (newState.player.currentHp <= 0) {
			newState.gameStatus = 'defeat';
			newState.combatLog.push('你被击败了！');
		} else if (newState.enemy.currentHp <= 0) {
			newState.gameStatus = 'victory';
			newState.combatLog.push('你获得了胜利！');
		}

		newState.round++;
		newState.playerCommand = null;
		newState.enemyCommand = null;
		newState.phase = 'decision';
		newState.timeRemaining = this.config.decisionTime;

		return newState;
	}

	private isCommandEffective(command: Command, distance: Distance): boolean {
		return command.effectiveDistance.includes(distance);
	}

	private calculateDamage(attackerCmd: Command, defenderCmd: Command, winner: 'player' | 'enemy'): number {
		const baseDamage = winner === 'player' ? attackerCmd.damage : defenderCmd.damage;
		const defenderType = winner === 'player' ? defenderCmd.type : attackerCmd.type;
		
		if (defenderType === 'block') {
			return Math.floor(baseDamage * 0.3);
		}
		
		return baseDamage;
	}

	private resolveCommands(playerCmd: Command, enemyCmd: Command): { winner: 'player' | 'enemy' | 'tie' } {
		const isPlayerAttack = playerCmd.type === 'light_attack' || playerCmd.type === 'heavy_attack' || playerCmd.type === 'special';
		const isEnemyAttack = enemyCmd.type === 'light_attack' || enemyCmd.type === 'heavy_attack' || enemyCmd.type === 'special';
		const isPlayerThrow = playerCmd.type === 'throw';
		const isEnemyThrow = enemyCmd.type === 'throw';
		const isPlayerBlock = playerCmd.type === 'block';
		const isEnemyBlock = enemyCmd.type === 'block';
		const isPlayerMove = playerCmd.type === 'advance' || playerCmd.type === 'retreat';
		const isEnemyMove = enemyCmd.type === 'advance' || enemyCmd.type === 'retreat';

		if (isPlayerAttack && isEnemyThrow) {
			return { winner: 'player' };
		}
		if (isPlayerThrow && isEnemyBlock) {
			return { winner: 'player' };
		}
		if (isPlayerBlock && isEnemyAttack) {
			return { winner: 'player' };
		}
		if (isPlayerAttack && isEnemyAttack) {
			if (playerCmd.priority > enemyCmd.priority) {
				return { winner: 'player' };
			} else if (enemyCmd.priority > playerCmd.priority) {
				return { winner: 'enemy' };
			} else {
				return { winner: 'tie' };
			}
		}
		if (isPlayerMove && isEnemyMove) {
			return { winner: 'tie' };
		}
		if (isPlayerMove && isEnemyBlock) {
			return { winner: 'tie' };
		}
		if (isPlayerBlock && isEnemyMove) {
			return { winner: 'tie' };
		}
		if (isPlayerBlock && isEnemyBlock) {
			return { winner: 'tie' };
		}
		
		return { winner: 'tie' };
	}

	private generateCombatLog(playerCmd: Command, enemyCmd: Command, winner: 'player' | 'enemy' | 'tie', damage: number): string {
		if (winner === 'player') {
			return `你使用了[${playerCmd.name}]，对手使用了[${enemyCmd.name}]！你的攻击命中了，造成${damage}点伤害！`;
		} else if (winner === 'enemy') {
			return `你使用了[${playerCmd.name}]，对手使用了[${enemyCmd.name}]！对手的攻击命中了，你受到${damage}点伤害！`;
		} else {
			return `你使用了[${playerCmd.name}]，对手使用了[${enemyCmd.name}]！双方势均力敌！`;
		}
	}

	private updateDistance(currentDistance: Distance, playerCmd: Command, enemyCmd: Command): Distance {
		let newDistance = currentDistance;

		if (playerCmd.type === 'advance' && enemyCmd.type !== 'retreat') {
			if (currentDistance === 'far') newDistance = 'mid';
			else if (currentDistance === 'mid') newDistance = 'near';
		} else if (playerCmd.type === 'retreat' && enemyCmd.type !== 'advance') {
			if (currentDistance === 'near') newDistance = 'mid';
			else if (currentDistance === 'mid') newDistance = 'far';
		} else if (enemyCmd.type === 'advance' && playerCmd.type !== 'retreat') {
			if (currentDistance === 'far') newDistance = 'mid';
			else if (currentDistance === 'mid') newDistance = 'near';
		} else if (enemyCmd.type === 'retreat' && playerCmd.type !== 'advance') {
			if (currentDistance === 'near') newDistance = 'mid';
			else if (currentDistance === 'mid') newDistance = 'far';
		}

		return newDistance;
	}

	public getDistanceText(distance: Distance): string {
		switch (distance) {
			case 'near': return '近距离';
			case 'mid': return '中距离';
			case 'far': return '远距离';
		}
	}
}

export const combatService = new CombatService();
