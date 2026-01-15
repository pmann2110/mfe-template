'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@repo/ui';
import type { Session } from 'next-auth';

interface HomeContentProps {
  session: Session | null;
}

export function HomeContent({ session }: HomeContentProps) {
  return (
    <div className="container py-20">
      <section className="mb-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Your Product, Your Vision, Our Platform
        </h1>
        <p className="mx-auto mb-8 max-w-[600px] text-muted-foreground md:text-xl">
          Empower your business with our cutting-edge solution. Streamline
          workflows, boost productivity, and achieve your goals.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </section>

      {session && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Welcome back, {session.user.name}!</CardTitle>
            <CardDescription>
              You are logged in as {session.user.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is the customer-facing website. For admin features, visit
              the admin portal.
            </p>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Intuitive Interface</CardTitle>
            <CardDescription>
              Our user-friendly interface makes navigation and operation a
              breeze for all users.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
            <CardDescription>
              Gain valuable insights with our comprehensive analytics and
              reporting tools.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Seamless Integration</CardTitle>
            <CardDescription>
              Easily integrate with your existing tools and workflows without
              disruption.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </div>
  );
}
