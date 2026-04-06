import type { NextAuthOptions } from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";

import { getAdminScope, getAuthClientId, getAuthClientSecret, getAuthIssuer, getAuthSecret, getBootstrapEmails } from "@/lib/env";
import {
  getAdminUserByEmail,
  touchAdminLastLogin,
  upsertBootstrapAdmin,
} from "@/lib/db/queries";
import { logAuthEvent } from "@/lib/auth/audit";

function buildOidcProvider(): OAuthConfig<{ sub?: string; email?: string; name?: string }> {
  const issuer = getAuthIssuer() ?? "https://example.invalid";

  return {
    id: "oidc",
    name: "OIDC",
    type: "oauth" as const,
    issuer,
    wellKnown: `${issuer.replace(/\/+$/, "")}/.well-known/openid-configuration`,
    clientId: getAuthClientId() ?? "placeholder-client-id",
    clientSecret: getAuthClientSecret() ?? "placeholder-client-secret",
    idToken: true,
    checks: ["pkce", "state"] as Array<"pkce" | "state">,
    authorization: {
      params: {
        scope: `openid profile email ${getAdminScope()}`.trim(),
      },
    },
    profile(profile: { sub?: string; email?: string; name?: string }) {
      return {
        id: profile.sub ?? profile.email ?? crypto.randomUUID(),
        email: profile.email,
        name: profile.name ?? profile.email ?? "Unknown user",
      };
    },
  };
}

export function getAuthOptions(): NextAuthOptions {
  return {
    providers: [buildOidcProvider()],
    secret: getAuthSecret(),
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async signIn({ user, account }) {
        const email = user.email?.toLowerCase().trim();

        if (!email) {
          await logAuthEvent({
            eventType: "admin_sign_in",
            email: null,
            subject: user.name ?? null,
            outcome: "denied",
            reason: "Missing email claim",
            clientId: account?.providerAccountId ?? null,
          });
          return false;
        }

        const bootstrapEmails = getBootstrapEmails();
        if (bootstrapEmails.includes(email)) {
          await upsertBootstrapAdmin({
            email,
            displayName: user.name ?? email,
            role: bootstrapEmails[0] === email ? "owner" : "admin",
          });
        }

        const adminUser = await getAdminUserByEmail(email);
        if (!adminUser || adminUser.status !== "active") {
          await logAuthEvent({
            eventType: "admin_sign_in",
            email,
            subject: user.name ?? email,
            outcome: "denied",
            reason: adminUser ? "Admin user disabled" : "Admin user not found",
            clientId: account?.providerAccountId ?? null,
          });
          return false;
        }

        await touchAdminLastLogin(email);
        await logAuthEvent({
          eventType: "admin_sign_in",
          email,
          subject: user.name ?? email,
          outcome: "success",
          clientId: account?.providerAccountId ?? null,
        });

        return true;
      },
      async jwt({ token, user }) {
        const email = (user?.email ?? token.email)?.toLowerCase().trim();
        if (!email) {
          return token;
        }

        const adminUser = await getAdminUserByEmail(email);
        if (adminUser) {
          token.adminId = adminUser.id;
          token.adminRole = adminUser.role;
          token.adminStatus = adminUser.status;
          token.name = adminUser.displayName;
        }

        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.adminId;
          session.user.role = token.adminRole;
          session.user.status = token.adminStatus;
          if (token.name) {
            session.user.name = token.name;
          }
        }

        return session;
      },
    },
    events: {
      async signOut(message) {
        const email =
          message.token?.email?.toLowerCase?.() ??
          message.session?.user?.email?.toLowerCase?.() ??
          null;

        await logAuthEvent({
          eventType: "admin_sign_out",
          email,
          subject: message.token?.name ?? message.session?.user?.name ?? null,
          outcome: "success",
        });
      },
    },
  };
}
