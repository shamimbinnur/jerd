import React from 'react';
import {Box, Text} from 'ink';
import {colors} from '../theme/colors.js';

type Props = {
	readonly children: React.ReactNode;
};

const innerHeight = 27;
const contentPaddingX = 1;
const bindingPattern = ['⊂⊃┆', '│ ┆', '⊂⊃┆', '  ┆'] as const;
const spiral = Array.from({length: innerHeight}, (_, position) => ({
	id: `spiral-tick-${position}`,
	value: bindingPattern[position % bindingPattern.length] ?? bindingPattern[0],
}));

export default function MainFrame({children}: Props) {
	return (
		<Box justifyContent="center" width="100%">
			<Box
				borderColor={colors.brand}
				paddingRight={2}
				borderStyle="round"
				flexDirection="column"
				height={innerHeight + 2}
				width={44}
			>
				<Box flexDirection="row" gap={1} height={innerHeight} width="100%">
					<Box alignItems="center" flexDirection="column" width={4}>
						{spiral.map(tick => (
							<Text key={tick.id} color={colors.spiral}>
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
