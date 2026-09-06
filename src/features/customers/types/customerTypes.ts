import type { Query } from "#/shared/types";

export type UserRole = "admin" | "customer" | "staff";

export type Customer = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListCustomersQuery = Query & {
  active?: "false" | "true";
  limit?: number;
  page?: number;
  q?: string;
  role?: UserRole;
};

export type UpdateCustomerActivePayload = {
  active: boolean;
};
