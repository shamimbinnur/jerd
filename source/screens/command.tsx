import {TextInput} from '@inkjs/ui';
import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';
import {getGreeting} from '../utils/greeting.js';

type Props = {
	readonly now?: Date;
	readonly userName: string;
};

export default function Command({now = new Date(), userName}: Props) {
	const [lastCommand, setLastCommand] = React.useState<string>();

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box flexDirection="column">
				<Box marginBottom={1}>
					<Text bold color={colors.brand}>
						$jerd
					</Text>
				</Box>
				<Text color={colors.textPrimary}>
					{getGreeting(now)}, {userName}
				</Text>
			</Box>

			<Box flexDirection="column" marginTop={5}>
				<Box justifyContent="center">
					<Box
						borderColor={colors.panelBorder}
						borderStyle="round"
						flexDirection="column"
						paddingX={2}
						paddingY={1}
						width={32}
					>
						<Box>
							<Text color={colors.brand}>:</Text>
							<TextInput
								placeholder="Type a command..."
								onSubmit={command => {
									setLastCommand(command);
								}}
							/>
						</Box>

						{lastCommand ? (
							<Box marginTop={1}>
								<Text color={colors.textHint}>Last: {lastCommand}</Text>
							</Box>
						) : null}
					</Box>
				</Box>
			</Box>

			<Box flexDirection="column" marginTop={3}>
				<Box justifyContent="center">
					<Text color={colors.textHint}>Mode: command</Text>
				</Box>
				<Box justifyContent="center">
					<Text color={colors.textHint}>jk toggles command/visual mode</Text>
				</Box>
			</Box>
		</Box>
	);
}
