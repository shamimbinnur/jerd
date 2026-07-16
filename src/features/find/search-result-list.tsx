import type React from 'react';
import {Box, Text} from 'ink';
import {colors} from '../../shared/theme/colors.js';
import type {HighlightRange, SearchResult} from './search.js';

type Props = {
	readonly isOpening: boolean;
	readonly results: readonly SearchResult[];
	readonly selectedDate: string | undefined;
	readonly selectedIndex: number;
};

const maxVisibleResults = 2;

// Keep this aligned with the frame content width so wrapped match snippets do
// not trigger Ink's automatic wrapping.
const resultWidth = 41;
const selectedResultMarker = '➜ ';

// Preserve each wrapped row's original start offset so highlight ranges from
// the full match line can still be projected onto the visible row.
const wrapLine = (line: string, width: number) => {
	const rows: Array<{start: number; text: string}> = [];
	let start = 0;

	while (start < line.length) {
		const remaining = line.length - start;
		if (remaining <= width) {
			rows.push({start, text: line.slice(start)});
			break;
		}

		const hardEnd = start + width;
		const wrappedEnd = line.lastIndexOf(' ', hardEnd);
		const end = wrappedEnd > start ? wrappedEnd : hardEnd;
		rows.push({start, text: line.slice(start, end).trimEnd()});
		start = end;

		while (line[start] === ' ') {
			start++;
		}
	}

	return rows;
};

const renderHighlightedLine = (
	line: string,
	ranges: readonly HighlightRange[],
	offset = 0,
) => {
	let cursor = 0;
	const segments: React.JSX.Element[] = [];

	for (const range of ranges) {
		const start = range.start - offset;
		const end = range.end - offset;

		if (end <= 0 || start >= line.length) {
			continue;
		}

		const boundedStart = Math.max(start, 0);
		const boundedEnd = Math.min(end, line.length);

		if (boundedStart > cursor) {
			segments.push(
				<Text key={`text-${cursor}`} color={colors.typoMuted}>
					{line.slice(cursor, boundedStart)}
				</Text>,
			);
		}

		segments.push(
			<Text key={`match-${boundedStart}`} color={colors.typoPositive}>
				{line.slice(boundedStart, boundedEnd)}
			</Text>,
		);
		cursor = boundedEnd;
	}

	if (cursor < line.length) {
		segments.push(
			<Text key={`text-${cursor}`} color={colors.typoSecondary}>
				{line.slice(cursor)}
			</Text>,
		);
	}

	return segments;
};

export default function SearchResultList({
	isOpening,
	results,
	selectedDate,
	selectedIndex,
}: Props) {
	if (isOpening) {
		return <Text color={colors.typoPositive}>Opening entry...</Text>;
	}

	if (results.length === 0) {
		return (
			<Text color={colors.typoDisabled}>
				{selectedDate
					? `No journal entry exists for ${selectedDate}.`
					: 'No entry found.'}
			</Text>
		);
	}

	const firstVisibleIndex = Math.min(
		Math.max(selectedIndex - maxVisibleResults + 1, 0),
		Math.max(results.length - maxVisibleResults, 0),
	);
	const visibleResults = results.slice(
		firstVisibleIndex,
		firstVisibleIndex + maxVisibleResults,
	);

	return (
		<>
			{visibleResults.map((result, index) => {
				const resultIndex = firstVisibleIndex + index;
				const isSelected = resultIndex === selectedIndex;
				const matchRanges = result.matchRanges ?? [];
				const hasNextResult = index < visibleResults.length - 1;
				return (
					<Box
						key={result.path}
						flexDirection="column"
						marginBottom={hasNextResult ? 1 : 0}
					>
						<Text color={isSelected ? colors.primary : colors.typoMuted}>
							{isSelected ? selectedResultMarker : '  '}
							{result.date}
						</Text>
						{isSelected && result.matchLine && result.matchRanges ? (
							<Box flexDirection="column" paddingLeft={2}>
								{wrapLine(result.matchLine, resultWidth).map(row => (
									<Text key={String(row.start)}>
										{renderHighlightedLine(row.text, matchRanges, row.start)}
									</Text>
								))}
							</Box>
						) : (
							<Box paddingLeft={2}>
								<Text color={colors.typoSecondary}>{result.preview}</Text>
							</Box>
						)}
					</Box>
				);
			})}
		</>
	);
}
