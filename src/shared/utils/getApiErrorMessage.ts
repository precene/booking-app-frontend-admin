import type { AxiosError } from "axios";

import type { ApiErrorResponse } from "#/shared/types";

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  return axiosError.response?.data.error.message ?? fallbackMessage;
}
