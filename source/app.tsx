import process from 'node:process';
import React from 'react';
import {useInput} from 'ink';
import MainFrame from './components/main-frame.js';
import Command from './screens/command.js';
import Dashboard from './screens/dashboard.js';
import Farewell from './screens/farewell.js';
import Home from './screens/home.js';
import Init from './screens/init.js';
import Loading from './screens/loading.js';
import ProjectInit from './screens/project-init.js';
import Success from './screens/success.js';
import {loadProjectConfig, writeProjectConfig} from './utils/project-config.js';

type Screen =
	| 'confirmation'
	| 'dashboard'
	| 'farewell'
	| 'home'
	| 'init'
	| 'loading'
	| 'project-init'
	| 'success';
type InteractionMode = 'command' | 'visual';

type Props = {
	readonly configDirectory?: string;
	readonly now?: Date;
	readonly screen: Screen;
};

const screenCycle: Screen[] = [
	'home',
	'init',
	'loading',
	'confirmation',
	'success',
	'dashboard',
	'farewell',
];

export default function App({
	configDirectory = process.cwd(),
	now,
	screen,
}: Props) {
	const [activeScreen, setActiveScreen] = React.useState<Screen>(screen);
	const [interactionMode, setInteractionMode] =
		React.useState<InteractionMode>('visual');
	const [userName, setUserName] = React.useState('Shamim');
	const previousInput = React.useRef('');

	React.useEffect(() => {
		let isMounted = true;

		void loadProjectConfig(configDirectory)
			.then(config => {
				if (isMounted && typeof config.name === 'string') {
					setUserName(config.name);
				}
			})
			.catch(() => undefined);

		return () => {
			isMounted = false;
		};
	}, [configDirectory]);

	const completeProjectInit = React.useCallback(
		async (name: string) => {
			const config = await writeProjectConfig({
				directory: configDirectory,
				name,
			});
			setUserName(typeof config.name === 'string' ? config.name : name);
			setActiveScreen('home');
		},
		[configDirectory],
	);

	useInput(input => {
		if (activeScreen === 'init' || activeScreen === 'project-init') {
			return;
		}

		const normalizedInput = input?.toLowerCase() ?? '';

		if (
			activeScreen === 'home' &&
			(normalizedInput.includes('jk') ||
				(previousInput.current === 'j' && normalizedInput === 'k'))
		) {
			previousInput.current = '';
			setInteractionMode(currentMode =>
				currentMode === 'visual' ? 'command' : 'visual',
			);
			return;
		}

		previousInput.current = normalizedInput;

		if (activeScreen === 'home' && interactionMode === 'command') {
			return;
		}

		if (normalizedInput === 'c') {
			setActiveScreen(currentScreen => {
				const currentIndex = screenCycle.indexOf(currentScreen);
				const nextIndex = (currentIndex + 1) % screenCycle.length;

				return screenCycle[nextIndex] ?? 'home';
			});
		}
	});

	const activeScreenContent = (() => {
		if (activeScreen === 'home') {
			if (interactionMode === 'command') {
				return <Command now={now} userName={userName} />;
			}

			return <Home mode={interactionMode} now={now} userName={userName} />;
		}

		if (activeScreen === 'farewell') {
			return (
				<Farewell isComplete={false} progressRatio={1} secondsRemaining={1} />
			);
		}

		if (activeScreen === 'loading') {
			return <Loading frame="." />;
		}

		if (activeScreen === 'success') {
			return <Success />;
		}

		if (activeScreen === 'dashboard') {
			return <Dashboard />;
		}

		if (activeScreen === 'project-init') {
			return <ProjectInit onSubmitName={completeProjectInit} />;
		}

		return <Init onComplete={completeProjectInit} />;
	})();

	return <MainFrame>{activeScreenContent}</MainFrame>;
}
