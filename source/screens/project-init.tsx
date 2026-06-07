import {TextInput} from '@inkjs/ui';
import {Box, Text} from 'ink';
import {
	editorOptions,
	useProjectInitForm,
	type ProjectInitSubmitInput,
} from '../hooks/use-project-init-form.js';
import {colors} from '../theme/colors.js';

type Props = {
	readonly nextStepCommand?: string;
	readonly onSubmitProject?: (
		input: ProjectInitSubmitInput,
	) => void | Promise<void>;
};

export default function ProjectInit({nextStepCommand, onSubmitProject}: Props) {
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
			<Box flexDirection="column">
				<Box marginBottom={1}>
					<Text bold color={colors.brand}>
						$jerd
					</Text>
				</Box>
				<Text color={colors.textMuted}>Initiate a jerd project directory</Text>
			</Box>

			<Box flexDirection="column" marginTop={5}>
				<Box justifyContent="center">
					<Text color={colors.textPrimary}>Project setup</Text>
				</Box>

				<Box justifyContent="center" marginTop={1}>
					<Box
						borderColor={colors.panelBorder}
						borderStyle="round"
						flexDirection="column"
						paddingX={3}
						paddingY={1}
						width={32}
					>
						<Text bold color={colors.textPrimary}>
							Name
						</Text>

						{name ? (
							<Box marginTop={1}>
								<Text color={colors.textHint}>{name}</Text>
							</Box>
						) : (
							<Box
								borderColor={colors.optionBorderInactive}
								borderStyle="round"
								marginTop={1}
								paddingX={1}
							>
								<TextInput
									placeholder="Enter your name..."
									onSubmit={submitName}
								/>
							</Box>
						)}

						{name ? (
							<Box flexDirection="column" marginTop={2}>
								<Text bold color={colors.textPrimary}>
									Default editor
								</Text>

								<Box gap={1} marginTop={1}>
									{editorOptions.map((editor, index) => {
										const isSelected = index === selectedEditorIndex;

										return (
											<Box
												key={editor}
												borderColor={
													isSelected
														? colors.optionYesBorderActive
														: colors.optionBorderInactive
												}
												borderStyle="round"
											>
												<Text
													color={
														isSelected
															? colors.optionYesTextActive
															: colors.optionTextInactive
													}
												>
													{` ${String(index + 1)} ${editor} `}
												</Text>
											</Box>
										);
									})}
								</Box>
							</Box>
						) : null}

						{errorMessage ? (
							<Box marginTop={1}>
								<Text color={colors.optionNoTextActive}>{errorMessage}</Text>
							</Box>
						) : null}
					</Box>
				</Box>
			</Box>

			<Box flexDirection="column" marginTop={3}>
				{submittedProject ? (
					<Box justifyContent="center">
						<Text color={colors.textHint}>
							Saved: {submittedProject.name} / {submittedProject.editor}
						</Text>
					</Box>
				) : null}

				<Box justifyContent="center">
					<Text color={colors.textHint}>
						{name
							? nextStepCommand
								? 'Press enter to save and exit'
								: 'Press enter to continue'
							: 'Press enter to continue'}
					</Text>
				</Box>
			</Box>
		</Box>
	);
}
