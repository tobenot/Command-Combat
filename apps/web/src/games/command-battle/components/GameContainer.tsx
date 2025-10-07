import { useEffect, useState, useCallback } from 'react';
import { BattleState, Command } from '@/games/command-battle/types';
import { combatService } from '@/games/command-battle/services/combatService';
import { aiService } from '@/games/command-battle/services/aiService';
import { inputService } from '@/games/command-battle/services/inputService';
import { BattleInterface } from '@/games/command-battle/components/BattleInterface';

export function GameContainer() {
	const [battleState, setBattleState] = useState<BattleState | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const initializeGame = useCallback(() => {
		setIsLoading(true);
		const initialState = combatService.initializeGame();
		setBattleState(initialState);
		inputService.startDecisionPhase();
		setIsLoading(false);
	}, []);

	const handleGameStart = useCallback(() => {
		initializeGame();
	}, [initializeGame]);

	const handleRestart = useCallback(() => {
		initializeGame();
	}, [initializeGame]);

	const handleCommandSelect = useCallback((command: Command) => {
		if (!battleState || battleState.gameStatus !== 'playing') return;

		console.log(`[GameContainer] 选择指令: ${command.name}`);
		
		const newState = { ...battleState };
		newState.playerCommand = command;
		newState.enemyCommand = aiService.selectEnemyCommand(newState);
		newState.phase = 'commit';

		setBattleState(newState);

		setTimeout(() => {
			const resolvedState = combatService.processTurn(newState);
			setBattleState(resolvedState);
			inputService.startDecisionPhase();
		}, 1000);
	}, [battleState]);

	const handleCommandPreview = useCallback((command: Command) => {
		if (!battleState || battleState.gameStatus !== 'playing' || battleState.phase !== 'decision') return;

		console.log(`[GameContainer] 预览指令: ${command.name}`);
		
		const newState = { ...battleState };
		newState.playerCommand = command;
		setBattleState(newState);
	}, [battleState]);

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if (!battleState || battleState.gameStatus !== 'playing' || battleState.phase !== 'decision') return;

		inputService.handleKeyDown(event.code);
		inputService.processInput(event.code);
	}, [battleState]);

	const handleKeyUp = useCallback((event: KeyboardEvent) => {
		inputService.handleKeyUp(event.code);
	}, []);

	useEffect(() => {
		if (!battleState || battleState.gameStatus !== 'playing') return;

		if (battleState.phase === 'decision' && battleState.timeRemaining > 0) {
			const timer = setTimeout(() => {
				setBattleState(prev => {
					if (!prev) return null;
					return {
						...prev,
						timeRemaining: prev.timeRemaining - 1
					};
				});
			}, 1000);

			return () => clearTimeout(timer);
		} else if (battleState.phase === 'decision' && battleState.timeRemaining <= 0) {
			const finalCommandId = inputService.endDecisionPhase();
			let selectedCommand: Command | null = null;

			if (finalCommandId) {
				selectedCommand = battleState.player.commands.find(cmd => cmd.id === finalCommandId) || null;
			}

			if (!selectedCommand && battleState.playerCommand) {
				selectedCommand = battleState.playerCommand;
			}

			if (!selectedCommand) {
				const lightAttackCommand = battleState.player.commands.find(cmd => cmd.type === 'light_attack');
				selectedCommand = lightAttackCommand || battleState.player.commands[0];
			}

			console.log(`[GameContainer] 时间到，选择指令: ${selectedCommand.name}`);
			handleCommandSelect(selectedCommand);
		}
	}, [battleState, handleCommandSelect]);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [handleKeyDown, handleKeyUp]);

	if (isLoading) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] text-white">
				<div className="text-center">
					<h2 className="text-2xl font-bold mb-4">加载中...</h2>
					<p>正在准备你的试炼...</p>
				</div>
			</div>
		);
	}

	if (!battleState) {
		return (
			<div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] text-white">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-8">指令对决：起源</h1>
					<p className="text-lg mb-8">通过预判AI的行动，使用克制的指令来取得胜利</p>
					<button
						onClick={handleGameStart}
						className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold"
					>
						开始试炼
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full bg-[#1a1a2e]">
		<BattleInterface
			state={battleState}
			onCommandSelect={handleCommandPreview}
			onGameStart={handleGameStart}
			onRestart={handleRestart}
		/>
		</div>
	);
} 