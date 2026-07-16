import {TextInput} from '@inkjs/ui';
import {Box, Text} from 'ink';
import {colors} from '../../shared/theme/colors.js';
import Header from '../../shared/ui/header.js';
import {
	editorOptions,
	useProjectInitForm,
	type ProjectInitSubmitInput,
} from './use-project-init-form.js';

type Props = {
	readonly nextStepCommand?: string;
	readonly onSubmitProject?: (
		input: ProjectInitSubmitInput,
	) => void | Promise<void>;
};

export default function ProjectInit({onSubmitProject}: Props) {
	const {
		errorMessage,
		name,
		selectedEditorIndex,
		submittedProject,
		submitName,
	} = useProjectInitForm({
		onSubmitProject,
	});

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Header heading="Project setup" />

			<Box justifyContent="space-between" marginBottom={1} marginTop={1}>
				<Text color={colors.typoSecondary}>Project details</Text>
				<Text color={colors.typoTertiary}>
					{name ? '2 of 2' : '1 of 2'}
				</Text>
			</Box>

			<Box
				borderColor={colors.borderPrimary}
				borderStyle="round"
				flexDirection="column"
				paddingX={2}
				paddingY={1}
			>
				<Text color={colors.typoSecondary}>Your name</Text>

				{name ? (
					<Box marginTop={1}>
						<Text color={colors.typoPositive}>✓ {name}</Text>
					</Box>
				) : (
					<Box
						borderColor={colors.borderPrimary}
						borderStyle="round"
						marginTop={1}
						paddingX={1}
					>
						<TextInput placeholder="Type your name" onSubmit={submitName} />
					</Box>
				)}

				{name ? (
					<Box flexDirection="column" marginTop={2}>
						<Text color={colors.typoSecondary}>Default editor</Text>

						<Box gap={1} marginTop={1}>
							{editorOptions.map((editor, index) => {
								const isSelected = index === selectedEditorIndex;

								return (
									<Box key={editor}>
										<Text
											bold={isSelected}
											color={
												isSelected ? colors.primary : colors.typoTertiary
											}
											inverse={isSelected}
										>
											{` ${String(index + 1)} ${editor} `}
										</Text>
									</Box>
								);
							})}
						</Box>
					</Box>
				) : undefined}

				{errorMessage ? (
					<Box marginTop={1}>
						<Text color={colors.primary}>{errorMessage}</Text>
					</Box>
				) : undefined}
			</Box>

			{submittedProject ? (
				<Box marginTop={1}>
					<Text color={colors.typoPositive}>
						Saved {submittedProject.name} · {submittedProject.editor}
					</Text>
				</Box>
			) : undefined}

			<Box flexGrow={1} />

			<Box flexDirection="column">
				<Text color={colors.typoTertiary}>
					{name
						? '←/→ choose editor · Enter save'
						: 'Type your name · Enter continue'}
				</Text>
				{name ? (
					<Text color={colors.typoDisabled}>
						Press 1/2/3 to choose and save quickly
					</Text>
				) : undefined}
			</Box>
		</Box>
	);
}
