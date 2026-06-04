import {TextInput} from '@inkjs/ui';
import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';

type Props = {
	readonly onSubmitName?: (name: string) => void | Promise<void>;
};

export default function ProjectInit({onSubmitName}: Props) {
	const [submittedName, setSubmittedName] = React.useState<string>();
	const [errorMessage, setErrorMessage] = React.useState<string>();

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

						<Box
							borderColor={colors.optionBorderInactive}
							borderStyle="round"
							marginTop={1}
							paddingX={1}
						>
							<TextInput
								placeholder="Enter your name..."
								onSubmit={name => {
									setErrorMessage(undefined);
									setSubmittedName(name);
									void Promise.resolve(onSubmitName?.(name)).catch(
										(error: unknown) => {
											setErrorMessage(
												error instanceof Error
													? error.message
													: 'Could not save project config',
											);
										},
									);
								}}
							/>
						</Box>

						{errorMessage ? (
							<Box marginTop={1}>
								<Text color={colors.optionNoTextActive}>{errorMessage}</Text>
							</Box>
						) : null}

						{submittedName ? (
							<Box marginTop={1}>
								<Text color={colors.textHint}>Saved: {submittedName}</Text>
							</Box>
						) : null}
					</Box>
				</Box>
			</Box>

			<Box flexDirection="column" marginTop={3}>
				<Box justifyContent="center">
					<Text color={colors.textHint}>Press enter to continue</Text>
				</Box>
			</Box>
		</Box>
	);
}
