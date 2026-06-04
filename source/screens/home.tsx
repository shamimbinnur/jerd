import {Box, Text} from 'ink';
import BigText from 'ink-big-text';
import React from 'react';
import ActionTile from '../components/action-tile.js';
import {colors} from '../theme/colors.js';
import {getGreeting} from '../utils/greeting.js';

const actions = [
	{id: 'write', label: 'Write', shortcut: 'w'},
	{id: 'find', label: 'Find', shortcut: 'f'},
	{id: 'calendar', label: 'Cal', shortcut: 'c'},
	{id: 'mood', label: 'Mood', shortcut: 'm'},
] as const;

type Props = {
	readonly journalEntryCount: number;
	readonly journalStatus?: string;
	readonly now?: Date;
	readonly userName: string;
};

const formatEntryCount = (count: number) => {
	if (count < 1000) {
		return String(count);
	}

	const compact = count / 1000;
	const rounded = Math.round(compact * 10) / 10;
	return `${rounded % 1 === 0 ? String(rounded.toFixed(0)) : String(rounded)}K`;
};

export default function Home({
	journalEntryCount,
	journalStatus,
	now = new Date(),
	userName,
}: Props) {
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

			<Box flexDirection="column" marginTop={2}>
				<Box justifyContent="center">
					<Box
						alignItems="center"
						borderColor={colors.panelBorder}
						borderStyle="round"
						flexDirection="column"
						width={31}
					>
						<Text color={colors.textPrimary}>24th February 2026</Text>

						<Box
							alignItems="center"
							flexDirection="column"
							justifyContent="center"
						>
							<BigText
								colors={[colors.brand]}
								font="tiny"
								text={formatEntryCount(journalEntryCount)}
							/>
						</Box>

						<Box marginTop={1}>
							<Text color={colors.textPrimary}>Entries Recorded</Text>
						</Box>
					</Box>
				</Box>

				<Box justifyContent="center" marginTop={2}>
					<Box flexDirection="column" gap={2}>
						<Box gap={1}>
							<ActionTile
								label={actions[0].label}
								shortcut={actions[0].shortcut}
							/>
							<ActionTile
								label={actions[1].label}
								shortcut={actions[1].shortcut}
							/>
						</Box>

						<Box gap={1}>
							<ActionTile
								label={actions[2].label}
								shortcut={actions[2].shortcut}
							/>
							<ActionTile
								label={actions[3].label}
								shortcut={actions[3].shortcut}
							/>
						</Box>
					</Box>
				</Box>
			</Box>

			{journalStatus ? (
				<Box flexDirection="column" marginTop={3}>
					<Box justifyContent="center">
						<Text color={colors.successAccent}>{journalStatus}</Text>
					</Box>
				</Box>
			) : null}
		</Box>
	);
}
