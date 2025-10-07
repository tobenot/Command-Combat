export type Distance = 'near' | 'mid' | 'far';
export type CommandType = 'light_attack' | 'heavy_attack' | 'throw' | 'block' | 'advance' | 'retreat' | 'special';

export interface Command {
	id: string;
	name: string;
	type: CommandType;
	description: string;
	damage: number;
	meterCost: number;
	meterGain: number;
	effectiveDistance: Distance[];
	priority: number;
	canInterrupt: boolean;
	effects?: string[];
}

export interface Character {
	id: string;
	name: string;
	maxHp: number;
	currentHp: number;
	maxMeter: number;
	currentMeter: number;
	commands: Command[];
	isPlayer: boolean;
}

export interface BattleState {
	round: number;
	distance: Distance;
	player: Character;
	enemy: Character;
	playerCommand: Command | null;
	enemyCommand: Command | null;
	phase: 'decision' | 'commit' | 'resolution' | 'narrative';
	timeRemaining: number;
	isPlayerTurn: boolean;
	combatLog: string[];
	gameStatus: 'playing' | 'victory' | 'defeat' | 'menu';
	currentEnemyIndex: number;
}

export interface AIBehavior {
	name: string;
	description: string;
	selectCommand: (state: BattleState) => Command;
}

export interface GameConfig {
	decisionTime: number;
	maxRounds: number;
	enemies: AIBehavior[];
} 