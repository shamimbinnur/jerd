import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';

type Props = {
	readonly selectedOption: 'yes' | 'no';
};

export default function InitConfirmation({selectedOption}: Props) {
	const isYesSelected = selectedOption === 'yes';

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box flexDirection="column">
				<Box marginBottom={1}>
					<Text bold color={colors.brand}>
						$jerd
					</Text>
				</Box>
				<Text color={colors.textMuted}>
					Jerd is a zero-friction, terminal-first journaling tool
				</Text>
			</Box>

			<Box flexDirection="column" marginTop={5}>
				<Box justifyContent="center">
					<Text color={colors.textPrimary}>Fresh start, huh?</Text>
				</Box>

				<Box justifyContent="center" marginTop={1}>
					<Box
						alignItems="center"
						borderColor={colors.panelBorder}
						borderStyle="round"
						flexDirection="column"
						paddingX={3}
						paddingY={1}
						width={30}
					>
						<Text bold color={colors.textPrimary}>
							Initiate now?
						</Text>

						<Box marginTop={1}>
							<Box
								borderColor={
									isYesSelected
										? colors.optionYesBorderActive
										: colors.optionBorderInactive
								}
								borderStyle="round"
								marginRight={3}
							>
								<Text
									color={
										isYesSelected
											? colors.optionYesTextActive
											: colors.optionTextInactive
									}
								>
									{' Yes [y] '}
								</Text>
							</Box>

							<Box
								borderColor={
									isYesSelected
										? colors.optionNoBorderInactive
										: colors.optionNoBorderActive
								}
								borderStyle="round"
							>
								<Text
									color={
										isYesSelected
											? colors.optionTextInactive
											: colors.optionNoTextActive
									}
								>
									{' No [n] '}
								</Text>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>

			<Box flexDirection="column" marginTop={3}>
				<Box justifyContent="center">
					<Text color={colors.textHint}>← → arrow keys to navigate</Text>
				</Box>
				<Box justifyContent="center">
					<Text color={colors.textHint}>or press assigned keys</Text>
				</Box>
			</Box>
		</Box>
	);
}
