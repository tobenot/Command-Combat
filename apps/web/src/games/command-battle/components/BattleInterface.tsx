import { useEffect, useRef } from 'react';
import { BattleState, Command } from '@/games/command-battle/types';
import { inputService } from '@/games/command-battle/services/inputService';

interface BattleInterfaceProps {
	state: BattleState;
	onCommandSelect: (command: Command) => void;
	onGameStart: () => void;
	onRestart: () => void;
}

export function BattleInterface({ state, onCommandSelect, onGameStart, onRestart }: BattleInterfaceProps) {
	const combatLogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (combatLogRef.current) {
			combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
		}
	}, [state.combatLog]);
	const getHpBar = (current: number, max: number) => {
		const percentage = (current / max) * 100;
		const filled = Math.ceil(percentage / 10);
		const empty = 10 - filled;
		return '█'.repeat(filled) + '░'.repeat(empty);
	};

	const getMeterBar = (current: number, max: number) => {
		const percentage = (current / max) * 100;
		const filled = Math.ceil(percentage / 10);
		const empty = 10 - filled;
		return '█'.repeat(filled) + '░'.repeat(empty);
	};

	const getDistanceText = (distance: string) => {
		switch (distance) {
			case 'near': return '近距离';
			case 'mid': return '中距离';
			case 'far': return '远距离';
			default: return distance;
		}
	};

	const getCommandEmoji = (commandType: string) => {
		switch (commandType) {
			case 'light_attack': return '⚡';
			case 'heavy_attack': return '💥';
			case 'throw': return '🤜';
			case 'block': return '🛡️';
			case 'advance': return '➡️';
			case 'retreat': return '⬅️';
			case 'special': return '✨';
			default: return '⚔️';
		}
	};

	if (state.gameStatus === 'menu') {
		return (
			<div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] text-white">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-8">指令对决：起源</h1>
					<p className="text-lg mb-8">通过预判AI的行动，使用克制的指令来取得胜利</p>
					<button
						onClick={onGameStart}
						className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold"
					>
						开始试炼
					</button>
				</div>
			</div>
		);
	}

	if (state.gameStatus === 'victory') {
		return (
			<div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] text-white">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-8 text-green-400">胜利！</h1>
					<p className="text-lg mb-8">你成功完成了试炼！</p>
					<button
						onClick={onRestart}
						className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-semibold"
					>
						重新开始
					</button>
				</div>
			</div>
		);
	}

	if (state.gameStatus === 'defeat') {
		return (
			<div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] text-white">
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-8 text-red-400">失败</h1>
					<p className="text-lg mb-8">你被击败了，但不要放弃！</p>
					<button
						onClick={onRestart}
						className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg text-xl font-semibold"
					>
						重新挑战
					</button>
				</div>
			</div>
		);
	}

	const getDistanceVisualization = (distance: string) => {
		switch (distance) {
			case 'near':
				return (
					<div className="flex items-center justify-center space-x-2">
						<div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-black font-bold">⚔️</div>
						<div className="w-16 h-1 bg-red-400"></div>
						<div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-black font-bold">⚔️</div>
					</div>
				);
			case 'mid':
				return (
					<div className="flex items-center justify-center space-x-2">
						<div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">⚔️</div>
						<div className="w-24 h-1 bg-yellow-400"></div>
						<div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">⚔️</div>
					</div>
				);
			case 'far':
				return (
					<div className="flex items-center justify-center space-x-2">
						<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">⚔️</div>
						<div className="w-32 h-1 bg-green-400"></div>
						<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">⚔️</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div className="w-full h-full bg-[#1a1a2e] text-white flex flex-col">
			{/* 顶部状态栏 - 扁平化 */}
			<div className="bg-[#16213e] px-4 py-2 border-b border-gray-600">
				<div className="flex justify-between items-center">
					{/* 玩家状态 */}
					<div className="flex items-center space-x-6">
						<div className="flex items-center space-x-2">
							<span className="font-bold text-blue-300">[{state.player.name}]</span>
							<span className="text-red-300">HP: {getHpBar(state.player.currentHp, state.player.maxHp)}</span>
							<span className="text-yellow-300">气: {getMeterBar(state.player.currentMeter, state.player.maxMeter)}</span>
						</div>
					</div>
					
					{/* 中央信息 */}
					<div className="flex items-center space-x-4 text-sm">
						<span className="text-gray-300">回合: {state.round}</span>
						<span className="text-orange-300">时间: {state.timeRemaining}秒</span>
						<span className="text-green-300">距离: {getDistanceText(state.distance)}</span>
					</div>
					
					{/* 敌人状态 */}
					<div className="flex items-center space-x-2">
						<span className="text-yellow-300">气: {getMeterBar(state.enemy.currentMeter, state.enemy.maxMeter)}</span>
						<span className="text-red-300">HP: {getHpBar(state.enemy.currentHp, state.enemy.maxHp)}</span>
						<span className="font-bold text-red-300">[{state.enemy.name}]</span>
					</div>
				</div>
			</div>

		{/* 主内容区域 - 左右各一半 */}
		<div className="flex-1 flex min-h-0">
			{/* 左侧：战斗日志 */}
			<div className="w-1/2 bg-[#16213e] border-r border-gray-600 p-3 overflow-y-auto min-h-0" ref={combatLogRef}>
					<div className="text-sm font-semibold text-gray-300 mb-2">[战斗日志]</div>
					<div className="space-y-1">
						{state.combatLog.map((log, index) => {
							const isImportant = log.includes('HP') || log.includes('胜利') || log.includes('败北');
							const isDamage = log.includes('HP');
							const isVictory = log.includes('胜利');
							const isDefeat = log.includes('败北');
							
							return (
								<div 
									key={index} 
									className={`text-xs ${
										isImportant ? 'font-semibold' : ''
									} ${
										isDamage ? 'text-yellow-300' : ''
									} ${
										isVictory ? 'text-green-400' : ''
									} ${
										isDefeat ? 'text-red-400' : ''
									}`}
								>
									{log}
								</div>
							);
						})}
					</div>
				</div>

		{/* 右侧：控制面板 */}
		<div className="w-1/2 bg-[#16213e] flex flex-col min-h-0">
					{/* 距离可视化 */}
					<div className="p-3 border-b border-gray-600">
						<div className="text-sm font-semibold text-gray-300 mb-2">[战场距离]</div>
						<div className="flex items-center justify-center mb-2">
							{getDistanceVisualization(state.distance)}
						</div>
						<div className="text-xs text-center text-gray-400">
							{state.player.name} ← {getDistanceText(state.distance)} → {state.enemy.name}
						</div>
					</div>

					{/* 输入序列 */}
					<div className="p-3 border-b border-gray-600">
						<div className="text-sm font-semibold text-gray-300 mb-2">[搓招输入]</div>
						<div className="text-center">
							<div className="text-lg font-mono text-yellow-300 min-h-[1.5rem]">
								{inputService.getSequenceDisplay() || '等待输入...'}
							</div>
							<div className="text-xs text-gray-400 mt-1">
								动作: W Q S A D | 攻击: U I J K | 投技: U+I | 特殊: L
							</div>
						</div>
					</div>

				{/* 指令面板 - 可滑动 */}
				<div className="flex-1 p-3 overflow-y-auto min-h-0">
						<div className="text-sm font-semibold text-gray-300 mb-2">[指令面板]</div>
						<div className="grid grid-cols-2 gap-2">
							{state.player.commands.map((command) => {
								const isDisabled = command.meterCost > state.player.currentMeter || 
									!command.effectiveDistance.includes(state.distance);
								
								return (
									<button
										key={command.id}
										onClick={() => onCommandSelect(command)}
										disabled={isDisabled}
										className={`p-3 text-sm rounded border ${
											isDisabled 
												? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed' 
												: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 active:bg-blue-800'
										}`}
										title={command.description}
									>
										<div className="flex items-center justify-center space-x-1">
											<span className="text-base">{getCommandEmoji(command.type)}</span>
											<span className="truncate">{command.name}</span>
										</div>
										<div className="flex justify-between items-center text-xs mt-1">
											{command.meterCost > 0 && (
												<span className="text-yellow-300">
													气: {command.meterCost}
												</span>
											)}
											{command.keyboardShortcut && (
												<span className="text-gray-300 bg-gray-700 px-1 rounded text-xs">
													{command.keyboardShortcut}
												</span>
											)}
										</div>
										{command.isCombo && (
											<div className="text-xs text-green-300 mt-1 text-center">
												连招
											</div>
										)}
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
