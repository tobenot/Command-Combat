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
			combatLog: ['⚔️ 战斗开始'],
			gameStatus: 'playing',
			currentEnemyIndex: 0
		};
	}

	private createPlayerCommands(): Command[] {
		return [
			{
				id: 'light_slash',
				name: '轻拳',
				type: 'light_attack',
				description: '快速的斩击，优先级高，伤害低',
				damage: 15,
				meterCost: 0,
				meterGain: 10,
				effectiveDistance: ['near', 'mid'],
				priority: 3,
				canInterrupt: true,
				keyboardShortcut: 'U'
			},
			{
				id: 'heavy_slash',
				name: '重拳',
				type: 'heavy_attack',
				description: '势大力沉的劈砍，伤害高，但被防御后会陷入失衡',
				damage: 25,
				meterCost: 0,
				meterGain: 15,
				effectiveDistance: ['near', 'mid'],
				priority: 2,
				canInterrupt: false,
				effects: ['stagger_on_block'],
				keyboardShortcut: 'J',
				inputSequence: 'combo_002',
				isCombo: true
			},
			{
				id: 'sheath_strike',
				name: '投技',
				type: 'throw',
				description: '一次投技，消耗少量体力，可以破解对手的防御',
				damage: 20,
				meterCost: 0,
				meterGain: 5,
				effectiveDistance: ['near'],
				priority: 1,
				canInterrupt: false,
				keyboardShortcut: 'U+I',
				inputSequence: 'throw_combo',
				isCombo: true
			},
			{
				id: 'light_kick',
				name: '轻脚',
				type: 'light_attack',
				description: '快速的踢击，优先级高，伤害低',
				damage: 12,
				meterCost: 0,
				meterGain: 8,
				effectiveDistance: ['near', 'mid'],
				priority: 3,
				canInterrupt: true,
				keyboardShortcut: 'I'
			},
			{
				id: 'heavy_kick',
				name: '重脚',
				type: 'heavy_attack',
				description: '势大力沉的踢击，伤害高，但被防御后会陷入失衡',
				damage: 22,
				meterCost: 0,
				meterGain: 12,
				effectiveDistance: ['near', 'mid'],
				priority: 2,
				canInterrupt: false,
				effects: ['stagger_on_block'],
				keyboardShortcut: 'K'
			},
			{
				id: 'jump',
				name: '跳跃',
				type: 'jump',
				description: '跳跃攻击，可闪避下段攻击',
				damage: 18,
				meterCost: 0,
				meterGain: 8,
				effectiveDistance: ['near', 'mid'],
				priority: 3,
				canInterrupt: true,
				keyboardShortcut: 'W'
			},
			{
				id: 'crouch',
				name: '下蹲',
				type: 'crouch',
				description: '下蹲防御，可闪避上段攻击',
				damage: 0,
				meterCost: 0,
				meterGain: 5,
				effectiveDistance: ['near', 'mid', 'far'],
				priority: 2,
				canInterrupt: false,
				keyboardShortcut: 'S'
			},
			{
				id: 'left_move',
				name: '左移',
				type: 'left_move',
				description: '向左移动',
				damage: 0,
				meterCost: 0,
				meterGain: 0,
				effectiveDistance: ['near', 'mid', 'far'],
				priority: 1,
				canInterrupt: false,
				keyboardShortcut: 'A'
			},
			{
				id: 'right_move',
				name: '右移',
				type: 'right_move',
				description: '向右移动',
				damage: 0,
				meterCost: 0,
				meterGain: 0,
				effectiveDistance: ['near', 'mid', 'far'],
				priority: 1,
				canInterrupt: false,
				keyboardShortcut: 'D'
			},
			{
				id: 'swallow_return',
				name: '特殊攻击',
				type: 'special',
				description: '一次极快、无法被普通攻击中断的突进斩击',
				damage: 35,
				meterCost: 50,
				meterGain: 0,
				effectiveDistance: ['mid'],
				priority: 4,
				canInterrupt: true,
				keyboardShortcut: 'L',
				inputSequence: 'combo_001',
				isCombo: true
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
				id: 'enemy_light_kick',
				name: '轻踢',
				type: 'light_attack',
				description: '快速的踢击',
				damage: 10,
				meterCost: 0,
				meterGain: 6,
				effectiveDistance: ['near', 'mid'],
				priority: 3,
				canInterrupt: true
			},
			{
				id: 'enemy_heavy_kick',
				name: '重踢',
				type: 'heavy_attack',
				description: '强力的踢击',
				damage: 20,
				meterCost: 0,
				meterGain: 10,
				effectiveDistance: ['near', 'mid'],
				priority: 2,
				canInterrupt: false,
				effects: ['stagger_on_block']
			},
			{
				id: 'enemy_jump',
				name: '跳跃',
				type: 'jump',
				description: '跳跃攻击',
				damage: 16,
				meterCost: 0,
				meterGain: 6,
				effectiveDistance: ['near', 'mid'],
				priority: 3,
				canInterrupt: true
			},
			{
				id: 'enemy_crouch',
				name: '下蹲',
				type: 'crouch',
				description: '下蹲防御',
				damage: 0,
				meterCost: 0,
				meterGain: 4,
				effectiveDistance: ['near', 'mid', 'far'],
				priority: 2,
				canInterrupt: false
			},
			{
				id: 'enemy_left_move',
				name: '左移',
				type: 'left_move',
				description: '向左移动',
				damage: 0,
				meterCost: 0,
				meterGain: 0,
				effectiveDistance: ['near', 'mid', 'far'],
				priority: 1,
				canInterrupt: false
			},
			{
				id: 'enemy_right_move',
				name: '右移',
				type: 'right_move',
				description: '向右移动',
				damage: 0,
				meterCost: 0,
				meterGain: 0,
				effectiveDistance: ['near', 'mid', 'far'],
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

		const { damageToPlayer, damageToEnemy, log } = this.resolveAndCompute(playerCmd, enemyCmd, newState.distance);

		newState.player.currentHp = Math.max(0, newState.player.currentHp - damageToPlayer);
		newState.enemy.currentHp = Math.max(0, newState.enemy.currentHp - damageToEnemy);

		newState.player.currentMeter = Math.min(100, newState.player.currentMeter + playerCmd.meterGain);
		newState.enemy.currentMeter = Math.min(100, newState.enemy.currentMeter + enemyCmd.meterGain);


		newState.combatLog.push(log);

		newState.distance = this.updateDistance(newState.distance, playerCmd, enemyCmd);

		if (newState.player.currentHp <= 0) {
			newState.gameStatus = 'defeat';
			newState.combatLog.push('💀 败北');
		} else if (newState.enemy.currentHp <= 0) {
			newState.gameStatus = 'victory';
			newState.combatLog.push('🏆 胜利');
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

	private getCategory(type: Command['type']): 'attack' | 'throw' | 'block' | 'move' | 'jump' | 'crouch' {
		if (type === 'light_attack' || type === 'heavy_attack' || type === 'special') return 'attack';
		if (type === 'throw') return 'throw';
		if (type === 'block' || type === 'retreat') return 'block';
		if (type === 'jump') return 'jump';
		if (type === 'crouch') return 'crouch';
		return 'move';
	}

	private rps(left: string, right: string): 'left' | 'right' | 'neutral' {
		if (left === right) return 'neutral';
		
		// 跳跃克制下蹲攻击
		if (left === 'jump' && right === 'crouch') return 'left';
		if (left === 'crouch' && right === 'jump') return 'right';
		
		// 传统RPS
		if (left === 'attack' && right === 'throw') return 'left';
		if (left === 'throw' && right === 'block') return 'left';
		if (left === 'block' && right === 'attack') return 'left';
		
		// 跳跃攻击克制下段攻击
		if (left === 'jump' && (right === 'light_attack' || right === 'heavy_attack')) return 'left';
		if (right === 'jump' && (left === 'light_attack' || left === 'heavy_attack')) return 'right';
		
		// 下蹲克制上段攻击
		if (left === 'crouch' && (right === 'light_attack' || right === 'heavy_attack')) return 'left';
		if (right === 'crouch' && (left === 'light_attack' || left === 'heavy_attack')) return 'right';
		
		return 'right';
	}

	private getCommandEmoji(type: Command['type']): string {
		switch (type) {
			case 'light_attack': return '⚡';
			case 'heavy_attack': return '💥';
			case 'throw': return '🤜';
			case 'block': return '🛡️';
			case 'jump': return '⬆️';
			case 'crouch': return '⬇️';
			case 'left_move': return '⬅️';
			case 'right_move': return '➡️';
			case 'special': return '✨';
			default: return '⚔️';
		}
	}

	private resolveAndCompute(playerCmd: Command, enemyCmd: Command, distance: Distance): { damageToPlayer: number; damageToEnemy: number; log: string } {
		const playerEffective = this.isCommandEffective(playerCmd, distance);
		const enemyEffective = this.isCommandEffective(enemyCmd, distance);

		const playerCat = this.getCategory(playerCmd.type);
		const enemyCat = this.getCategory(enemyCmd.type);

		const advantageMultiplier = 1.2;
		const tradeMultiplier = 0.7;
		const blockReduction = 0.3;

		let damageToPlayer = 0;
		let damageToEnemy = 0;
		let log = '';
		const playerEmoji = this.getCommandEmoji(playerCmd.type);
		const enemyEmoji = this.getCommandEmoji(enemyCmd.type);

		if (!playerEffective && !enemyEffective) {
			log = `❌ 双方行动无效`;
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerEffective && !enemyEffective) {
			if (playerCat === 'attack' || playerCat === 'throw') {
				damageToEnemy = playerCmd.damage;
				log = `${playerEmoji} 命中! ${enemyEmoji} 落空 → -${damageToEnemy}HP`;
			} else {
				log = `${playerEmoji} 成功 ${enemyEmoji} 落空`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (!playerEffective && enemyEffective) {
			if (enemyCat === 'attack' || enemyCat === 'throw') {
				damageToPlayer = enemyCmd.damage;
				log = `${playerEmoji} 落空 ${enemyEmoji} 命中! → -${damageToPlayer}HP`;
			} else {
				log = `${playerEmoji} 落空 ${enemyEmoji} 成功`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerCat === 'move' && enemyCat === 'move') {
			log = `🚶 双方调整位置`;
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerCat === 'move' && enemyCat !== 'move') {
			if (enemyCat === 'attack' || enemyCat === 'throw') {
				damageToPlayer = enemyCmd.damage;
				log = `🚶 ${enemyEmoji} 命中! → -${damageToPlayer}HP`;
			} else {
				log = `🚶 ${enemyEmoji} 防御`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (enemyCat === 'move' && playerCat !== 'move') {
			if (playerCat === 'attack' || playerCat === 'throw') {
				damageToEnemy = playerCmd.damage;
				log = `${playerEmoji} 命中! 🚶 → -${damageToEnemy}HP`;
			} else {
				log = `${playerEmoji} 防御 🚶`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerCat !== 'move' && enemyCat !== 'move') {
			const rpsResult = this.rps('' + playerCat as 'attack' | 'throw' | 'block', '' + enemyCat as 'attack' | 'throw' | 'block');
			if (rpsResult === 'left') {
				if (enemyCat === 'block' && playerCat === 'attack') {
					const dmg = Math.floor(playerCmd.damage * blockReduction);
					damageToEnemy = dmg;
					log = `${playerEmoji} 克制 ${enemyEmoji} → -${dmg}HP (格挡)`;
				} else {
					const dmg = Math.floor(playerCmd.damage * advantageMultiplier);
					damageToEnemy = dmg;
					log = `${playerEmoji} 克制 ${enemyEmoji} → -${dmg}HP`;
				}
				return { damageToPlayer, damageToEnemy, log };
			} else if (rpsResult === 'right') {
				if (playerCat === 'block' && enemyCat === 'attack') {
					const dmg = Math.floor(enemyCmd.damage * blockReduction);
					damageToPlayer = dmg;
					log = `${playerEmoji} 被克 ${enemyEmoji} → -${dmg}HP (格挡)`;
				} else {
					const dmg = Math.floor(enemyCmd.damage * advantageMultiplier);
					damageToPlayer = dmg;
					log = `${playerEmoji} 被克 ${enemyEmoji} → -${dmg}HP`;
				}
				return { damageToPlayer, damageToEnemy, log };
			} else {
				if (playerCat === 'attack' && enemyCat === 'attack') {
					if (playerCmd.priority > enemyCmd.priority) {
						const dmg = playerCmd.damage;
						damageToEnemy = dmg;
						log = `${playerEmoji} 对攻 ${enemyEmoji} → -${dmg}HP (先手)`;
					} else if (enemyCmd.priority > playerCmd.priority) {
						const dmg = enemyCmd.damage;
						damageToPlayer = dmg;
						log = `${playerEmoji} 对攻 ${enemyEmoji} → -${dmg}HP (后手)`;
					} else {
						const dmgP = Math.floor(playerCmd.damage * tradeMultiplier);
						const dmgE = Math.floor(enemyCmd.damage * tradeMultiplier);
						damageToPlayer = dmgE;
						damageToEnemy = dmgP;
						log = `${playerEmoji} 对攻 ${enemyEmoji} → 互相 -${dmgE}/${dmgP}HP`;
					}
					return { damageToPlayer, damageToEnemy, log };
				}
				if (playerCat === 'block' && enemyCat === 'block') {
					log = `${playerEmoji} 对峙 ${enemyEmoji}`;
					return { damageToPlayer, damageToEnemy, log };
				}
				if (playerCat === 'throw' && enemyCat === 'throw') {
					const dmgP = Math.floor(playerCmd.damage * tradeMultiplier);
					const dmgE = Math.floor(enemyCmd.damage * tradeMultiplier);
					damageToPlayer = dmgE;
					damageToEnemy = dmgP;
					log = `${playerEmoji} 互投 ${enemyEmoji} → 互相 -${dmgE}/${dmgP}HP`;
					return { damageToPlayer, damageToEnemy, log };
				}
				log = `${playerEmoji} 抵消 ${enemyEmoji}`;
				return { damageToPlayer, damageToEnemy, log };
			}
		}

		log = `❓ 回合结束`;
		return { damageToPlayer, damageToEnemy, log };
	}

	private updateDistance(currentDistance: Distance, playerCmd: Command, enemyCmd: Command): Distance {
		let newDistance = currentDistance;

		const playerWantsAdvance = playerCmd.type === 'advance';
		const playerWantsRetreat = playerCmd.type === 'retreat';
		const enemyWantsAdvance = enemyCmd.type === 'advance';
		const enemyWantsRetreat = enemyCmd.type === 'retreat';

		if (playerWantsAdvance && !enemyWantsRetreat) {
			if (currentDistance === 'far') newDistance = 'mid';
			else if (currentDistance === 'mid') newDistance = 'near';
		} else if (playerWantsRetreat && !enemyWantsAdvance) {
			if (currentDistance === 'near') newDistance = 'mid';
			else if (currentDistance === 'mid') newDistance = 'far';
		} else if (enemyWantsAdvance && !playerWantsRetreat) {
			if (currentDistance === 'far') newDistance = 'mid';
			else if (currentDistance === 'mid') newDistance = 'near';
		} else if (enemyWantsRetreat && !playerWantsAdvance) {
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
