import {Chalk} from 'chalk';
import {Box, Text} from 'ink';
import {colors} from '../../theme/colors.js';
import type {HighlightRange, SearchResult} from '../../utils/journal-search.js';

type Props = {
	readonly isOpening: boolean;
	readonly results: readonly SearchResult[];
	readonly selectedIndex: number;
};

const maxVisibleResults = 12;
const resultWidth = 43;
const separator = '-'.repeat(resultWidth);
const terminalColors = new Chalk({level: 3});

const colorText = (text: string, color: string) =>
	terminalColors.hex(color)(text);

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
	const segments: string[] = [];

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
				colorText(line.slice(cursor, boundedStart), colors.textHint),
			);
		}

		segments.push(
			colorText(line.slice(boundedStart, boundedEnd), colors.successAccent),
		);
		cursor = boundedEnd;
	}

	if (cursor < line.length) {
		segments.push(colorText(line.slice(cursor), colors.textHint));
	}

	return segments.join('');
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
							{isSelected ? '> ' : ''}
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
