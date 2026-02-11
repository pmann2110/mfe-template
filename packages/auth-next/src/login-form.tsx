'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@repo/ui';

export interface LoginFormProps {
  /** Card title (e.g. "Admin Login", "Login"). */
  title: string;
  /** Card description. */
  description: string;
  /** Redirect path on success (e.g. "/admin", "/"). */
  redirectPath: string;
  /** Optional hint content (e.g. mock credentials list). */
  mockHint?: React.ReactNode;
  /** Email input placeholder. */
  emailPlaceholder?: string;
}

export function LoginForm({
  title,
  description,
  redirectPath,
  emailPlaceholder = 'you@example.com',
}: LoginFormProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
      } else if (result?.ok) {
        window.location.href = redirectPath;
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full min-h-[44px]"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
