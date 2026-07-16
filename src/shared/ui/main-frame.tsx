import React from 'react';
import {Box, Text} from 'ink';
import {colors} from '../theme/colors.js';

type Props = {
	readonly children: React.ReactNode;
};

const innerHeight = 27;
const contentPaddingX = 1;

// The binding pattern is repeated to fill the fixed-height frame, keeping the
// notebook spine visually stable across all screens.
const bindingPattern = ['⊂⊃┆', '│ ┆', '⊂⊃┆', '  ┆'] as const;
const spiral = Array.from({length: innerHeight}, (_, position) => ({
	id: `spiral-tick-${position}`,
	value: bindingPattern[position % bindingPattern.length] ?? bindingPattern[0],
}));

export default function MainFrame({children}: Props) {
	return (
		<Box justifyContent="center" width="100%">
			<Box
				borderColor={colors.primary}
				paddingRight={2}
				borderStyle="round"
				flexDirection="column"
				height={innerHeight + 2}
				width={54}
			>
				<Box flexDirection="row" gap={1} height={innerHeight} width="100%">
					<Box alignItems="center" flexDirection="column" width={4}>
						{spiral.map(tick => (
							<Text key={tick.id} color={colors.decorativeSpiral}>
								{tick.value}
							</Text>
						))}
					</Box>

					<Box
						flexDirection="column"
						flexGrow={1}
						paddingX={contentPaddingX}
						paddingY={1}
					>
						{children}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
