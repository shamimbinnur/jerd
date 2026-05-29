import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';

type Props = {
	readonly frame: string;
};

export default function Loading({frame}: Props) {
	return (
		<Box flexDirection="column" flexGrow={1} justifyContent="center">
			<Box flexDirection="column">
				<Box justifyContent="center">
					<Text color={colors.textPrimary}>Setting things up</Text>
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
						<Text bold color={colors.loadingAccent}>
							{frame} Loading...
						</Text>
						<Text color={colors.textPrimary}>Preparing your first session</Text>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
