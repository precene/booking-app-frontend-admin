import { Check } from "lucide-react";
import { Fragment, type ComponentProps } from "react";

import { cn } from "#/shared/utils/cn";

export type StepperStep = {
  description?: string;
  id: string;
  title: string;
};

type StepStatus = "completed" | "current" | "upcoming";

type StepperProps = ComponentProps<"nav"> & {
  currentStep: number;
  onStepChange?: (stepIndex: number) => void;
  steps: Array<StepperStep>;
};

function Stepper({ className, currentStep, onStepChange, steps, ...props }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)} {...props}>
      <ol className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-0">
        {steps.map((step, index) => {
          const status = getStepStatus(index, currentStep);
          const isClickable = Boolean(onStepChange);

          return (
            <Fragment key={step.id}>
              <li className="min-w-0 md:w-40 md:flex-none">
                <StepperItem
                  index={index}
                  isClickable={isClickable}
                  onStepChange={onStepChange}
                  status={status}
                  step={step}
                />
              </li>

              {index < steps.length - 1 ? (
                <li aria-hidden className="hidden flex-1 px-6 pt-4 md:block">
                  <div className="bg-border h-px w-full" />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

type StepperItemProps = {
  index: number;
  isClickable: boolean;
  onStepChange?: (stepIndex: number) => void;
  status: StepStatus;
  step: StepperStep;
};

function StepperItem({ index, isClickable, onStepChange, status, step }: StepperItemProps) {
  const content = (
    <>
      <span className={getIndicatorClassName(status)}>{getIndicatorContent(status, index)}</span>

      <span className="min-w-0">
        <span className={getTitleClassName(status)}>{step.title}</span>
        {step.description ? (
          <span className="text-muted mt-1 block text-xs leading-5">{step.description}</span>
        ) : null}
      </span>
    </>
  );

  if (isClickable) {
    return (
      <button
        aria-current={status === "current" ? "step" : undefined}
        className="group focus-visible:ring-ring/25 flex w-full min-w-0 items-start gap-3 rounded-md text-left outline-none focus-visible:ring-2 md:flex-col md:items-center md:gap-2 md:text-center"
        onClick={() => onStepChange?.(index)}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <div
      aria-current={status === "current" ? "step" : undefined}
      className="flex min-w-0 items-start gap-3 md:flex-col md:items-center md:gap-2 md:text-center"
    >
      {content}
    </div>
  );
}

function getStepStatus(index: number, currentStep: number): StepStatus {
  if (index < currentStep) {
    return "completed";
  }

  if (index === currentStep) {
    return "current";
  }

  return "upcoming";
}

function getIndicatorClassName(status: StepStatus) {
  return cn(
    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
    status === "completed" && "border-primary bg-primary text-primary-foreground",
    status === "current" && "border-primary bg-surface text-primary",
    status === "upcoming" && "border-border bg-surface text-muted",
  );
}

function getIndicatorContent(status: StepStatus, index: number) {
  if (status === "completed") {
    return <Check className="size-4" />;
  }

  return index + 1;
}

function getTitleClassName(status: StepStatus) {
  return cn(
    "block text-sm leading-5 font-medium transition-colors",
    status === "upcoming" ? "text-muted" : "text-foreground",
  );
}

export { Stepper };
