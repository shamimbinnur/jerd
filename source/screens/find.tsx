import React from 'react';
import {Box, Text, useInput} from 'ink';
import SearchResultList from '../components/find/search-result-list.js';
import {colors} from '../theme/colors.js';
import {parseDateQuery, type SearchResult} from '../utils/journal-search.js';

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
				<Text inverse color={colors.textHint}>
					{placeholder[0] ?? ' '}
				</Text>
				<Text color={colors.textHint}>{placeholder.slice(1)}</Text>
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
	const inputColor = isDateQuery ? colors.successAccent : colors.textHint;

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
	const dateQuery = parseDateQuery(query, now);

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
					<SearchInput
						isDateQuery={Boolean(dateQuery)}
						query={query}
						onChange={onQueryChange}
						onSubmit={onOpenSelected}
					/>
				</Box>
				{dateQuery ? (
					<Text color={colors.textHint}>Date term search: {dateQuery.iso}</Text>
				) : (
					<Text color={colors.textHint}>
						(e.g. today, yesterday, 2026-05-31, content)
					</Text>
				)}
			</Box>

			<Box flexDirection="column" marginTop={1}>
				<SearchResultList
					isOpening={isOpening}
					results={results}
					selectedIndex={selectedIndex}
				/>
			</Box>

			<Box marginTop={1}>
				<Text color={colors.textHint}>Press ESC to return to main menu</Text>
			</Box>
		</Box>
	);
}
