export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: "admin" | "customer" | "staff";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  user: User;
}
