export type ConnectedAccount = {
  id: string;
  bank: string;
  name: string;
  last4: string;
};
export const demoBankAccounts = [
  { name: "Personal account", last4: "4242" },
  { name: "Joint account", last4: "8701" },
] as const;
export function bankConnection(bank: string, last4: string): ConnectedAccount {
  const details =
    demoBankAccounts.find((a) => a.last4 === last4) ?? demoBankAccounts[0];
  return { id: `${bank}:${details.last4}`, bank, ...details };
}
export function addConnection(
  connections: ConnectedAccount[],
  connection: ConnectedAccount,
) {
  return connections.some((a) => a.id === connection.id)
    ? connections
    : [...connections, connection];
}
export function disconnectAccount(connections: ConnectedAccount[], id: string) {
  return connections.filter((a) => a.id !== id);
}
function isConnection(value: unknown): value is ConnectedAccount {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.id === "string" &&
    typeof a.bank === "string" &&
    typeof a.name === "string" &&
    typeof a.last4 === "string"
  );
}
export type Account = {
  signedIn: boolean;
  onboarded: boolean;
  name: string;
  email: string;
  provider: "Apple" | "Google" | "Email";
  connections: ConnectedAccount[];
  reminders: boolean;
  reminderDays: string;
  emailSummary: boolean;
};
export const ACCOUNT_STORAGE = "subscript-account-v1";
export const defaultAccount: Account = {
  signedIn: false,
  onboarded: false,
  name: "Alex Morgan",
  email: "alex@subscript.demo",
  provider: "Email",
  connections: [],
  reminders: true,
  reminderDays: "3",
  emailSummary: false,
};
// Keep the storage key so existing prototype profiles migrate in place.
export function parseAccount(value: unknown): Account {
  if (!value || typeof value !== "object") return defaultAccount;
  const a = value as Record<string, unknown>;
  if (
    typeof a.signedIn !== "boolean" ||
    typeof a.onboarded !== "boolean" ||
    typeof a.name !== "string" ||
    typeof a.email !== "string" ||
    !["Apple", "Google", "Email"].includes(String(a.provider)) ||
    typeof a.reminders !== "boolean" ||
    !["1", "3", "7"].includes(String(a.reminderDays)) ||
    typeof a.emailSummary !== "boolean"
  )
    return defaultAccount;
  const connections = Array.isArray(a.connections)
    ? a.connections
        .filter(isConnection)
        .reduce<ConnectedAccount[]>(addConnection, [])
    : typeof a.bank === "string" && a.bank
      ? [bankConnection(a.bank, "4242")]
      : [];
  return {
    signedIn: a.signedIn,
    onboarded: a.onboarded,
    name: a.name,
    email: a.email,
    provider: a.provider as Account["provider"],
    connections,
    reminders: a.reminders,
    reminderDays: String(a.reminderDays),
    emailSummary: a.emailSummary,
  };
}
export function readAccount(): Account {
  try {
    return parseAccount(
      JSON.parse(localStorage.getItem(ACCOUNT_STORAGE) || "null"),
    );
  } catch {
    return defaultAccount;
  }
}
export const accountRoutes = [
  "welcome",
  "login",
  "signup",
  "social",
  "email",
  "verify",
  "onboard-name",
  "connect",
  "banks",
  "bank-consent",
  "detected",
  "reminders-setup",
  "ready",
  "profile",
  "edit-profile",
  "settings",
  "notifications",
  "accounts",
  "privacy",
  "help",
  "activity",
] as const;
export type AccountRoute = (typeof accountRoutes)[number];
export function isAccountRoute(route: string): route is AccountRoute {
  return (accountRoutes as readonly string[]).includes(route);
}
