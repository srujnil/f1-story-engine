import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { SignInForm } from "@/components/sign-in-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SignInForm />
            <p className="text-xs text-muted-foreground">
              No password — we email you a one-time link. New here? Signing in
              creates your account automatically.
            </p>
          </CardContent>
        </Card>
        <Link
          href="/community"
          className="text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Back to Community
        </Link>
      </main>
    </div>
  );
}
