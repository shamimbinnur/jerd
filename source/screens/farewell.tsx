import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';

type Props = {
	readonly isComplete: boolean;
	readonly progressRatio: number;
	readonly secondsRemaining: number;
};

const totalBlocks = 24;

export default function Farewell({
	isComplete,
	progressRatio,
	secondsRemaining,
}: Props) {
	const normalizedRatio = Math.max(0, Math.min(1, progressRatio));
	const remainingBlocks = isComplete
		? 0
		: Math.ceil(normalizedRatio * totalBlocks);
	const elapsedBlocks = totalBlocks - remainingBlocks;

	return (
		<Box flexDirection="column" flexGrow={1} justifyContent="center">
			<Box justifyContent="center">
				{isComplete ? (
					<Text color={colors.textPrimary}>
						<Text bold color={colors.brand}>
							$jerd
						</Text>{' '}
						will keep your words warm.
					</Text>
				) : (
					<Text color={colors.textPrimary}>
						<Text bold color={colors.brand}>
							$jerd
						</Text>{' '}
						is Sad :(
					</Text>
				)}
			</Box>

			<Box justifyContent="center" marginTop={1}>
				{isComplete ? (
					<Box width={20} justifyContent="center">
						<Text color={colors.textPrimary}>
							Come back when the day has more to say!
						</Text>
					</Box>
				) : (
					<Text color={colors.textPrimary}>
						and will be left in {secondsRemaining} second
						{secondsRemaining === 1 ? '' : 's'}!
					</Text>
				)}
			</Box>

			<Box justifyContent="center" marginTop={3}>
				<Box
					borderColor={colors.panelBorder}
					borderStyle="round"
					width={totalBlocks + 2}
				>
					<Text color={colors.farewellProgressElapsed}>
						{'█'.repeat(elapsedBlocks)}
					</Text>
					<Text color={colors.brand}>{'█'.repeat(remainingBlocks)}</Text>
				</Box>
			</Box>

			<Box justifyContent="center" marginTop={3}>
				{isComplete ? (
					<Text color={colors.textHint}>See you soon.</Text>
				) : (
					<Text color={colors.textHint}>
						Press &quot;
						<Text bold color={colors.farewellBorder}>
							h
						</Text>
						&quot; - and I&apos;ll not leave :)
					</Text>
				)}
			</Box>
		</Box>
	);
}
