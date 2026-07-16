import {Box, Text} from 'ink';
import {colors} from '../../shared/theme/colors.js';
import Header from '../../shared/ui/header.js';

type Props = {
	readonly selectedOption: 'yes' | 'no';
};

export default function InitConfirmation({selectedOption}: Props) {
	const isYesSelected = selectedOption === 'yes';

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Header heading="Set up your journal" />

			<Box marginTop={1}>
				<Text color={colors.typoTertiary}>
					Create a Jerd project in this directory?
				</Text>
			</Box>

			<Box
				borderColor={colors.borderPrimary}
				borderStyle="round"
				flexDirection="column"
				marginTop={2}
				paddingX={2}
				paddingY={1}
			>
				<Box>
					<Text
						bold={isYesSelected}
						color={isYesSelected ? colors.primary : colors.typoSecondary}
						inverse={isYesSelected}
					>
						{isYesSelected ? '➜ ' : '  '}Yes, start setup [y]
					</Text>
				</Box>

				<Box marginTop={1}>
					<Text
						bold={!isYesSelected}
						color={!isYesSelected ? colors.primary : colors.typoSecondary}
						inverse={!isYesSelected}
					>
						{isYesSelected ? '  ' : '➜ '}No, exit Jerd [n]
					</Text>
				</Box>
			</Box>

			<Box flexGrow={1} />

			<Box>
				<Text color={colors.typoTertiary}>
					↑/↓ choose · Enter confirm · Y/N shortcut
				</Text>
			</Box>
		</Box>
	);
}
