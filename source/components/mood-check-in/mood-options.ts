import type {JournalMood} from '../../utils/journal-frontmatter.js';

// Order matters: keyboard navigation and the mood selector both use these
// positions when moving through the available mood choices.
export const moodOptions: Array<{
	readonly label: string;
	readonly mood: JournalMood;
	readonly symbol: string;
}> = [
	{label: 'Happy', mood: 'happy', symbol: 'H'},
	{label: 'Calm', mood: 'calm', symbol: 'C'},
	{label: 'Neutral', mood: 'neutral', symbol: 'N'},
	{label: 'Sad', mood: 'sad', symbol: 'S'},
	{label: 'Angry', mood: 'angry', symbol: 'A'},
];
