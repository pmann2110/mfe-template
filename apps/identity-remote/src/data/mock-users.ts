import type { User } from '@repo/api-contracts';
import { MOCK_USERS, getMemberIdsInOrg } from './mock-identity';

let mutableUsers: User[] = [...MOCK_USERS];

export const mockUserApi = {
  list: async (organizationId?: string): Promise<User[]> => {
    if (organizationId) {
      const memberIds = getMemberIdsInOrg(organizationId);
      return mutableUsers.filter((u) => memberIds.includes(u.id));
    }
    return [...mutableUsers];
  },
  get: async (id: string): Promise<User> => {
    const user = mutableUsers.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    return user;
  },
  create: async (data: {
    email: string;
    name: string;
    role: string;
  }): Promise<User> => {
    const user: User = {
      id: String(mutableUsers.length + 1),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mutableUsers.push(user);
    return user;
  },
  update: async (
    id: string,
    data: { email?: string; name?: string; role?: string },
  ): Promise<User> => {
    const index = mutableUsers.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    const prev = mutableUsers[index]!;
    const updated: User = {
      id: prev.id,
      email: data.email ?? prev.email,
      name: data.name ?? prev.name,
      role: data.role ?? prev.role,
      createdAt: prev.createdAt,
      updatedAt: new Date().toISOString(),
    };
    mutableUsers[index] = updated;
    return updated;
  },
  delete: async (id: string): Promise<void> => {
    mutableUsers = mutableUsers.filter((u) => u.id !== id);
  },
};
