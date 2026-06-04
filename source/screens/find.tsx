import {TextInput} from '@inkjs/ui';
import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';
import type {SearchResult} from '../utils/search.js';

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
	const hasResults = results.length > 0;

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
			>
				<Box width={50}>
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
					(e.g, today, yesterday, 2026-05-31, content )
				</Text>
			</Box>

			<Box flexDirection="column" marginTop={1}>
				{isOpening ? (
					<Text color={colors.textHint}>Opening entry...</Text>
				) : null}

				{hasResults
					? results.slice(0, 12).map((result, index) => {
							const isSelected = index === selectedIndex;
							return (
								<Box key={result.path}>
									<Text color={isSelected ? colors.brand : colors.textHint}>
										{isSelected ? '> ' : '  '}
										{result.date} {result.preview}
									</Text>
								</Box>
							);
					  })
					: !isOpening && <Text color={colors.textHint}>No entry found.</Text>}
			</Box>
		</Box>
	);
}
