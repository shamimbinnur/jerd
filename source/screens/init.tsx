import {useInput} from 'ink';
import React from 'react';
import InitConfirmation from './init-confirmation.js';
import ProjectInit from './project-init.js';

type InitStep = 'confirmation' | 'project';
type InitOption = 'yes' | 'no';

type Props = {
	readonly onComplete?: (name: string) => void | Promise<void>;
};

export default function Init({onComplete}: Props) {
	const [step, setStep] = React.useState<InitStep>('confirmation');
	const [selectedOption, setSelectedOption] = React.useState<InitOption>('yes');

	useInput((input, key) => {
		if (step !== 'confirmation') {
			return;
		}

		const normalizedInput = input?.toLowerCase() ?? '';

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
			return;
		}

		if (key.return && selectedOption === 'yes') {
			setStep('project');
		}
	});

	if (step === 'project') {
		return <ProjectInit onSubmitName={onComplete} />;
	}

	return <InitConfirmation selectedOption={selectedOption} />;
}
