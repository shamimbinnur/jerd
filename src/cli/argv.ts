export const normalizeCliArgv = (argv: readonly string[]) =>
	argv.map(argument => {
		if (argument === '-mood') {
			return '--mood';
		}

		if (argument.startsWith('-mood=')) {
			return `--mood=${argument.slice('-mood='.length)}`;
		}

		return argument;
	});
