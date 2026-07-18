import React from 'react';

interface StepperProps {
    steps: { id: number; name: string }[];
    currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center justify-between">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                        {currentStep > step.id ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-secondary" />
                                </div>
                                <div className="relative w-8 h-8 flex items-center justify-center bg-secondary rounded-full">
                                    <span className="material-symbols-outlined text-white text-lg">check</span>
                                </div>
                            </>
                        ) : currentStep === step.id ? (
                             <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-neutral-200 dark:bg-neutral-700" />
                                </div>
                                <div className="relative w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-800 border-2 border-secondary rounded-full" aria-current="step">
                                     <span className="h-2.5 w-2.5 bg-secondary rounded-full" aria-hidden="true" />
                                </div>
                            </>
                        ) : (
                             <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-neutral-200 dark:bg-neutral-700" />
                                </div>
                                <div className="group relative w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 rounded-full">
                                     <span className="h-2.5 w-2.5 bg-transparent rounded-full" aria-hidden="true" />
                                </div>
                            </>
                        )}
                        <span className="absolute top-10 left-1/2 -translate-x-1/2 text-xs text-center w-24 text-neutral-600 dark:text-neutral-400 font-semibold">{step.name}</span>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Stepper;