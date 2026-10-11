import {
  HugeiconsIcon,
  type HugeiconsProps,
  type IconSvgElement,
} from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  ArrowUpRight01Icon,
  ArrowRight02Icon,
  Search01Icon,
  Add01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  Tick02Icon,
  CloudIcon,
  ShieldCheckIcon,
  LinkSquare02Icon,
  ReloadIcon,
  InformationCircleIcon,
  Edit02Icon,
  Calendar03Icon,
  TickDouble02Icon,
  Plant01Icon,
  LockKeyIcon,
  Home03Icon,
  UserIcon,
  Invoice01Icon,
  Notification02Icon,
  BankIcon,
  HelpCircleIcon,
  Leaf01Icon,
  Link01Icon,
  Logout03Icon,
  Mail01Icon,
  Settings01Icon,
  SparklesIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

type IconProps = Omit<HugeiconsProps, "icon" | "ref">;

// A shared optical weight and decorative defaults for every interface icon.
// Brands keep their own marks; application controls all use Hugeicons.
function createIcon(icon: IconSvgElement, directional = false) {
  return function Icon({
    size = 20,
    strokeWidth = 2,
    className = "",
    ...props
  }: IconProps) {
    return (
      <HugeiconsIcon
        icon={icon}
        size={size}
        strokeWidth={strokeWidth}
        aria-hidden="true"
        focusable="false"
        className={`ui-icon ${directional ? "icon-directional" : ""} ${className}`}
        {...props}
      />
    );
  };
}

export const ArrowLeft = createIcon(ArrowLeft02Icon, true);
export const ArrowUpRight = createIcon(ArrowUpRight01Icon);
export const ArrowRight = createIcon(ArrowRight02Icon, true);
export const Search = createIcon(Search01Icon);
export const Plus = createIcon(Add01Icon);
export const X = createIcon(Cancel01Icon);
export const ChevronRight = createIcon(ArrowRight01Icon, true);
export const Check = createIcon(Tick02Icon);
export const Cloud = createIcon(CloudIcon);
export const ShieldCheck = createIcon(ShieldCheckIcon);
export const ExternalLink = createIcon(LinkSquare02Icon);
export const RotateCcw = createIcon(ReloadIcon);
export const Info = createIcon(InformationCircleIcon);
export const Pencil = createIcon(Edit02Icon);
export const CalendarDays = createIcon(Calendar03Icon);
export const CheckCheck = createIcon(TickDouble02Icon);
export const Sprout = createIcon(Plant01Icon);
export const LockKeyhole = createIcon(LockKeyIcon);
export const Home = createIcon(Home03Icon);
export const UserRound = createIcon(UserIcon);
export const ReceiptText = createIcon(Invoice01Icon);
export const Bell = createIcon(Notification02Icon);
export const Landmark = createIcon(BankIcon);
export const HelpCircle = createIcon(HelpCircleIcon);
export const Leaf = createIcon(Leaf01Icon);
export const Link2 = createIcon(Link01Icon);
export const LogOut = createIcon(Logout03Icon);
export const Mail = createIcon(Mail01Icon);
export const Settings = createIcon(Settings01Icon);
export const Sparkles = createIcon(SparklesIcon);
export const Eye = createIcon(ViewIcon);
