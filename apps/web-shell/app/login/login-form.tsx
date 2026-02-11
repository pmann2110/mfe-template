'use client';

import { LoginForm as AuthLoginForm } from '@repo/auth-next';

const MOCK_HINT = (
  <>
    <p>Mock login: Use any credentials</p>
    <p>• admin@example.com - Full access</p>
    <p>• manager@example.com - Limited access</p>
    <p>• viewer@example.com - Read-only</p>
  </>
);

export function LoginForm() {
  return (
    <AuthLoginForm
      title="Login"
      description="Enter your credentials to access your account"
      redirectPath="/"
      emailPlaceholder="user@example.com"
    />
  );
}
