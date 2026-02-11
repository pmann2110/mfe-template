'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@repo/ui';
import type { Session } from 'next-auth';

interface HomeContentProps {
  session: Session | null;
}

export function HomeContent({ session }: HomeContentProps) {
  return (
    <div className="container space-y-20 py-16 md:py-24">
      <section className="mx-auto max-w-3xl space-y-6 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl md:leading-tight">
          Your Product, Your Vision, Our Platform
        </h1>
        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground md:text-xl">
          Empower your business with our cutting-edge solution. Streamline
          workflows, boost productivity, and achieve your goals.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Button size="lg" className="min-h-[44px]">Get Started</Button>
          <Button size="lg" variant="outline" className="min-h-[44px]">
            Learn More
          </Button>
        </div>
      </section>

      {session && (
        <Card className="mx-auto max-w-2xl">
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

      <section className="grid gap-6 sm:gap-8 md:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>Intuitive Interface</CardTitle>
            <CardDescription>
              Our user-friendly interface makes navigation and operation a
              breeze for all users.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
            <CardDescription>
              Gain valuable insights with our comprehensive analytics and
              reporting tools.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
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
