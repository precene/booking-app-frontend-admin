export type ApiResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiPaginated<T> = {
  items: Array<T>;
  page: number;
  limit: number;
  total: number;
};

export type Query = Record<string, string | number | boolean | null | undefined>;
