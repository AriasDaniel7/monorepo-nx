export interface IUserResponse {
  count: number;
  pages: number;
  users: IUser[];
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  bloodType: string;
  createdAt: Date;
  updatedAt: Date;
}
