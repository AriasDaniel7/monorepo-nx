export interface UserResponse {
  count: number;
  pages: number;
  users: User[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  bloodType: string;
  createdAt: Date;
  updatedAt: Date;
}
