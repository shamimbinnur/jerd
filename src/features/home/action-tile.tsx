import {Box, Text} from 'ink';
import {colors} from '../../shared/theme/colors.js';

// Pad every label to the same width so each action tile keeps a stable split
// between the action name and shortcut badge.
const actionLabelWidth = 8;

type Props = {
	readonly label: string;
	readonly shortcut: string;
};

export default function ActionTile({label, shortcut}: Props) {
	return (
		<Box
			borderColor={colors.borderPrimary}
			height={3}
			borderStyle="round"
			width={16}
		>
			<Box flexGrow={1} justifyContent="center">
				<Text color={colors.typoPrimary}>
					{` ${label.padEnd(actionLabelWidth, ' ')} `}
				</Text>
			</Box>

			<Box justifyContent="center">
				<Text backgroundColor={colors.primary} color={colors.typoPrimary}>
					{` [${shortcut}] `}
				</Text>
			</Box>
		</Box>
	);
}
