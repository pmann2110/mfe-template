import NextAuth from 'next-auth';
import { authConfig } from './authOptions';

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
