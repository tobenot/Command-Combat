import { useEffect, useState, useCallback } from 'react';
import { BattleState, Command } from '@/games/carrot-card-demo/types';
import { combatService } from '@/games/carrot-card-demo/services/combatService';
import { aiService } from '@/games/carrot-card-demo/services/aiService';
import { BattleInterface } from '@/games/carrot-card-demo/components/BattleInterface';

export function GameContainer() {
	const [battleState, setBattleState] = useState<BattleState | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const initializeGame = useCallback(() => {
		setIsLoading(true);
		const initialState = combatService.initializeGame();
		setBattleState(initialState);
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

		const newState = { ...battleState };
		newState.playerCommand = command;
		newState.enemyCommand = aiService.selectEnemyCommand(newState);
		newState.phase = 'commit';

		setBattleState(newState);

		setTimeout(() => {
			const resolvedState = combatService.processTurn(newState);
			setBattleState(resolvedState);
		}, 1000);
	}, [battleState]);

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
			const randomCommand = battleState.player.commands[
				Math.floor(Math.random() * battleState.player.commands.length)
			];
			handleCommandSelect(randomCommand);
		}
	}, [battleState, handleCommandSelect]);

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
				onCommandSelect={handleCommandSelect}
				onGameStart={handleGameStart}
				onRestart={handleRestart}
			/>
		</div>
	);
} 