export interface Movie {
  cast: Array<string>;
  coverImage: string | null;
  createdAt: string;
  directors: Array<string>;
  durationMinutes: number;
  active: boolean;
  ageRating: string | null;
  genre: string | null;
  id: string;
  overview: string | null;
  posterUrl: string | null;
  producers: Array<string>;
  releaseDate: string | null;
  title: string;
  trailerUrl: string | null;
  updatedAt: string;
  writers: Array<string>;
}

export interface MoviePayload {
  active?: boolean;
  ageRating?: string;
  cast?: Array<string>;
  coverImage?: string;
  directors?: Array<string>;
  durationMinutes: number;
  genre?: string;
  overview?: string;
  posterUrl?: string;
  producers?: Array<string>;
  releaseDate?: string;
  title: string;
  trailerUrl?: string;
  writers?: Array<string>;
}

export type MovieUpdatePayload = Partial<MoviePayload>;

export interface ListMoviesQuery {
  active?: "true" | "false";
  genre?: string;
  page?: number;
  limit?: number;
  q?: string;
}

export type SetVenueMoviesPayload = {
  movieIds: Array<string>;
};
