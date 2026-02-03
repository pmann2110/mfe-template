export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: string;
}

export interface UserApi {
  list: () => Promise<User[]>;
  get: (id: string) => Promise<User>;
  create: (data: CreateUserRequest) => Promise<User>;
  update: (id: string, data: UpdateUserRequest) => Promise<User>;
  delete: (id: string) => Promise<void>;
}
