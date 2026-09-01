import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Center } from "@astryxdesign/core/Center";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Banner } from "@astryxdesign/core/Banner";
import { handleCallback } from "../auth";

// The platform registers <origin>/callback as this SPA's OIDC redirect_uri.
// oidc-client-ts completes the PKCE code exchange here, then we land the
// member back on the catalog (window.location.origin, per
// thunder-authentication).
export function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback()
      .then(() => navigate("/", { replace: true }))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      });
  }, [navigate]);

  if (error) {
    return (
      <Center height="100dvh">
        <Banner status="error" title="Sign-in failed" description={error} />
      </Center>
    );
  }

  return (
    <Center height="100dvh">
      <Spinner size="lg" label="Completing sign-in…" />
    </Center>
  );
}
