import React from 'react';
import {searchEntries, type SearchResult} from '../utils/journal-search.js';

export const useFindEntries = ({
	active,
	configDirectory,
	now,
}: {
	readonly active: boolean;
	readonly configDirectory: string;
	readonly now?: Date;
}) => {
	const [isOpening, setIsOpening] = React.useState(false);
	const [query, setQuery] = React.useState('');
	const [results, setResults] = React.useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = React.useState(0);

	React.useEffect(() => {
		if (!active) {
			return;
		}

		let isMounted = true;
		void searchEntries({
			now,
			query,
			rootDirectory: configDirectory,
		})
			.then(nextResults => {
				if (!isMounted) {
					return;
				}

				setResults(nextResults);
				setSelectedIndex(currentIndex => {
					if (nextResults.length === 0) {
						return 0;
					}

					return Math.min(currentIndex, nextResults.length - 1);
				});
			})
			.catch(() => {
				if (isMounted) {
					setResults([]);
					setSelectedIndex(0);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [active, configDirectory, now, query]);

	const reset = React.useCallback(() => {
		setQuery('');
		setSelectedIndex(0);
	}, []);

	const updateQuery = React.useCallback((nextQuery: string) => {
		setQuery(nextQuery);
		setSelectedIndex(0);
	}, []);

	const moveSelection = React.useCallback(
		(offset: number) => {
			setSelectedIndex(currentIndex =>
				Math.min(
					Math.max(currentIndex + offset, 0),
					Math.max(results.length - 1, 0),
				),
			);
		},
		[results.length],
	);

	return React.useMemo(
		() => ({
			isOpening,
			moveSelection,
			query,
			reset,
			results,
			selectedIndex,
			setIsOpening,
			updateQuery,
		}),
		[
			isOpening,
			moveSelection,
			query,
			reset,
			results,
			selectedIndex,
			updateQuery,
		],
	);
};
