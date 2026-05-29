import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';

export default function Success() {
	return (
		<Box flexDirection="column" flexGrow={1} justifyContent="center">
			<Box justifyContent="center">
				<Text bold color={colors.successAccent}>
					Ready.
				</Text>
			</Box>

			<Box justifyContent="center" marginTop={1}>
				<Box
					borderColor={colors.successBorder}
					borderStyle="round"
					paddingX={3}
					paddingY={1}
				>
					<Text color={colors.textPrimary}>jerd initiated</Text>
				</Box>
			</Box>
		</Box>
	);
}
