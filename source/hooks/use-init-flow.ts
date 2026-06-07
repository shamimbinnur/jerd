import React from 'react';
import {useApp, useInput} from 'ink';

type InitStep = 'confirmation' | 'farewell' | 'project-setup';
type InitOption = 'yes' | 'no';

const farewellDurationMs = 1000;
const farewellTickMs = 50;

const getSecondsRemaining = (progressRatio: number) =>
	Math.max(1, Math.ceil((progressRatio * farewellDurationMs) / 1000));

export const useInitFlow = () => {
	const {exit} = useApp();
	const [step, setStep] = React.useState<InitStep>('confirmation');
	const [selectedOption, setSelectedOption] = React.useState<InitOption>('yes');
	const [farewellProgressRatio, setFarewellProgressRatio] = React.useState(1);

	React.useEffect(() => {
		if (step !== 'farewell') {
			return;
		}

		const startedAt = Date.now();
		const intervalId = setInterval(() => {
			const elapsed = Date.now() - startedAt;
			const nextRatio = Math.max(0, 1 - elapsed / farewellDurationMs);
			setFarewellProgressRatio(nextRatio);

			if (nextRatio <= 0) {
				clearInterval(intervalId);
				exit();
			}
		}, farewellTickMs);

		return () => {
			clearInterval(intervalId);
		};
	}, [exit, step]);

	const returnToConfirmation = React.useCallback(() => {
		setFarewellProgressRatio(1);
		setSelectedOption('yes');
		setStep('confirmation');
	}, []);

	const chooseYes = React.useCallback(() => {
		setSelectedOption('yes');
		setStep('project-setup');
	}, []);

	const chooseNo = React.useCallback(() => {
		setSelectedOption('no');
		setStep('farewell');
	}, []);

	const submitSelectedOption = React.useCallback(() => {
		setStep(selectedOption === 'yes' ? 'project-setup' : 'farewell');
	}, [selectedOption]);

	useInput((input, key) => {
		const normalizedInput = input?.toLowerCase() ?? '';

		if (step === 'farewell') {
			if (normalizedInput === 'h') {
				returnToConfirmation();
			}

			return;
		}

		if (step !== 'confirmation') {
			return;
		}

		if (key.leftArrow) {
			setSelectedOption('yes');
			return;
		}

		if (key.rightArrow) {
			setSelectedOption('no');
			return;
		}

		if (normalizedInput === 'y') {
			chooseYes();
			return;
		}

		if (normalizedInput === 'n') {
			chooseNo();
			return;
		}

		if (key.return) {
			submitSelectedOption();
		}
	});

	return {
		farewellProgressRatio,
		secondsRemaining: getSecondsRemaining(farewellProgressRatio),
		selectedOption,
		step,
	};
};
