import type {Screen} from '../../app/types.js';

export const homeQuitInputWindowMs = 750;

export const resolveHomeQuitInput = ({
	input,
	lastQuitPressAt,
	now,
}: {
	readonly input: string;
	readonly lastQuitPressAt?: number;
	readonly now: number;
}) => {
	if (input !== 'q') {
		return {
			nextQuitPressAt: undefined,
			shouldQuit: false,
		};
	}

	if (
		typeof lastQuitPressAt === 'number' &&
		now - lastQuitPressAt <= homeQuitInputWindowMs
	) {
		return {
			nextQuitPressAt: undefined,
			shouldQuit: true,
		};
	}

	return {
		nextQuitPressAt: now,
		shouldQuit: false,
	};
};

export const handleHomeInput = ({
	input,
	openCalendar,
	openFind,
	openMoodTracker,
	resetMoodCheckIn,
	setActiveScreen,
}: {
	readonly input: string;
	readonly openCalendar: () => void;
	readonly openFind: () => void;
	readonly openMoodTracker: () => void;
	readonly resetMoodCheckIn: () => void;
	readonly setActiveScreen: (screen: Screen) => void;
}) => {
	if (input === 'f') {
		openFind();
		setActiveScreen('find');
		return;
	}

	if (input === 'c') {
		openCalendar();
		setActiveScreen('calendar');
		return;
	}

	if (input === 'w') {
		resetMoodCheckIn();
		setActiveScreen('mood-check-in');
		return;
	}

	if (input === 'm') {
		openMoodTracker();
		setActiveScreen('mood-tracker');
	}
};
