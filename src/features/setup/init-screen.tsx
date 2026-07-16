import Farewell from './farewell-screen.js';
import InitConfirmation from './confirmation-screen.js';
import ProjectInit from './project-init-screen.js';
import {useInitFlow} from './use-init-flow.js';
import type {ProjectInitSubmitInput} from './use-project-init-form.js';

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
