import React from "react";
import { View } from "react-native";
import { useTheme } from "./theme";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Add01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  BankIcon,
  Calendar03Icon,
  Cancel01Icon,
  CloudIcon,
  Edit02Icon,
  HelpCircleIcon,
  Home03Icon,
  InformationCircleIcon,
  Invoice01Icon,
  Link01Icon,
  Logout03Icon,
  Mail01Icon,
  MoreHorizontalIcon,
  Notification02Icon,
  ReloadIcon,
  Search01Icon,
  Settings01Icon,
  ShieldCheckIcon,
  Tick02Icon,
  UserIcon,
  Analytics01Icon,
  CreditCardIcon,
  AppleIcon,
  SpotifyIcon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
const icons = {
  add: Add01Icon,
  back: ArrowLeft02Icon,
  chevron: ArrowRight01Icon,
  external: ArrowUpRight01Icon,
  bank: BankIcon,
  calendar: Calendar03Icon,
  close: Cancel01Icon,
  cloud: CloudIcon,
  edit: Edit02Icon,
  help: HelpCircleIcon,
  home: Home03Icon,
  info: InformationCircleIcon,
  activity: Invoice01Icon,
  link: Link01Icon,
  logout: Logout03Icon,
  mail: Mail01Icon,
  more: MoreHorizontalIcon,
  bell: Notification02Icon,
  repeat: ReloadIcon,
  search: Search01Icon,
  settings: Settings01Icon,
  shield: ShieldCheckIcon,
  check: Tick02Icon,
  user: UserIcon,
  chart: Analytics01Icon,
  card: CreditCardIcon,
  apple: AppleIcon,
  spotify: SpotifyIcon,
  sun: Sun03Icon,
};
export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 22,
  color,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <View style={{ width: size, height: size, zIndex: 1 }}>
      <HugeiconsIcon
        icon={icons[name]}
        size={size}
        color={color ?? theme.text}
        strokeWidth={1.8}
      />
    </View>
  );
}
