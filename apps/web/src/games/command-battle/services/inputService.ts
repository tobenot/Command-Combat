export type InputDirection = 'up' | 'down' | 'left' | 'right' | 'neutral';
export type InputButton = 'punch' | 'kick' | 'block' | 'special';

export interface InputSequence {
	id: string;
	name: string;
	sequence: (InputDirection | InputButton)[];
	timeWindow: number;
	command: string;
	description: string;
}

export interface InputState {
	currentSequence: (InputDirection | InputButton)[];
	lastInputTime: number;
	sequenceBuffer: Array<{
		input: InputDirection | InputButton;
		timestamp: number;
	}>;
	isInputEnabled: boolean;
	decisionBuffer: Array<{
		input: InputDirection | InputButton;
		timestamp: number;
	}>;
	lastValidCommand: string | null;
}

class InputService {
	private inputState: InputState = {
		currentSequence: [],
		lastInputTime: 0,
		sequenceBuffer: [],
		isInputEnabled: true,
		decisionBuffer: [],
		lastValidCommand: null
	};

	private sequences: InputSequence[] = [
		{
			id: 'combo_001',
			name: '波动拳',
			sequence: ['down', 'right', 'punch'],
			timeWindow: 1000,
			command: 'swallow_return',
			description: '经典波动拳连招'
		},
		{
			id: 'combo_002',
			name: '升龙拳',
			sequence: ['right', 'down', 'right', 'punch'],
			timeWindow: 1200,
			command: 'heavy_slash',
			description: '经典升龙拳连招'
		},
		{
			id: 'combo_003',
			name: '龙卷旋风脚',
			sequence: ['down', 'left', 'kick'],
			timeWindow: 1000,
			command: 'light_slash',
			description: '经典龙卷旋风脚连招'
		},
		{
			id: 'combo_004',
			name: '投技连招',
			sequence: ['punch', 'kick'],
			timeWindow: 1000,
			command: 'sheath_strike',
			description: '投技连招'
		},
		{
			id: 'combo_005',
			name: '防御反击',
			sequence: ['block', 'punch'],
			timeWindow: 500,
			command: 'block',
			description: '防御后反击'
		}
	];

	private keyMapping: Record<string, InputDirection | InputButton> = {
		'KeyW': 'up',
		'KeyS': 'down',
		'KeyA': 'left',
		'KeyD': 'right',
		'KeyU': 'punch',
		'KeyI': 'kick',
		'KeyJ': 'punch',
		'KeyK': 'kick',
		'KeyL': 'special'
	};

	private pressedKeys: Set<string> = new Set();

	public handleKeyDown(key: string): void {
		this.pressedKeys.add(key);
	}

	public handleKeyUp(key: string): void {
		this.pressedKeys.delete(key);
	}

	public processInput(key: string): string | null {
		if (!this.inputState.isInputEnabled) {
			console.log(`[InputService] 输入被禁用，忽略按键: ${key}`);
			return null;
		}

		const input = this.keyMapping[key];
		if (!input) return null;

		const now = Date.now();
		this.inputState.lastInputTime = now;

		this.inputState.decisionBuffer.push({
			input,
			timestamp: now
		});

		this.cleanOldDecisionInputs(now);

		const matchedSequence = this.findMatchingSequence();
		if (matchedSequence) {
			this.inputState.lastValidCommand = matchedSequence.command;
			console.log(`[InputService] 连招匹配: ${matchedSequence.name} -> ${matchedSequence.command}`);
		} else {
			const singleKeyCommand = this.getSingleKeyCommand(key);
			if (singleKeyCommand) {
				this.inputState.lastValidCommand = singleKeyCommand;
				console.log(`[InputService] 单键指令: ${key} -> ${singleKeyCommand}`);
			}
		}

		return null;
	}

	public getFinalCommand(): string | null {
		return this.inputState.lastValidCommand;
	}


	private cleanOldDecisionInputs(now: number): void {
		const maxAge = 5000;
		this.inputState.decisionBuffer = this.inputState.decisionBuffer.filter(
			input => now - input.timestamp < maxAge
		);
	}

	private findMatchingSequence(): InputSequence | null {
		const buffer = this.inputState.decisionBuffer.map(input => input.input);
		
		for (const sequence of this.sequences) {
			if (this.isSequenceMatch(buffer, sequence.sequence)) {
				return sequence;
			}
		}
		
		return null;
	}

	private isSequenceMatch(buffer: (InputDirection | InputButton)[], sequence: (InputDirection | InputButton)[]): boolean {
		if (buffer.length < sequence.length) return false;

		const recentInputs = buffer.slice(-sequence.length);
		
		for (let i = 0; i < sequence.length; i++) {
			if (recentInputs[i] !== sequence[i]) {
				return false;
			}
		}
		
		return true;
	}

	public getCurrentSequence(): (InputDirection | InputButton)[] {
		return this.inputState.decisionBuffer.map(input => input.input);
	}

	public getSequenceDisplay(): string {
		const sequence = this.getCurrentSequence();
		if (sequence.length === 0) return '';

		const displayMap: Record<InputDirection | InputButton, string> = {
			'up': '↑',
			'down': '↓',
			'left': '←',
			'right': '→',
			'neutral': '·',
			'punch': '轻拳',
			'kick': '轻脚',
			'block': '格挡',
			'special': '特殊'
		};

		return sequence.map(input => displayMap[input]).join(' ');
	}

	public clearSequence(): void {
		this.inputState.sequenceBuffer = [];
		this.inputState.decisionBuffer = [];
		this.inputState.currentSequence = [];
		this.inputState.lastValidCommand = null;
	}

	public getAllSequences(): InputSequence[] {
		return this.sequences;
	}

	public addSequence(sequence: InputSequence): void {
		this.sequences.push(sequence);
	}

	public removeSequence(id: string): void {
		this.sequences = this.sequences.filter(seq => seq.id !== id);
	}

	public setInputEnabled(enabled: boolean): void {
		this.inputState.isInputEnabled = enabled;
		console.log(`[InputService] 输入状态变更: ${enabled ? '启用' : '禁用'}`);
		if (!enabled) {
			this.clearSequence();
		}
	}

	public startDecisionPhase(): void {
		this.clearSequence();
		this.inputState.isInputEnabled = true;
		console.log(`[InputService] 开始决策阶段`);
	}

	public endDecisionPhase(): string | null {
		const finalCommand = this.getFinalCommand();
		console.log(`[InputService] 决策阶段结束，最终指令: ${finalCommand || '无'}`);
		this.clearSequence();
		return finalCommand;
	}

	public isInputEnabled(): boolean {
		return this.inputState.isInputEnabled;
	}

	private getSingleKeyCommand(key: string): string | null {
		const singleKeyMapping: Record<string, string> = {
			'KeyU': 'light_slash',
			'KeyI': 'light_kick', 
			'KeyJ': 'heavy_slash',
			'KeyK': 'heavy_kick',
			'KeyL': 'swallow_return',
			'KeyW': 'jump',
			'KeyS': 'block',
			'KeyA': 'retreat',
			'KeyD': 'advance',
			'KeyQ': 'crouch'
		};

		return singleKeyMapping[key] || null;
	}
}

export const inputService = new InputService();
