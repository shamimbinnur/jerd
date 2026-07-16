import React from 'react';
import {Box, Text, useInput} from 'ink';
import {parseJournalDateQuery} from '../../core/journal/date-query.js';
import {colors} from '../../shared/theme/colors.js';
import Header from '../../shared/ui/header.js';
import SearchResultList from './search-result-list.js';
import type {SearchResult} from './search.js';

type Props = {
	readonly isOpening?: boolean;
	readonly now?: Date;
	readonly onOpenSelected: () => void;
	readonly onQueryChange: (query: string) => void;
	readonly query: string;
	readonly results: SearchResult[];
	readonly selectedIndex: number;
};

type SearchInputProps = {
	readonly isDateQuery: boolean;
	readonly onChange: (query: string) => void;
	readonly onSubmit: () => void;
	readonly query: string;
};

const placeholder = 'Find entries';

const renderInputValue = (
	value: string,
	cursorOffset: number,
	color: string,
) => {
	if (value.length === 0) {
		return (
			<Text>
				<Text inverse color={colors.typoTertiary}>
					{placeholder[0] ?? ' '}
				</Text>
				<Text color={colors.typoTertiary}>{placeholder.slice(1)}</Text>
			</Text>
		);
	}

	const renderedCursorOffset = Math.min(cursorOffset, value.length);

	return (
		<Text>
			<Text color={color}>{value.slice(0, renderedCursorOffset)}</Text>
			<Text inverse color={color}>
				{value[renderedCursorOffset] ?? ' '}
			</Text>
			<Text color={color}>{value.slice(renderedCursorOffset + 1)}</Text>
		</Text>
	);
};

function SearchInput({
	isDateQuery,
	onChange,
	onSubmit,
	query,
}: SearchInputProps) {
	const [cursorOffset, setCursorOffset] = React.useState(query.length);
	const inputColor = isDateQuery ? colors.typoPositive : colors.typoSecondary;

	const updateInput = React.useCallback(
		(nextQuery: string, nextCursorOffset: number) => {
			setCursorOffset(nextCursorOffset);
			onChange(nextQuery);
		},
		[onChange],
	);

	useInput((input, key) => {
		const currentQuery = query;
		const currentCursorOffset = Math.min(cursorOffset, currentQuery.length);

		if (
			key.upArrow ||
			key.downArrow ||
			key.escape ||
			key.tab ||
			(key.ctrl && input === 'c')
		) {
			return;
		}

		if (key.return) {
			onSubmit();
			return;
		}

		if (key.leftArrow) {
			const nextCursorOffset = Math.max(0, currentCursorOffset - 1);
			setCursorOffset(nextCursorOffset);
			return;
		}

		if (key.rightArrow) {
			const nextCursorOffset = Math.min(
				currentQuery.length,
				currentCursorOffset + 1,
			);
			setCursorOffset(nextCursorOffset);
			return;
		}

		if (key.backspace || key.delete) {
			if (currentCursorOffset === 0) {
				return;
			}

			const nextOffset = currentCursorOffset - 1;
			updateInput(
				currentQuery.slice(0, nextOffset) +
					currentQuery.slice(currentCursorOffset),
				nextOffset,
			);
			return;
		}

		if (input) {
			updateInput(
				currentQuery.slice(0, currentCursorOffset) +
					input +
					currentQuery.slice(currentCursorOffset),
				currentCursorOffset + input.length,
			);
		}
	});

	return renderInputValue(query, cursorOffset, inputColor);
}

export default function Find({
	isOpening = false,
	now,
	onOpenSelected,
	onQueryChange,
	query,
	results,
	selectedIndex,
}: Props) {
	const dateQuery = parseJournalDateQuery(query, now);

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Header heading="Find and open your existing journal entries" />

			<Box
				marginTop={1}
				borderColor={colors.borderPrimary}
				borderStyle="round"
				flexDirection="column"
				paddingX={1}
				width="100%"
			>
				<Box>
					<SearchInput
						isDateQuery={Boolean(dateQuery)}
						query={query}
						onChange={onQueryChange}
						onSubmit={onOpenSelected}
					/>
				</Box>
			</Box>

			<Box>
				{dateQuery ? (
					<Text color={colors.typoPositive}>
						Selected Date: {dateQuery.iso}
					</Text>
				) : (
					<Text color={colors.typoTertiary}>
						Try today, yesterday, a date, or keywords
					</Text>
				)}
			</Box>

			<Box justifyContent="space-between" marginTop={1}>
				<Text color={colors.typoSecondary}>Results ({results.length})</Text>
				{results.length > 0 ? (
					<Text color={colors.typoTertiary}>
						{selectedIndex + 1} of {results.length}
					</Text>
				) : undefined}
			</Box>

			<Box flexDirection="column" flexGrow={1} marginTop={1}>
				<SearchResultList
					isOpening={isOpening}
					results={results}
					selectedDate={dateQuery?.iso}
					selectedIndex={selectedIndex}
				/>
			</Box>

			<Box>
				<Text color={colors.typoTertiary}>
					↑/↓ navigate · Enter open · Esc back
				</Text>
			</Box>
		</Box>
	);
}
