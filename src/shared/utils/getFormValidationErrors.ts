import type { z } from "zod";

export type FormValidationErrors<T extends object> = Partial<
  Record<Extract<keyof T, string>, string>
>;

export function getFormValidationErrors<T extends object>(error: z.ZodError<T>) {
  return Object.fromEntries(
    error.issues
      .filter((issue) => typeof issue.path[0] === "string")
      .map((issue) => [issue.path[0], issue.message]),
  );
}
