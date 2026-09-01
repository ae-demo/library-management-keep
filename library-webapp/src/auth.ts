import { UserManager, WebStorageStateStore, type User } from "oidc-client-ts";
import { env } from "./env";

// OIDC + PKCE sign-in against Thunder, the platform IDP, wired through the
// `user-auth` platform-resource dependency. The OAuth client itself
// (client_id, redirect URIs) is platform-owned — never computed here.
export const userManager = new UserManager({
  authority: env.USER_AUTH_ISSUER,
  client_id: env.USER_AUTH_CLIENT_ID,
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: env.USER_AUTH_SCOPES,
  // Public SPA: token lives in JS-readable storage, acceptable behind the
  // platform CSP. Persistent storage is required — the PKCE verifier must
  // survive the redirect, and a returning member should not have to sign
  // in again on every visit.
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
  loadUserInfo: false,
});

export async function signIn(): Promise<void> {
  await userManager.signinRedirect();
}

export async function handleCallback(): Promise<User> {
  return userManager.signinRedirectCallback();
}

// Thunder's discovery document has no end_session_endpoint, so
// signoutRedirect() always rejects. Drop the local session instead and let
// the load-time guard start a fresh sign-in.
export async function signOut(): Promise<void> {
  try {
    await userManager.signoutRedirect();
  } catch {
    await userManager.removeUser();
    window.location.assign("/");
  }
}

// null ONLY when there is no session to renew at all — an expired-but-valid
// session renews silently via the refresh token.
export async function currentUser(): Promise<User | null> {
  const user = await userManager.getUser();
  if (user && !user.expired) return user;
  try {
    return await userManager.signinSilent();
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const user = await currentUser();
  return user?.access_token ?? null;
}
