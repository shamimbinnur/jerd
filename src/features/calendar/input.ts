import type {Key} from 'ink';
import type {Screen} from '../../app/types.js';

type CalendarInput = {
	readonly key: Key;
	readonly moveSelection: (offset: number) => void;
	readonly openSelectedEntry: () => void;
	readonly setActiveScreen: (screen: Screen) => void;
};

export const handleCalendarInput = ({
	key,
	moveSelection,
	openSelectedEntry,
	setActiveScreen,
}: CalendarInput) => {
	if (key.escape) {
		setActiveScreen('home');
		return;
	}

	if (key.leftArrow) {
		moveSelection(-1);
		return;
	}

	if (key.rightArrow) {
		moveSelection(1);
		return;
	}

	if (key.upArrow) {
		moveSelection(-7);
		return;
	}

	if (key.downArrow) {
		moveSelection(7);
		return;
	}

	if (key.return) {
		openSelectedEntry();
	}
};
