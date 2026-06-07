import {Box, Text} from 'ink';
import {colors} from '../theme/colors.js';

const actionLabelWidth = 8;

type Props = {
	readonly label: string;
	readonly shortcut: string;
};

export default function ActionTile({label, shortcut}: Props) {
	return (
		<Box
			borderColor={colors.panelBorder}
			height={3}
			borderStyle="round"
			width={16}
		>
			<Box flexGrow={1} justifyContent="center">
				<Text
					backgroundColor={colors.homeActionBackground}
					color={colors.homeActionText}
				>
					{` ${label.padEnd(actionLabelWidth, ' ')} `}
				</Text>
			</Box>

			<Box justifyContent="center">
				<Text
					backgroundColor={colors.homeActionKeyBackground}
					color={colors.homeActionText}
				>
					{` [${shortcut}] `}
				</Text>
			</Box>
		</Box>
	);
}
