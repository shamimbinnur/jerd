import {Box, Text} from 'ink';
import {colors} from '../theme/colors.js';
import type {SearchResult} from '../utils/journal-search.js';

type Props = {
	readonly isOpening: boolean;
	readonly results: readonly SearchResult[];
	readonly selectedIndex: number;
};

const maxVisibleResults = 12;

export default function SearchResultList({
	isOpening,
	results,
	selectedIndex,
}: Props) {
	if (isOpening) {
		return <Text color={colors.textHint}>Opening entry...</Text>;
	}

	if (results.length === 0) {
		return <Text color={colors.textHint}>No entry found.</Text>;
	}

	const visibleResults = results.slice(0, maxVisibleResults);

	return (
		<>
			{visibleResults.map((result, index) => {
				const isSelected = index === selectedIndex;
				return (
					<Box
						key={result.path}
						marginBottom={index === visibleResults.length - 1 ? 0 : 1}
					>
						<Text color={isSelected ? colors.brand : colors.textHint}>
							{isSelected ? '> ' : '  '}
							{result.date} | {result.preview}
						</Text>
					</Box>
				);
			})}
		</>
	);
}
