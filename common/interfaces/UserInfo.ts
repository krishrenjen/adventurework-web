export interface UserInfo {
  businessEntityID: number;
  firstName: string;
  lastName: string;
  personType: string; // Example: 'EM', 'IN', etc.
  emailAddress: string | null;
}