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

		const { damageToPlayer, damageToEnemy, log } = this.resolveAndCompute(playerCmd, enemyCmd, newState.distance, newState.player.name, newState.enemy.name);

		newState.player.currentHp = Math.max(0, newState.player.currentHp - damageToPlayer);
		newState.enemy.currentHp = Math.max(0, newState.enemy.currentHp - damageToEnemy);

		newState.player.currentMeter = Math.min(100, newState.player.currentMeter + playerCmd.meterGain);
		newState.enemy.currentMeter = Math.min(100, newState.enemy.currentMeter + enemyCmd.meterGain);


		newState.combatLog.push(log);

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

	private getCategory(type: Command['type']): 'attack' | 'throw' | 'block' | 'move' {
		if (type === 'light_attack' || type === 'heavy_attack' || type === 'special') return 'attack';
		if (type === 'throw') return 'throw';
		if (type === 'block') return 'block';
		return 'move';
	}

	private rps(left: 'attack' | 'throw' | 'block', right: 'attack' | 'throw' | 'block'): 'left' | 'right' | 'neutral' {
		if (left === right) return 'neutral';
		if (left === 'attack' && right === 'throw') return 'left';
		if (left === 'throw' && right === 'block') return 'left';
		if (left === 'block' && right === 'attack') return 'left';
		return 'right';
	}

	private resolveAndCompute(playerCmd: Command, enemyCmd: Command, distance: Distance, playerName: string, enemyName: string): { damageToPlayer: number; damageToEnemy: number; log: string } {
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

		if (!playerEffective && !enemyEffective) {
			log = '双方都没有有效的行动！';
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerEffective && !enemyEffective) {
			if (playerCat === 'attack' || playerCat === 'throw') {
				damageToEnemy = playerCmd.damage;
				log = `${playerName}使用了[${playerCmd.name}]，${enemyName}动作落空，造成${damageToEnemy}伤害！`;
			} else {
				log = `${playerName}使用了[${playerCmd.name}]，${enemyName}动作落空！`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (!playerEffective && enemyEffective) {
			if (enemyCat === 'attack' || enemyCat === 'throw') {
				damageToPlayer = enemyCmd.damage;
				log = `${enemyName}使用了[${enemyCmd.name}]，${playerName}动作落空，你受到${damageToPlayer}伤害！`;
			} else {
				log = `${enemyName}使用了[${enemyCmd.name}]，${playerName}动作落空！`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerCat === 'move' && enemyCat === 'move') {
			log = '双方调整脚步，暂未交锋。';
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerCat === 'move' && enemyCat !== 'move') {
			if (enemyCat === 'attack' || enemyCat === 'throw') {
				damageToPlayer = enemyCmd.damage;
				log = `${playerName}选择[${playerCmd.name}]移动，${enemyName}的[${enemyCmd.name}]命中，你受到${damageToPlayer}伤害！`;
			} else {
				log = `${playerName}选择[${playerCmd.name}]，${enemyName}的[${enemyCmd.name}]未造成伤害。`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (enemyCat === 'move' && playerCat !== 'move') {
			if (playerCat === 'attack' || playerCat === 'throw') {
				damageToEnemy = playerCmd.damage;
				log = `${enemyName}选择[${enemyCmd.name}]移动，${playerName}的[${playerCmd.name}]命中，造成${damageToEnemy}伤害！`;
			} else {
				log = `${enemyName}选择[${enemyCmd.name}]，${playerName}的[${playerCmd.name}]未造成伤害。`;
			}
			return { damageToPlayer, damageToEnemy, log };
		}

		if (playerCat !== 'move' && enemyCat !== 'move') {
			const rpsResult = this.rps('' + playerCat as 'attack' | 'throw' | 'block', '' + enemyCat as 'attack' | 'throw' | 'block');
			if (rpsResult === 'left') {
				if (enemyCat === 'block' && playerCat === 'attack') {
					const dmg = Math.floor(playerCmd.damage * blockReduction);
					damageToEnemy = dmg;
					log = `你以[${playerCmd.name}]克制对手的[${enemyCmd.name}]，被格挡削减，造成${dmg}伤害。`;
				} else {
					const dmg = Math.floor(playerCmd.damage * advantageMultiplier);
					damageToEnemy = dmg;
					log = `你以[${playerCmd.name}]克制对手的[${enemyCmd.name}]，造成${dmg}伤害！`;
				}
				return { damageToPlayer, damageToEnemy, log };
			} else if (rpsResult === 'right') {
				if (playerCat === 'block' && enemyCat === 'attack') {
					const dmg = Math.floor(enemyCmd.damage * blockReduction);
					damageToPlayer = dmg;
					log = `对手以[${enemyCmd.name}]克制你的[${playerCmd.name}]，被格挡削减，你受到${dmg}伤害。`;
				} else {
					const dmg = Math.floor(enemyCmd.damage * advantageMultiplier);
					damageToPlayer = dmg;
					log = `对手以[${enemyCmd.name}]克制你的[${playerCmd.name}]，你受到${dmg}伤害！`;
				}
				return { damageToPlayer, damageToEnemy, log };
			} else {
				if (playerCat === 'attack' && enemyCat === 'attack') {
					if (playerCmd.priority > enemyCmd.priority) {
						const dmg = playerCmd.damage;
						damageToEnemy = dmg;
						log = `双方以攻对攻，你的优先级更高，[${playerCmd.name}]命中造成${dmg}伤害！`;
					} else if (enemyCmd.priority > playerCmd.priority) {
						const dmg = enemyCmd.damage;
						damageToPlayer = dmg;
						log = `双方以攻对攻，对手优先级更高，[${enemyCmd.name}]命中，你受到${dmg}伤害！`;
					} else {
						const dmgP = Math.floor(playerCmd.damage * tradeMultiplier);
						const dmgE = Math.floor(enemyCmd.damage * tradeMultiplier);
						damageToPlayer = dmgE;
						damageToEnemy = dmgP;
						log = `双方以攻对攻同时命中，你受到${dmgE}伤害，对手受到${dmgP}伤害。`;
					}
					return { damageToPlayer, damageToEnemy, log };
				}
				if (playerCat === 'block' && enemyCat === 'block') {
					log = '双方对峙观望，均选择防守。';
					return { damageToPlayer, damageToEnemy, log };
				}
				if (playerCat === 'throw' && enemyCat === 'throw') {
					const dmgP = Math.floor(playerCmd.damage * tradeMultiplier);
					const dmgE = Math.floor(enemyCmd.damage * tradeMultiplier);
					damageToPlayer = dmgE;
					damageToEnemy = dmgP;
					log = `双方同时尝试投技，互相受创：你${dmgE}，对手${dmgP}。`;
					return { damageToPlayer, damageToEnemy, log };
				}
				log = '双方行动相互抵消。';
				return { damageToPlayer, damageToEnemy, log };
			}
		}

		log = '本回合未能分出胜负。';
		return { damageToPlayer, damageToEnemy, log };
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
