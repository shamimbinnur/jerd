import React from 'react';
import {loadProjectConfig, writeProjectConfig} from './project-config.js';

type CompleteProjectInitInput = {
	readonly editor: string;
	readonly name: string;
};

export const useProjectSettings = (configDirectory: string) => {
	const [editor, setEditor] = React.useState<string>();
	const [isLoaded, setIsLoaded] = React.useState(false);
	const [userName, setUserName] = React.useState<string>();

	React.useEffect(() => {
		let isMounted = true;

		void loadProjectConfig(configDirectory)
			.then(config => {
				if (!isMounted) {
					return;
				}

				if (typeof config.name === 'string') {
					setUserName(config.name);
				}

				if (typeof config.editor === 'string') {
					setEditor(config.editor);
				}

				setIsLoaded(true);
			})
			.catch(() => {
				if (isMounted) {
					setIsLoaded(true);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [configDirectory]);

	const completeProjectInit = React.useCallback(
		async ({editor, name}: CompleteProjectInitInput) => {
			const config = await writeProjectConfig({
				directory: configDirectory,
				editor,
				name,
			});
			setEditor(typeof config.editor === 'string' ? config.editor : editor);
			setUserName(typeof config.name === 'string' ? config.name : name);
		},
		[configDirectory],
	);

	return React.useMemo(
		() => ({
			completeProjectInit,
			editor,
			isLoaded,
			userName,
		}),
		[completeProjectInit, editor, isLoaded, userName],
	);
};
