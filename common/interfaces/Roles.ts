export interface User {
  userId: number;
  username: string;
  email?: string;
  role: UserRole;
  createdAt?: string; // ISO 8601 date string
}

export enum UserRole {
  Admin = "admin",
  User = "user",
  Guest = "guest"
}