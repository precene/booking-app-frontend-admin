import { createContext, useContext, type ComponentProps, type KeyboardEvent } from "react";

import { cn } from "#/shared/utils/cn";

type FormProps = ComponentProps<"form"> & {
  disabled?: boolean;
  fieldsetClassName?: string;
  submitOnEnter?: boolean;
};

const FormDisabledContext = createContext(false);

function Form({
  children,
  className,
  disabled = false,
  fieldsetClassName,
  onKeyDown,
  submitOnEnter = false,
  ...props
}: FormProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    onKeyDown?.(event);

    if (event.defaultPrevented || submitOnEnter || event.key !== "Enter") {
      return;
    }

    if (event.target instanceof HTMLTextAreaElement) {
      return;
    }

    event.preventDefault();
  }

  return (
    <FormDisabledContext value={disabled}>
      <form className={className} onKeyDown={handleKeyDown} {...props}>
        <fieldset className={cn("contents", fieldsetClassName)} disabled={disabled}>
          {children}
        </fieldset>
      </form>
    </FormDisabledContext>
  );
}

function useFormDisabled() {
  return useContext(FormDisabledContext);
}

export { Form, useFormDisabled };
