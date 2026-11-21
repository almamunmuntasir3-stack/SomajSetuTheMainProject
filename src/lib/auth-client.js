import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

/**
 * Returns the current user's JWT, or null when there is no active session.
 */
export async function getAuthToken() {
  try {
    const { data: session, error: sessionError } = await authClient.getSession();
    if (sessionError || !session) return null;

    const { data, error } = await authClient.token();
    if (error || !data?.token) return null;

    return data.token;
  } catch {
    // A failed auth lookup must not take down public API reads.
    return null;
  }
}
