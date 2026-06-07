import {TextInput} from '@inkjs/ui';
import {Box, Text} from 'ink';
import SearchResultList from '../components/search-result-list.js';
import {colors} from '../theme/colors.js';
import type {SearchResult} from '../utils/journal-search.js';

type Props = {
	readonly isOpening?: boolean;
	readonly onOpenSelected: () => void;
	readonly onQueryChange: (query: string) => void;
	readonly query: string;
	readonly results: SearchResult[];
	readonly selectedIndex: number;
};

export default function Find({
	isOpening = false,
	onOpenSelected,
	onQueryChange,
	query,
	results,
	selectedIndex,
}: Props) {
	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box marginBottom={1}>
				<Text bold color={colors.brand}>
					$jerd
				</Text>
			</Box>
			<Box marginBottom={1}>
				<Text color={colors.textPrimary}>
					Find and open your existing journal entries
				</Text>
			</Box>

			<Box
				borderColor={colors.panelBorder}
				borderStyle="round"
				flexDirection="column"
				paddingX={1}
				paddingY={1}
				width="100%"
			>
				<Box>
					<Text color={colors.brand}>/ </Text>
					<Text color={colors.textHint}>
						<TextInput
							defaultValue={query}
							placeholder="Find entries"
							onChange={onQueryChange}
							onSubmit={onOpenSelected}
						/>
					</Text>
				</Box>
				<Text color={colors.textHint}>
					(e.g. today, yesterday, 2026-05-31, content)
				</Text>
			</Box>

			<Box flexDirection="column" marginTop={1}>
				<SearchResultList
					isOpening={isOpening}
					results={results}
					selectedIndex={selectedIndex}
				/>
			</Box>
		</Box>
	);
}
