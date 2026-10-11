export type Subscription = {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "yearly";
  renewal: string;
  dateSource: "estimated" | "user";
  status: "active" | "cancelled" | "removed";
  accessEnd?: string;
  category: string;
  brand: string;
  history: { date: string; amount: number }[];
};
export const initialSubscriptions: Subscription[] = [
  {
    id: "apple",
    name: "Apple TV",
    amount: 120,
    frequency: "yearly",
    renewal: "2026-11-14",
    dateSource: "estimated",
    status: "active",
    category: "Entertainment",
    brand: "apple",
    history: [{ date: "2025-11-14", amount: 120 }],
  },
  {
    id: "netflix",
    name: "Netflix",
    amount: 15,
    frequency: "monthly",
    renewal: "2026-11-18",
    dateSource: "estimated",
    status: "active",
    category: "Entertainment",
    brand: "netflix",
    history: [{ date: "2026-10-18", amount: 15 }],
  },
  {
    id: "spotify",
    name: "Spotify",
    amount: 11,
    frequency: "monthly",
    renewal: "2026-11-20",
    dateSource: "estimated",
    status: "active",
    category: "Music",
    brand: "spotify",
    history: [{ date: "2026-10-20", amount: 11 }],
  },
  {
    id: "cloud",
    name: "Cloud storage",
    amount: 3,
    frequency: "monthly",
    renewal: "2026-11-22",
    dateSource: "estimated",
    status: "active",
    category: "Utilities",
    brand: "cloud",
    history: [{ date: "2026-10-22", amount: 3 }],
  },
];
export const totalFor = (items: Subscription[], period: "monthly" | "yearly") =>
  items
    .filter((s) => s.status === "active")
    .reduce(
      (sum, s) =>
        sum +
        s.amount *
          (s.frequency === period ? 1 : period === "monthly" ? 1 / 12 : 12),
      0,
    );
export const cancelSubscription = (
  s: Subscription,
  accessEnd?: string,
): Subscription => ({
  ...s,
  status: "cancelled",
  accessEnd: accessEnd || undefined,
});
export const money = (amount: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
export const dateLabel = (date: string, long = false) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: long ? "long" : "short",
    ...(long ? { year: "numeric" as const } : {}),
  });
