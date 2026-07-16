import React from 'react';
import {useInput} from 'ink';

export type ProjectEditor = 'nano' | 'vim' | 'nvim';

export type ProjectInitSubmitInput = {
	readonly editor: ProjectEditor;
	readonly name: string;
};

export const editorOptions = ['nano', 'vim', 'nvim'] as const;

const formatSubmitError = (error: unknown) =>
	error instanceof Error ? error.message : 'Could not save project config';

export const useProjectInitForm = ({
	onSubmitProject,
}: {
	readonly onSubmitProject?: (
		input: ProjectInitSubmitInput,
	) => void | Promise<void>;
}) => {
	const [errorMessage, setErrorMessage] = React.useState<string>();
	const [name, setName] = React.useState<string>();
	const [selectedEditorIndex, setSelectedEditorIndex] = React.useState(2);
	const [submittedProject, setSubmittedProject] =
		React.useState<ProjectInitSubmitInput>();

	const submitName = React.useCallback((inputName: string) => {
		const trimmedName = inputName.trim();
		setErrorMessage(undefined);

		if (!trimmedName) {
			setErrorMessage('Name is required');
			return;
		}

		setName(trimmedName);
	}, []);

	const submitProject = React.useCallback(
		(editor: ProjectEditor = editorOptions[selectedEditorIndex] ?? 'nvim') => {
			if (!name) {
				setErrorMessage('Name is required');
				return;
			}

			const project = {editor, name};
			setErrorMessage(undefined);
			setSubmittedProject(project);
			void Promise.resolve(onSubmitProject?.(project)).catch(
				(error: unknown) => {
					setSubmittedProject(undefined);
					setErrorMessage(formatSubmitError(error));
				},
			);
		},
		[name, onSubmitProject, selectedEditorIndex],
	);

	useInput((input, key) => {
		if (!name || submittedProject) {
			return;
		}

		const editorIndex = Number(input) - 1;
		if (editorOptions[editorIndex]) {
			setSelectedEditorIndex(editorIndex);
			submitProject(editorOptions[editorIndex]);
			return;
		}

		if (key.leftArrow || key.upArrow) {
			setSelectedEditorIndex(currentIndex => Math.max(currentIndex - 1, 0));
			return;
		}

		if (key.rightArrow || key.downArrow) {
			setSelectedEditorIndex(currentIndex =>
				Math.min(currentIndex + 1, editorOptions.length - 1),
			);
			return;
		}

		if (key.return) {
			submitProject();
		}
	});

	return {
		errorMessage,
		name,
		selectedEditorIndex,
		submittedProject,
		submitName,
		submitProject,
	};
};
