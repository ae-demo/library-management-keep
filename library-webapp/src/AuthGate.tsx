import { useEffect, useState, type ReactNode } from "react";
import { Center } from "@astryxdesign/core/Center";
import { Spinner } from "@astryxdesign/core/Spinner";
import { currentUser, signIn } from "./auth";

// Gates every catalog view behind Thunder sign-in: no route under this
// component renders until a session is confirmed. A missing/expired session
// with no refresh available redirects to sign-in rather than rendering.
export function AuthGate({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    currentUser().then((user) => {
      if (cancelled) return;
      if (user) {
        setIsSignedIn(true);
      } else {
        void signIn();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSignedIn) {
    return (
      <Center height="100dvh">
        <Spinner size="lg" label="Signing in…" />
      </Center>
    );
  }

  return <>{children}</>;
}
