import type { AuthProvider } from "@refinedev/core";
import { authClient } from "@/lib/auth-client";
import type { Identity } from "@/types";

export const authProvider: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    if (providerName) {
      const { error } = await authClient.signIn.social({
        provider: providerName,
        callbackURL: "/",
      });

      if (error) {
        return {
          success: false,
          error: { message: error.message ?? "Login failed", name: "LoginError" },
        };
      }

      return { success: true };
    }

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      return {
        success: false,
        error: { message: error.message ?? "Invalid email or password", name: "LoginError" },
      };
    }

    return { success: true, redirectTo: "/" };
  },

  register: async ({ email, password, name, providerName }) => {
    if (providerName) {
      const { error } = await authClient.signIn.social({
        provider: providerName,
        callbackURL: "/",
      });

      if (error) {
        return {
          success: false,
          error: { message: error.message ?? "Sign up failed", name: "RegisterError" },
        };
      }

      return { success: true };
    }

    const { error } = await authClient.signUp.email({
      email,
      password,
      name: name ?? email.split("@")[0],
    });

    if (error) {
      return {
        success: false,
        error: { message: error.message ?? "Sign up failed", name: "RegisterError" },
      };
    }

    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    await authClient.signOut();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const { data } = await authClient.getSession();

    if (!data?.session) {
      return { authenticated: false, redirectTo: "/login" };
    }

    return { authenticated: true };
  },

  onError: async (error) => {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return { logout: true, redirectTo: "/login", error };
    }

    return { error };
  },

  getIdentity: async (): Promise<Identity | null> => {
    const { data } = await authClient.getSession();

    if (!data?.user) {
      return null;
    }

    return {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      avatar: data.user.image ?? undefined,
      role: (data.user as { role?: Identity["role"] }).role,
    };
  },

  forgotPassword: async ({ email }) => {
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (error) {
      return {
        success: false,
        error: { message: error.message ?? "Failed to send reset email", name: "ForgotPasswordError" },
      };
    }

    return {
      success: true,
      successNotification: {
        message: "Check your inbox",
        description: "We've sent you a link to reset your password.",
      },
    };
  },

  updatePassword: async ({ password, token }) => {
    if (!token) {
      return {
        success: false,
        error: { message: "Missing reset token", name: "UpdatePasswordError" },
      };
    }

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      return {
        success: false,
        error: { message: error.message ?? "Failed to reset password", name: "UpdatePasswordError" },
      };
    }

    return { success: true, redirectTo: "/login" };
  },
};
