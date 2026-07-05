import type React from 'react';
import {Box, Text} from 'ink';
import {colors} from '../../theme/colors.js';
import type {HighlightRange, SearchResult} from '../../utils/journal-search.js';

type Props = {
	readonly isOpening: boolean;
	readonly results: readonly SearchResult[];
	readonly selectedIndex: number;
};

const maxVisibleResults = 12;

// Keep this aligned with the frame content width so separators and wrapped
// match snippets do not trigger Ink's automatic wrapping.
const resultWidth = 43;
const selectedResultMarker = '➜ ';
const separator = '-'.repeat(resultWidth);

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
				<Text key={`text-${cursor}`} color={colors.textHint}>
					{line.slice(cursor, boundedStart)}
				</Text>,
			);
		}

		segments.push(
			<Text key={`match-${boundedStart}`} color={colors.successAccent}>
				{line.slice(boundedStart, boundedEnd)}
			</Text>,
		);
		cursor = boundedEnd;
	}

	if (cursor < line.length) {
		segments.push(
			<Text key={`text-${cursor}`} color={colors.textHint}>
				{line.slice(cursor)}
			</Text>,
		);
	}

	return segments;
};

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
				const matchRanges = result.matchRanges ?? [];
				const showSeparator = index < visibleResults.length - 1;
				return (
					<Box key={result.path} flexDirection="column">
						<Text color={isSelected ? colors.brand : colors.textHint}>
							{isSelected ? selectedResultMarker : ''}
							{result.date} | {result.preview}
						</Text>
						{isSelected && result.matchLine && result.matchRanges ? (
							<Box flexDirection="column" marginTop={1}>
								{wrapLine(result.matchLine, resultWidth).map(row => (
									<Text key={String(row.start)}>
										{renderHighlightedLine(row.text, matchRanges, row.start)}
									</Text>
								))}
							</Box>
						) : undefined}
						{showSeparator ? (
							<Box marginY={1}>
								<Text color={colors.panelBorder}>{separator}</Text>
							</Box>
						) : undefined}
					</Box>
				);
			})}
		</>
	);
}
