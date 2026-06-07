import {useInitFlow} from '../hooks/use-init-flow.js';
import type {ProjectInitSubmitInput} from '../hooks/use-project-init-form.js';
import Farewell from './farewell.js';
import InitConfirmation from './init-confirmation.js';
import ProjectInit from './project-init.js';

type Props = {
	readonly nextStepCommand?: string;
	readonly onComplete?: (input: ProjectInitSubmitInput) => void | Promise<void>;
};

export default function Init({nextStepCommand, onComplete}: Props) {
	const {farewellProgressRatio, secondsRemaining, selectedOption, step} =
		useInitFlow();

	if (step === 'project-setup') {
		return (
			<ProjectInit
				nextStepCommand={nextStepCommand}
				onSubmitProject={onComplete}
			/>
		);
	}

	if (step === 'farewell') {
		return (
			<Farewell
				isComplete={false}
				progressRatio={farewellProgressRatio}
				secondsRemaining={secondsRemaining}
			/>
		);
	}

	return <InitConfirmation selectedOption={selectedOption} />;
}
