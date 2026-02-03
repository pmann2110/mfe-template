import NextAuth from 'next-auth';
import { authConfig } from './auth-options';

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
