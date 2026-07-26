import { useMemo } from "react";
import { useSearchParams } from "react-router";
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
import { Separator } from "@/components/ui/separator";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  account_not_linked: {
    title: "Account not linked",
    description:
      "This Google or GitHub account uses an email that already has a password login. Sign in with email/password first, or use the same method you used to register.",
  },
  unable_to_link_account: {
    title: "Could not link account",
    description:
      "We couldn't connect that social account to your user. Try again, or sign in with email and password.",
  },
  oauth_provider_not_found: {
    title: "Sign-in provider unavailable",
    description:
      "That login provider isn't configured. Try another method or contact support.",
  },
  invalid_code: {
    title: "Sign-in expired",
    description:
      "The login link expired or was already used. Please try signing in again.",
  },
  state_mismatch: {
    title: "Sign-in interrupted",
    description:
      "Something went wrong during the login redirect. Close extra tabs and try again.",
  },
  access_denied: {
    title: "Access denied",
    description:
      "You cancelled the sign-in request or didn't grant permission. Try again if that was a mistake.",
  },
  email_not_verified: {
    title: "Email not verified",
    description:
      "Your social account email must be verified before you can sign in this way.",
  },
};

function resolveError(code: string | null, rawMessage: string | null) {
  if (code && Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, code)) {
    return { code, ...ERROR_MESSAGES[code] };
  }

  if (rawMessage) {
    return {
      code: code ?? "unknown",
      title: "Sign-in failed",
      description: rawMessage,
    };
  }

  return {
    code: code ?? "unknown",
    title: "Something went wrong",
    description:
      "We couldn't complete sign-in. Please try again or return to the login page.",
  };
}

export default function AuthErrorPage() {
  const [params] = useSearchParams();
  const Link = useLink();

  const error = useMemo(() => {
    const code =
      params.get("error") ??
      params.get("errorCode") ??
      params.get("code");
    const message =
      params.get("error_description") ??
      params.get("message") ??
      params.get("errorDescription");
    return resolveError(code, message);
  }, [params]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-8">
      <Card className="w-full max-w-md p-8">
        <CardHeader className="px-0">
          <p className="text-sm font-medium text-destructive uppercase tracking-wide">
            Error
          </p>
          <CardTitle className="text-2xl">{error.title}</CardTitle>
          <CardDescription className="text-base">
            {error.description}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="px-0 pt-4">
          {error.code !== "unknown" && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground font-mono">
              CODE: {error.code}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-0 sm:flex-row">
          <Button asChild className="w-full sm:w-auto">
            <Link to="/login">Back to login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/">Go home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
