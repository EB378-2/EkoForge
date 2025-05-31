import type { AuthProvider } from "@refinedev/core";
import { createSupabaseServerClient } from "@utils/supabase/server";

export const authProviderServer: Pick<AuthProvider, "check" | "getPermissions"> = {
  check: async () => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    const { user } = data;

    if (error) {
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
      };
    }

    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => {
    const supabase = await createSupabaseServerClient();
    try {
        const { error } = await supabase.auth.getUser();

        if (error) {
            console.error(error);
            return;
        }

        const { data } = await supabase.rpc("get_my_claim", {
            claim: "role",
        });

        return data;
    } catch (error: any) {
        console.error(error);
        return;
    }
  },
};