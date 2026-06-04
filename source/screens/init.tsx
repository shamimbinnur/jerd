import React from 'react';
import {useApp, useInput} from 'ink';
import Farewell from './farewell.js';
import InitConfirmation from './init-confirmation.js';
import ProjectInit from './project-init.js';

type InitStep = 'confirmation' | 'farewell' | 'project';
type InitOption = 'yes' | 'no';

type Props = {
	readonly onComplete?: (name: string) => void | Promise<void>;
};

const farewellDurationMs = 1000;

export default function Init({onComplete}: Props) {
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
		}, 50);

		return () => {
			clearInterval(intervalId);
		};
	}, [exit, step]);

	useInput((input, key) => {
		const normalizedInput = input?.toLowerCase() ?? '';

		if (step === 'farewell') {
			if (normalizedInput === 'h') {
				setFarewellProgressRatio(1);
				setSelectedOption('yes');
				setStep('confirmation');
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
			setSelectedOption('yes');
			setStep('project');
			return;
		}

		if (normalizedInput === 'n') {
			setSelectedOption('no');
			setStep('farewell');
			return;
		}

		if (key.return) {
			setStep(selectedOption === 'yes' ? 'project' : 'farewell');
		}
	});

	if (step === 'project') {
		return <ProjectInit onSubmitName={onComplete} />;
	}

	if (step === 'farewell') {
		return (
			<Farewell
				isComplete={false}
				progressRatio={farewellProgressRatio}
				secondsRemaining={Math.max(
					1,
					Math.ceil((farewellProgressRatio * farewellDurationMs) / 1000),
				)}
			/>
		);
	}

	return <InitConfirmation selectedOption={selectedOption} />;
}
