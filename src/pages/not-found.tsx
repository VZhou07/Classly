import { useLink } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFoundPage() {
  const Link = useLink();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-8">
      <Card className="w-full max-w-md p-8 text-center">
        <CardHeader className="px-0">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            404
          </p>
          <CardTitle className="text-2xl">Page not found</CardTitle>
          <CardDescription className="text-base">
            That URL doesn't exist in this app. Check the link or go back home.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0" />
        <CardFooter className="flex justify-center gap-3 px-0">
          <Button asChild>
            <Link to="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
