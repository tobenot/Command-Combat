import { GameContainer } from './games/command-battle/components/GameContainer';
import { GameShell } from '@ui/GameShell';

function App() {
	return (
		<GameShell orientation="landscape">
			<GameContainer />
		</GameShell>
	);
}

export default App;