import { authProviderServer } from "@/providers/auth-provider/auth-provider.server";

export async function getData() {
  const { authenticated, redirectTo, error } = await authProviderServer.check();

  return {
    authenticated,
    redirectTo,
    error,
  };
}
