import type {JournalMood} from '../../utils/journal-frontmatter.js';

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
