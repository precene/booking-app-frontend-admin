import type { ListMoviesQuery, Movie, MoviePayload, MovieUpdatePayload } from "../types/movieTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const moviesApi = {
  list: async (query?: ListMoviesQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<Movie>>>("/admin/movies", {
      params: cleanQueryParams(query),
    });

    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ movie: Movie }>>(`/admin/movies/${id}`);

    return response.data;
  },

  create: async (payload: MoviePayload) => {
    const response = await apiClient.post<ApiResponse<{ movie: Movie }>>("/admin/movies", payload);

    return response.data;
  },

  update: async (id: string, payload: MovieUpdatePayload) => {
    const response = await apiClient.patch<ApiResponse<{ movie: Movie }>>(
      `/admin/movies/${id}`,
      payload,
    );

    return response.data;
  },

  // Movie delete is intentionally disabled in the admin UI for now.
  // delete: async (id: string) => {
  //   await apiClient.delete(`/admin/movies/${id}`);
  // },
};
