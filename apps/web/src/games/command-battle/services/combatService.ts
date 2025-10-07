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
			combatLog: ['⚔️ 战斗开始 - 第一场：莽夫'],
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
				effectiveDistance: ['near', 'mid', 'far'],
				priority: 1,
				canInterrupt: false,
				keyboardShortcut: 'U+I',
				inputSequence: 'combo_004',
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
			id: 'block',
			name: '格挡',
			type: 'block',
			description: '格挡防御，减少受到的伤害',
			damage: 0,
			meterCost: 0,
			meterGain: 5,
			effectiveDistance: ['near', 'mid', 'far'],
			priority: 2,
			canInterrupt: false,
			keyboardShortcut: 'S'
		},
		{
			id: 'jump',
			name: '跳跃',
			type: 'jump',
			description: '跳跃闪避，可躲避投技和下段攻击',
			damage: 0,
			meterCost: 0,
			meterGain: 3,
			effectiveDistance: ['near', 'mid'],
			priority: 3,
			canInterrupt: true,
			keyboardShortcut: 'W'
		},
		{
			id: 'crouch',
			name: '下蹲',
			type: 'crouch',
			description: '下蹲防御，可躲避投技和上段攻击',
			damage: 0,
			meterCost: 0,
			meterGain: 3,
			effectiveDistance: ['near', 'mid', 'far'],
			priority: 2,
			canInterrupt: false,
			keyboardShortcut: 'Q'
		},
		{
			id: 'advance',
			name: '前进',
			type: 'advance',
			description: '向对手靠近',
			damage: 0,
			meterCost: 0,
			meterGain: 0,
			effectiveDistance: ['near', 'mid', 'far'],
			priority: 1,
			canInterrupt: false,
			keyboardShortcut: 'D'
		},
		{
			id: 'retreat',
			name: '后撤',
			type: 'retreat',
			description: '远离对手',
			damage: 0,
			meterCost: 0,
			meterGain: 0,
			effectiveDistance: ['near', 'mid', 'far'],
			priority: 1,
			canInterrupt: false,
			keyboardShortcut: 'A'
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
			id: 'enemy_block',
			name: '格挡',
			type: 'block',
			description: '格挡防御',
			damage: 0,
			meterCost: 0,
			meterGain: 4,
			effectiveDistance: ['near', 'mid', 'far'],
			priority: 2,
			canInterrupt: false
		},
		{
			id: 'enemy_jump',
			name: '跳跃',
			type: 'jump',
			description: '跳跃闪避',
			damage: 0,
			meterCost: 0,
			meterGain: 3,
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
			meterGain: 3,
			effectiveDistance: ['near', 'mid', 'far'],
			priority: 2,
			canInterrupt: false
		},
		{
			id: 'enemy_advance',
			name: '前进',
			type: 'advance',
			description: '向前靠近',
			damage: 0,
			meterCost: 0,
			meterGain: 0,
			effectiveDistance: ['near', 'mid', 'far'],
			priority: 1,
			canInterrupt: false
		},
		{
			id: 'enemy_retreat',
			name: '后撤',
			type: 'retreat',
			description: '向后撤离',
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

		const playerMeterFromAction = playerCmd.meterGain;
		const enemyMeterFromAction = enemyCmd.meterGain;
		const playerMeterFromDamage = Math.floor(damageToPlayer * 0.5);
		const enemyMeterFromDamage = Math.floor(damageToEnemy * 0.5);

		newState.player.currentMeter = Math.min(100, Math.max(0, newState.player.currentMeter - playerCmd.meterCost + playerMeterFromAction + playerMeterFromDamage));
		newState.enemy.currentMeter = Math.min(100, Math.max(0, newState.enemy.currentMeter - enemyCmd.meterCost + enemyMeterFromAction + enemyMeterFromDamage));

		newState.combatLog.push(log);

		newState.distance = this.updateDistance(newState.distance, playerCmd, enemyCmd, damageToPlayer, damageToEnemy);

		if (newState.player.currentHp <= 0) {
			newState.gameStatus = 'defeat';
			newState.combatLog.push('💀 败北');
		} else if (newState.enemy.currentHp <= 0) {
			// 检查是否还有下一个敌人
			if (newState.currentEnemyIndex < 2) {
				// 切换到下一个敌人
				newState.currentEnemyIndex++;
				newState.combatLog.push(`🏆 击败了敌人！准备迎战下一个对手...`);
				this.switchToNextEnemy(newState);
			} else {
				// 所有敌人都被击败，完全胜利
				newState.gameStatus = 'victory';
				newState.combatLog.push('🏆 完全胜利！你完成了所有试炼！');
			}
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
		
		if (left === 'throw' && (right === 'jump' || right === 'crouch')) return 'right';
		if (right === 'throw' && (left === 'jump' || left === 'crouch')) return 'left';
		
		if (left === 'attack' && right === 'throw') return 'left';
		if (left === 'throw' && right === 'attack') return 'right';
		
		if (left === 'throw' && right === 'block') return 'left';
		if (left === 'block' && right === 'throw') return 'right';
		
		if (left === 'block' && right === 'attack') return 'left';
		if (left === 'attack' && right === 'block') return 'right';
		
		return 'neutral';
	}

	private getCommandEmoji(type: Command['type']): string {
		switch (type) {
			case 'light_attack': return '⚡';
			case 'heavy_attack': return '💥';
			case 'throw': return '🤜';
			case 'block': return '🛡️';
			case 'jump': return '⬆️';
			case 'crouch': return '⬇️';
			case 'advance': return '➡️';
			case 'retreat': return '⬅️';
			case 'special': return '✨';
			default: return '⚔️';
		}
	}

	private resolveAndCompute(playerCmd: Command, enemyCmd: Command, distance: Distance): { damageToPlayer: number; damageToEnemy: number; log: string } {
		const playerEffective = this.isCommandEffective(playerCmd, distance);
		const enemyEffective = this.isCommandEffective(enemyCmd, distance);

		const playerCat = this.getCategory(playerCmd.type);
		const enemyCat = this.getCategory(enemyCmd.type);

		const advantageMultiplier = 1.3;
		const tradeMultiplier = 0.7;
		const blockReduction = 0.3;

		let damageToPlayer = 0;
		let damageToEnemy = 0;
		let log = '';
		const playerEmoji = this.getCommandEmoji(playerCmd.type);
		const enemyEmoji = this.getCommandEmoji(enemyCmd.type);
		
		const commandDisplay = `${playerEmoji} ${playerCmd.name} vs ${enemyEmoji} ${enemyCmd.name}`;

		if (!playerEffective && !enemyEffective) {
			log = `${commandDisplay} → ❌ 双方行动无效`;
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerEffective && !enemyEffective) {
			if (playerCat === 'attack' || playerCat === 'throw') {
				damageToEnemy = playerCmd.damage;
				log = `${commandDisplay} → ${playerEmoji} 命中! ${enemyEmoji} 落空 → -${damageToEnemy}HP`;
			} else {
				log = `${commandDisplay} → ${playerEmoji} 成功 ${enemyEmoji} 落空`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (!playerEffective && enemyEffective) {
			if (enemyCat === 'attack' || enemyCat === 'throw') {
				damageToPlayer = enemyCmd.damage;
				log = `${commandDisplay} → ${playerEmoji} 落空 ${enemyEmoji} 命中! → -${damageToPlayer}HP`;
			} else {
				log = `${commandDisplay} → ${playerEmoji} 落空 ${enemyEmoji} 成功`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerCat === 'move' && enemyCat === 'move') {
			log = `${commandDisplay} → 🚶 双方调整距离`;
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerCat === 'move') {
			if (enemyCat === 'attack') {
				damageToPlayer = enemyCmd.damage;
				log = `${commandDisplay} → 🚶 移动中被 ${enemyEmoji} 命中! → -${damageToPlayer}HP`;
			} else if (enemyCat === 'throw') {
				damageToPlayer = enemyCmd.damage;
				log = `${commandDisplay} → 🚶 移动中被投技! → -${damageToPlayer}HP`;
			} else {
				log = `${commandDisplay} → 🚶 ${enemyEmoji} 防御姿态`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (enemyCat === 'move') {
			if (playerCat === 'attack') {
				damageToEnemy = playerCmd.damage;
				log = `${commandDisplay} → ${playerEmoji} 命中移动中的对手! → -${damageToEnemy}HP`;
			} else if (playerCat === 'throw') {
				damageToEnemy = playerCmd.damage;
				log = `${commandDisplay} → 投技命中移动中的对手! → -${damageToEnemy}HP`;
			} else {
				log = `${commandDisplay} → ${playerEmoji} 防御姿态 🚶`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerCat === 'jump' || playerCat === 'crouch' || enemyCat === 'jump' || enemyCat === 'crouch') {
			const rpsResult = this.rps(playerCat, enemyCat);
			if (rpsResult === 'left') {
				if (enemyCat === 'throw') {
					log = `${commandDisplay} → ${playerEmoji} 躲避投技成功!`;
				} else if (enemyCat === 'attack') {
					damageToPlayer = Math.floor(enemyCmd.damage * 0.5);
					log = `${commandDisplay} → ${playerEmoji} 闪避姿态，${enemyEmoji} 擦伤 → -${damageToPlayer}HP`;
				} else {
					log = `${commandDisplay} → ${playerEmoji} ${enemyEmoji}`;
				}
			} else if (rpsResult === 'right') {
				if (playerCat === 'throw') {
					log = `${commandDisplay} → ${playerEmoji} 投技被躲避!`;
				} else if (playerCat === 'attack') {
					damageToEnemy = Math.floor(playerCmd.damage * 0.5);
					log = `${commandDisplay} → ${enemyEmoji} 闪避姿态，${playerEmoji} 擦伤 → -${damageToEnemy}HP`;
				} else {
					log = `${commandDisplay} → ${playerEmoji} ${enemyEmoji}`;
				}
			} else {
				log = `${commandDisplay} → ${playerEmoji} 对峙 ${enemyEmoji}`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		const rpsResult = this.rps(playerCat, enemyCat);
		if (rpsResult === 'left') {
			if (enemyCat === 'block' && playerCat === 'attack') {
				const dmg = Math.floor(playerCmd.damage * blockReduction);
				damageToEnemy = dmg;
				log = `${commandDisplay} → ${playerEmoji} 被格挡 → -${dmg}HP`;
			} else if (playerCat === 'throw' && enemyCat === 'block') {
				damageToEnemy = Math.floor(playerCmd.damage * advantageMultiplier);
				log = `${commandDisplay} → ${playerEmoji} 破防! → -${damageToEnemy}HP`;
			} else if (playerCat === 'attack' && enemyCat === 'throw') {
				damageToEnemy = Math.floor(playerCmd.damage * advantageMultiplier);
				log = `${commandDisplay} → ${playerEmoji} 打断投技! → -${damageToEnemy}HP`;
			} else {
				damageToEnemy = Math.floor(playerCmd.damage * advantageMultiplier);
				log = `${commandDisplay} → ${playerEmoji} 克制 ${enemyEmoji} → -${damageToEnemy}HP`;
			}
			return { damageToPlayer, damageToEnemy, log };
		} else if (rpsResult === 'right') {
			if (playerCat === 'block' && enemyCat === 'attack') {
				const dmg = Math.floor(enemyCmd.damage * blockReduction);
				damageToPlayer = dmg;
				log = `${commandDisplay} → ${enemyEmoji} 被格挡 → -${dmg}HP`;
			} else if (enemyCat === 'throw' && playerCat === 'block') {
				damageToPlayer = Math.floor(enemyCmd.damage * advantageMultiplier);
				log = `${commandDisplay} → ${enemyEmoji} 破防! → -${damageToPlayer}HP`;
			} else if (enemyCat === 'attack' && playerCat === 'throw') {
				damageToPlayer = Math.floor(enemyCmd.damage * advantageMultiplier);
				log = `${commandDisplay} → ${enemyEmoji} 打断投技! → -${damageToPlayer}HP`;
			} else {
				damageToPlayer = Math.floor(enemyCmd.damage * advantageMultiplier);
				log = `${commandDisplay} → ${playerEmoji} 被克 ${enemyEmoji} → -${damageToPlayer}HP`;
			}
			return { damageToPlayer, damageToEnemy, log };
		} else {
			if (playerCat === 'attack' && enemyCat === 'attack') {
				if (playerCmd.priority > enemyCmd.priority) {
					damageToEnemy = playerCmd.damage;
					log = `${commandDisplay} → ${playerEmoji} 先手! → -${damageToEnemy}HP`;
				} else if (enemyCmd.priority > playerCmd.priority) {
					damageToPlayer = enemyCmd.damage;
					log = `${commandDisplay} → ${enemyEmoji} 先手! → -${damageToPlayer}HP`;
				} else {
					damageToPlayer = Math.floor(enemyCmd.damage * tradeMultiplier);
					damageToEnemy = Math.floor(playerCmd.damage * tradeMultiplier);
					log = `${commandDisplay} → ${playerEmoji} 对攻 ${enemyEmoji} → 互相 -${damageToPlayer}/-${damageToEnemy}HP`;
				}
			} else if (playerCat === 'block' && enemyCat === 'block') {
				log = `${commandDisplay} → ${playerEmoji} 对峙 ${enemyEmoji}`;
			} else if (playerCat === 'throw' && enemyCat === 'throw') {
				damageToPlayer = Math.floor(enemyCmd.damage * tradeMultiplier);
				damageToEnemy = Math.floor(playerCmd.damage * tradeMultiplier);
				log = `${commandDisplay} → ${playerEmoji} 互投 ${enemyEmoji} → 互相 -${damageToPlayer}/-${damageToEnemy}HP`;
			} else {
				log = `${commandDisplay} → ${playerEmoji} 抵消 ${enemyEmoji}`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}
	}

	private updateDistance(currentDistance: Distance, playerCmd: Command, enemyCmd: Command, damageToPlayer: number, damageToEnemy: number): Distance {
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

		if (damageToEnemy > 0 && playerCmd.type === 'heavy_attack' && damageToEnemy >= 20) {
			if (newDistance === 'near') newDistance = 'mid';
			else if (newDistance === 'mid') newDistance = 'far';
		}

		if (damageToPlayer > 0 && enemyCmd.type === 'heavy_attack' && damageToPlayer >= 20) {
			if (newDistance === 'near') newDistance = 'mid';
			else if (newDistance === 'mid') newDistance = 'far';
		}

		if (damageToEnemy > 0 && playerCmd.type === 'throw') {
			if (newDistance === 'mid') newDistance = 'near';
			else if (newDistance === 'far') newDistance = 'mid';
		}

		if (damageToPlayer > 0 && enemyCmd.type === 'throw') {
			if (newDistance === 'mid') newDistance = 'near';
			else if (newDistance === 'far') newDistance = 'mid';
		}

		return newDistance;
	}

	private switchToNextEnemy(state: BattleState): void {
		const enemyNames = ['莽夫', '铁壁', '宿敌'];
		const enemyHp = [100, 120, 150]; // 每个敌人血量递增
		
		state.enemy.name = enemyNames[state.currentEnemyIndex];
		state.enemy.maxHp = enemyHp[state.currentEnemyIndex];
		state.enemy.currentHp = enemyHp[state.currentEnemyIndex];
		state.enemy.currentMeter = 0;
		state.distance = 'mid';
		state.round = 1; // 重置回合数
		
		// 恢复玩家状态
		state.player.currentHp = Math.min(state.player.maxHp, state.player.currentHp + 20); // 每场战斗后恢复20HP
		state.player.currentMeter = Math.min(state.player.maxMeter, state.player.currentMeter + 30); // 恢复30气力
		
		state.combatLog.push(`⚔️ 第二场：${state.enemy.name} (HP: ${state.enemy.maxHp})`);
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
