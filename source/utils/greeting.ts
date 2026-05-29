export const getGreeting = (date: Date) => {
	const hour = date.getHours();

	if (hour < 12) {
		return 'Good morning';
	}

	if (hour < 17) {
		return 'Good noon';
	}

	return 'Good evening';
};
