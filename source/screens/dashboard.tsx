import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';

export default function Dashboard() {
	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box flexDirection="column">
				<Box marginBottom={1}>
					<Text bold color={colors.brand}>
						$jerd
					</Text>
				</Box>
				<Text color={colors.textMuted}>Your journal desk is open</Text>
			</Box>

			<Box flexDirection="column" marginTop={5}>
				<Box justifyContent="center">
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
							Current Writing Streak
						</Text>
						<Box marginTop={1}>
							<Text color={colors.successAccent}>Today</Text>
						</Box>
					</Box>
				</Box>
			</Box>

			<Box flexDirection="column" marginTop={3}>
				<Box justifyContent="center">
					<Text color={colors.textHint}>Press [s] to start writing</Text>
				</Box>
			</Box>
		</Box>
	);
}
