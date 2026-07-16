import {Box, Text} from 'ink';
import {colors} from '../../shared/theme/colors.js';
import Header from '../../shared/ui/header.js';

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
		<Box flexDirection="column" flexGrow={1}>
			<Header heading={isComplete ? 'Until next time' : 'Setup cancelled'} />

			<Box
				alignItems="center"
				flexDirection="column"
				flexGrow={1}
				justifyContent="center"
			>
				{isComplete ? (
					<Text color={colors.typoPrimary}>Your words will be here.</Text>
				) : (
					<Text color={colors.typoPrimary}>
						Jerd will close in {secondsRemaining} second
						{secondsRemaining === 1 ? '' : 's'}.
					</Text>
				)}

				{isComplete ? (
					<Box justifyContent="center" marginTop={1} width={32}>
						<Text color={colors.typoPrimary}>
							Come back when the day has more to say.
						</Text>
					</Box>
				) : undefined}

				<Box justifyContent="center" marginTop={2}>
					<Box
						borderColor={colors.borderPrimary}
						borderStyle="round"
						width={totalBlocks + 2}
					>
						<Text color={colors.typoDisabled}>
							{'█'.repeat(elapsedBlocks)}
						</Text>
						<Text color={colors.primary}>
							{'█'.repeat(remainingBlocks)}
						</Text>
					</Box>
				</Box>
			</Box>

			<Box>
				{isComplete ? (
					<Text color={colors.typoTertiary}>See you soon.</Text>
				) : (
					<Text color={colors.typoTertiary}>
						Press H to return to setup
					</Text>
				)}
			</Box>
		</Box>
	);
}
