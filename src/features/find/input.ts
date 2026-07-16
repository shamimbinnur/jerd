import type {Key} from 'ink';
import type {Screen} from '../../app/types.js';

export const handleFindInput = ({
	key,
	moveSelection,
	setActiveScreen,
}: {
	readonly key: Key;
	readonly moveSelection: (offset: number) => void;
	readonly setActiveScreen: (screen: Screen) => void;
}) => {
	if (key.escape) {
		setActiveScreen('home');
		return;
	}

	if (key.upArrow) {
		moveSelection(-1);
		return;
	}

	if (key.downArrow) {
		moveSelection(1);
	}
};
