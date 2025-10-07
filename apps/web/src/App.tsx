import { GameContainer } from './games/carrot-card-demo/components/GameContainer';
import { GameShell } from '@ui/GameShell';

function App() {
	return (
		<GameShell orientation="landscape">
			<GameContainer />
		</GameShell>
	);
}

export default App;