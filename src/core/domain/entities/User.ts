export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  roleId: string;
  createdAt: Date;
  updatedAt: Date;
}