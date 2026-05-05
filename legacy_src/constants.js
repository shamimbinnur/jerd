// Mood definitions with numeric values for graphing
export const MOOD_VALUES = {
	great: {emoji: '😊', label: 'Great', value: 5, color: '#10b981'},
	good: {emoji: '🙂', label: 'Good', value: 4, color: '#22c55e'},
	okay: {emoji: '😐', label: 'Okay', value: 3, color: '#f59e0b'},
	low: {emoji: '😔', label: 'Low', value: 2, color: '#f97316'},
};

export const MOOD_ORDER = ['great', 'good', 'okay', 'low'];

export function getMoodValue(moodStr) {
	return MOOD_VALUES[moodStr]?.value ?? null;
}

export function getMoodEmoji(moodStr) {
	return MOOD_VALUES[moodStr]?.emoji ?? '❓';
}

export function getMoodColor(moodStr) {
	return MOOD_VALUES[moodStr]?.color ?? '#6b7280';
}

export function createDefaultConfig() {
	return {
		editor: getDefaultEditor(),
		jerdPath: './jerd',
		dateFormat: 'YYYY-MM-DD',
		defaultTemplate: 'default',
	};
}

export function createDefaultTemplates() {
	return {
		templates: [
			{
				name: 'default',
				description: 'Full morning/evening reflection with goals',
				tags: ['daily', 'reflection'],
				sections: [
					{
						type: 'text',
						title: '📖 Daily Journal - {{date}}',
						content: '',
					},
					{
						type: 'text',
						title: '🌅 Morning Reflection',
						content:
							'- How do I feel this morning?\n- Top 3 priorities today:\n  1. \n  2. \n  3. ',
					},
					{
						type: 'text',
						title: '🙏 Gratitude',
						content: "- 3 things I'm grateful for today:\n  1. \n  2. \n  3. ",
					},
					{
						type: 'text',
						title: '🎯 Daily Goals',
						content: '- Goal 1: \n- Goal 2: \n- Goal 3: ',
					},
					{
						type: 'text',
						title: '🌙 Evening Reflection',
						content:
							'- Wins today: \n- How do I feel tonight? \n- Any adjustments for tomorrow?',
					},
					{
						type: 'text',
						title: '📚 What I Learned Today',
						content: '- ',
					},
					{
						type: 'text',
						title: '📌 Important Things to Remember',
						content: '- ',
					},
				],
			},
			{
				name: 'blank',
				description: 'Minimal blank template',
				sections: [
					{
						type: 'auto-date',
						title: '📅 Date',
						format: 'dddd, MMMM D, YYYY',
					},
					{
						type: 'text',
						title: '📝 Notes',
						content: '',
					},
				],
			},
		],
	};
}

export function getDefaultEditor() {
	// Respect $EDITOR environment variable if set
	if (process.env.EDITOR) {
		return process.env.EDITOR;
	}

	// Platform-specific defaults
	switch (process.platform) {
		case 'win32':
			return 'notepad';
		default:
			return 'nano';
	}
}
