import type {JournalMood} from '../../core/journal/frontmatter.js';

// Order matters: keyboard navigation and the mood selector both use these
// positions when moving through the available mood choices.
export const moodOptions: Array<{
	readonly label: string;
	readonly mood: JournalMood;
	readonly symbol: string;
}> = [
	{label: 'Calm', mood: 'calm', symbol: 'C'},
	{label: 'Happy', mood: 'happy', symbol: 'H'},
	{label: 'Sad', mood: 'sad', symbol: 'S'},
	{label: 'Anxious', mood: 'anxious', symbol: 'X'},
	{label: 'Angry', mood: 'angry', symbol: 'A'},
];
