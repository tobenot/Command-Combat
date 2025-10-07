import { BattleState, Command } from '@/games/command-battle/types';

interface BattleInterfaceProps {
	state: BattleState;
	onCommandSelect: (command: Command) => void;
	onGameStart: () => void;
	onRestart: () => void;
}

export function BattleInterface({ state, onCommandSelect, onGameStart, onRestart }: BattleInterfaceProps) {
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

	return (
		<div className="w-full h-full bg-[#1a1a2e] text-white p-4 flex flex-col">
			{/* 状态栏 */}
			<div className="bg-[#16213e] p-4 rounded-lg mb-4">
				<div className="flex justify-between items-center mb-2">
					<div className="flex items-center space-x-4">
						<span className="font-semibold">[{state.player.name}]</span>
						<span>HP: {getHpBar(state.player.currentHp, state.player.maxHp)}</span>
						<span>气: {getMeterBar(state.player.currentMeter, state.player.maxMeter)}</span>
					</div>
					<div className="flex items-center space-x-4">
						<span className="font-semibold">[{state.enemy.name}]</span>
						<span>HP: {getHpBar(state.enemy.currentHp, state.enemy.maxHp)}</span>
						<span>气: {getMeterBar(state.enemy.currentMeter, state.enemy.maxMeter)}</span>
					</div>
				</div>
				<div className="flex justify-between items-center text-sm text-gray-300">
					<span>回合: {state.round}</span>
					<span>决策剩余时间: {state.timeRemaining}秒</span>
					<span>当前距离: [{getDistanceText(state.distance)}]</span>
				</div>
			</div>

			{/* 战斗日志 */}
			<div className="bg-[#16213e] p-4 rounded-lg mb-4 flex-1 overflow-y-auto">
				<h3 className="font-semibold mb-2">[战斗日志]</h3>
				<div className="space-y-1">
					{state.combatLog.map((log, index) => (
						<div key={index} className="text-sm">
							&gt; {log}
						</div>
					))}
				</div>
			</div>

			{/* 指令面板 */}
			<div className="bg-[#16213e] p-4 rounded-lg">
				<h3 className="font-semibold mb-3">[你的指令面板]</h3>
				<div className="grid grid-cols-3 gap-2">
					{state.player.commands.map((command) => {
						const isDisabled = command.meterCost > state.player.currentMeter || 
							!command.effectiveDistance.includes(state.distance);
						
						return (
							<button
								key={command.id}
								onClick={() => onCommandSelect(command)}
								disabled={isDisabled}
								className={`p-2 text-sm rounded border ${
									isDisabled 
										? 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed' 
										: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
								}`}
								title={command.description}
							>
								{command.name}
								{command.meterCost > 0 && (
									<div className="text-xs text-yellow-300">
										气: {command.meterCost}
									</div>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
