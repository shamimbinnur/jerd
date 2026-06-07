import {Box} from 'ink';
import ActionTile from '../action-tile.js';

const actions = [
	{id: 'write', label: 'Write', shortcut: 'w'},
	{id: 'find', label: 'Find', shortcut: 'f'},
	{id: 'calendar', label: 'Cal', shortcut: 'c'},
	{id: 'mood', label: 'Mood', shortcut: 'm'},
] as const;

export default function ActionGrid() {
	return (
		<Box justifyContent="center" marginTop={2}>
			<Box flexDirection="column" gap={2}>
				<Box gap={1}>
					<ActionTile label={actions[0].label} shortcut={actions[0].shortcut} />
					<ActionTile label={actions[1].label} shortcut={actions[1].shortcut} />
				</Box>

				<Box gap={1}>
					<ActionTile label={actions[2].label} shortcut={actions[2].shortcut} />
					<ActionTile label={actions[3].label} shortcut={actions[3].shortcut} />
				</Box>
			</Box>
		</Box>
	);
}
