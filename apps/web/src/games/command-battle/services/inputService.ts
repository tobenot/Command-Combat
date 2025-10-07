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
}

class InputService {
	private inputState: InputState = {
		currentSequence: [],
		lastInputTime: 0,
		sequenceBuffer: []
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
			sequence: ['down', 'down', 'punch'],
			timeWindow: 800,
			command: 'sheath_strike',
			description: '快速投技连招'
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
		const input = this.keyMapping[key];
		if (!input) return null;

		if (this.pressedKeys.has('KeyU') && this.pressedKeys.has('KeyI')) {
			this.clearSequence();
			return 'throw_combo';
		}

		const now = Date.now();
		this.inputState.lastInputTime = now;

		this.inputState.sequenceBuffer.push({
			input,
			timestamp: now
		});

		this.cleanOldInputs(now);

		const matchedSequence = this.findMatchingSequence();
		if (matchedSequence) {
			this.clearSequence();
			return matchedSequence.command;
		}

		return null;
	}

	private cleanOldInputs(now: number): void {
		const maxAge = 2000;
		this.inputState.sequenceBuffer = this.inputState.sequenceBuffer.filter(
			input => now - input.timestamp < maxAge
		);
	}

	private findMatchingSequence(): InputSequence | null {
		const buffer = this.inputState.sequenceBuffer.map(input => input.input);
		
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
		return this.inputState.sequenceBuffer.map(input => input.input);
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
		this.inputState.currentSequence = [];
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
}

export const inputService = new InputService();
