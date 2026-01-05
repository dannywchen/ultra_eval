import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Award, Zap, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold">
            Ultra<span className="text-xs align-super text-muted-foreground">(beta)</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="btn-3d btn-3d-dark">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Earn Recognition for Your{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Accomplishments
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Ultra Eval uses AI to evaluate your achievements, awards, and impact.
            Build your profile, earn ELO points, and compete on the leaderboard with
            ambitious peers from around the world.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="btn-3d btn-3d-dark">
                Start Earning ELO
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold">AI-Powered Evaluation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ultra Eval uses AI to evaluate your accomplishments and awards you ELO points.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold">Track Your Progress</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Watch your ELO grow as you submit accomplishments. See how you rank
                against peers globally.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <Award className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Showcase Achievements</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Build a comprehensive profile of your academic and extracurricular
                achievements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold">Compete & Connect</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Join a community of ambitious students and see who's making an impact.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join hundreds of students already tracking their achievements.
          </p>
          <div className="mt-8">
            <Link href="/login">
              <Button size="lg" className="btn-3d btn-3d-dark">
                Create Your Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 Ultra Eval. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
