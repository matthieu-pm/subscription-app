// Alternative native prototype: Revolut's dark visual direction with Subscript content.
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Appearance,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { BlurTargetView, BlurView } from "expo-blur";
import {
  useFonts,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Icon, IconName } from "./src/icons";
import { GlassProvider, GlassSurface } from "./src/Glass";
import { BottomDrawer } from "./src/BottomDrawer";
import {
  ThemeContext,
  palettes,
  useTheme,
  type Palette,
  type AppearanceMode,
} from "./src/theme";
import {
  initialSubscriptions,
  Subscription,
  totalFor,
  money,
  dateLabel,
  cancelSubscription,
} from "./src/model";

type Screen =
  | "welcome"
  | "login"
  | "verify"
  | "name"
  | "connect"
  | "banks"
  | "consent"
  | "detected"
  | "reminders-setup"
  | "ready"
  | "home"
  | "subscriptions"
  | "activity"
  | "profile"
  | "detail"
  | "edit"
  | "add"
  | "cancel"
  | "provider"
  | "accounts"
  | "settings"
  | "notifications"
  | "edit-profile"
  | "help"
  | "privacy"
  | "insights";
type Account = { id: string; bank: string; name: string; last4: string };
type State = {
  appearance: AppearanceMode;
  items: Subscription[];
  name: string;
  email: string;
  accounts: Account[];
  reminders: boolean;
  days: number;
  summary: boolean;
  onboarded: boolean;
};
const initial: State = {
  appearance: "dark",
  items: initialSubscriptions,
  name: "Alex Morgan",
  email: "alex@subscript.demo",
  accounts: [],
  reminders: true,
  days: 3,
  summary: false,
  onboarded: false,
};
const STORAGE = "subscript-revolut-native-v1";

const haptic = () => {
  if (Platform.OS !== "web") void Haptics.selectionAsync();
};
function T({ children, style, ...props }: React.ComponentProps<typeof Text>) {
  const c = useTheme();
  const s = styles[c.mode];
  return (
    <Text {...props} style={[s.text, style]}>
      {children}
    </Text>
  );
}
function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const c = useTheme();
  const s = styles[c.mode];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        haptic();
        onPress();
      }}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.75, transform: [{ scale: 0.985 }] },
      ]}
    >
      <T style={[s.buttonText, secondary && { color: c.text }]}>{label}</T>
    </Pressable>
  );
}
function IconButton({
  name,
  label,
  onPress,
  plain = false,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  plain?: boolean;
}) {
  const c = useTheme();
  const s = styles[c.mode];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptic();
        onPress();
      }}
      style={({ pressed }) => [
        s.iconButton,
        { backgroundColor: "transparent" },
        pressed && { opacity: 0.6 },
      ]}
    >
      {!plain && (
        <GlassSurface
          pointerEvents="none"
          interactive
          style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
        />
      )}
      <Icon name={name} />
    </Pressable>
  );
}
function Group({ children }: React.PropsWithChildren) {
  const c = useTheme();
  const s = styles[c.mode];
  return <View style={s.group}>{children}</View>;
}
function Row({
  title,
  sub,
  icon,
  right,
  onPress,
  danger = false,
}: {
  title: string;
  sub?: string;
  icon?: IconName;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const c = useTheme();
  const s = styles[c.mode];
  const content = (
    <>
      {icon && <Icon name={icon} color={danger ? c.danger : c.text} />}
      <View style={{ flex: 1 }}>
        <T style={danger ? { color: c.danger } : undefined}>{title}</T>
        {sub && <T style={s.caption}>{sub}</T>}
      </View>
      {right}
      {onPress && <Icon name="chevron" size={18} color={c.muted} />}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.row,
        pressed && { backgroundColor: c.pressed },
      ]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={s.row}>{content}</View>
  );
}
function Field({
  label,
  value,
  onChange,
  keyboard = "default",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboard?: "default" | "email-address" | "decimal-pad" | "number-pad";
  placeholder?: string;
}) {
  const c = useTheme();
  const s = styles[c.mode];
  return (
    <View style={s.field}>
      <T style={s.fieldLabel}>{label}</T>
      <TextInput
        accessibilityLabel={label}
        style={s.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        placeholder={placeholder}
        placeholderTextColor={c.placeholder}
        keyboardAppearance={c.mode}
        autoCapitalize={keyboard === "email-address" ? "none" : "sentences"}
        selectionColor={c.accent}
      />
    </View>
  );
}
function Brand({ brand, size = 44 }: { brand: string; size?: number }) {
  const c = useTheme();
  const s = styles[c.mode];
  const bg =
    brand === "netflix"
      ? "#070707"
      : brand === "spotify"
        ? "#1ED760"
        : brand === "cloud"
          ? "#1687FA"
          : brand === "apple"
            ? "#fff"
            : "#4D51BD";
  return (
    <View
      style={[
        s.brand,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      {brand === "netflix" ? (
        <T
          style={{
            fontFamily: "Geist_700Bold",
            fontSize: size * 0.57,
            color: "#E50914",
          }}
        >
          N
        </T>
      ) : brand === "apple" ? (
        <Icon name="apple" color="#000" size={size * 0.58} />
      ) : brand === "spotify" ? (
        <Icon name="spotify" color="#06190C" size={size * 0.75} />
      ) : (
        <Icon
          name={brand === "cloud" ? "cloud" : "repeat"}
          color="#fff"
          size={size * 0.58}
        />
      )}
    </View>
  );
}
function AppContent() {
  const insets = useSafeAreaInsets();
  const headerInset = Platform.OS === "web" ? 36 : insets.top;
  const [fonts] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });
  const [data, setData] = useState<State>(initial);
  const c = palettes[data.appearance];
  const s = styles[data.appearance];
  const blue = c.accent,
    muted = c.muted;
  const [loaded, setLoaded] = useState(false);
  const [route, setRoute] = useState<Screen>("welcome");
  const [stack, setStack] = useState<Screen[]>([]);
  const scroll = useRef<ScrollView>(null);
  const headerBlurTarget = useRef<View>(null);
  const [selected, setSelected] = useState("apple");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [filter, setFilter] = useState<"active" | "cancelled">("active");
  const [query, setQuery] = useState("");
  const [sheet, setSheetContent] = useState<
    null | "more" | "cancel" | "remove" | "logout" | "reset" | "success"
  >(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const clearDrawer = useCallback(() => setSheetContent(null), []);
  const setSheet = (next: typeof sheet) => {
    if (next !== null) setSheetContent(next);
    setDrawerOpen(next !== null);
  };
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [draftFrequency, setDraftFrequency] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [accessEnd, setAccessEnd] = useState("");
  const [bank, setBank] = useState("Revolut");
  const [bankAccount, setBankAccount] = useState("4242");
  const [consent, setConsent] = useState(false);
  const [fromSetup, setFromSetup] = useState(false);
  const [help, setHelp] = useState<number | null>(null);
  const item = data.items.find((x) => x.id === selected) ?? data.items[0];
  useEffect(() => {
    AsyncStorage.getItem(STORAGE)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved?.items && saved?.accounts) {
            setData({
              ...saved,
              appearance: saved.appearance === "light" ? "light" : "dark",
            });
            if (saved.onboarded) setRoute("home");
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (loaded) void AsyncStorage.setItem(STORAGE, JSON.stringify(data));
  }, [data, loaded]);
  useEffect(() => {
    if (loaded && Platform.OS !== "web")
      Appearance.setColorScheme(data.appearance);
  }, [data.appearance, loaded]);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    setError("");
  }, [route]);
  const update = (patch: Partial<State>) =>
    setData((d) => ({ ...d, ...patch }));
  const go = (next: Screen) => {
    setStack((st) => [...st, route]);
    setRoute(next);
    haptic();
  };
  const back = () => {
    setRoute(stack[stack.length - 1] ?? "home");
    setStack((st) => st.slice(0, -1));
  };
  const root = (next: Screen) => {
    setStack([]);
    setRoute(next);
    setQuery("");
  };
  const openItem = (it: Subscription) => {
    setSelected(it.id);
    go("detail");
  };
  const active = data.items.filter((x) => x.status === "active");
  const edit = (it?: Subscription) => {
    setDraftName(it?.name ?? "");
    setDraftAmount(it ? String(it.amount) : "");
    setDraftDate(it?.renewal ?? "2026-11-25");
    setDraftFrequency(it?.frequency ?? "monthly");
    go(it ? "edit" : "add");
  };
  const validDate = (v: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !isNaN(Date.parse(v)) &&
    new Date(v).toISOString().slice(0, 10) === v;
  const saveSubscription = () => {
    const amount = Number(draftAmount.replace(",", "."));
    if (
      !draftName.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !validDate(draftDate)
    ) {
      setError(
        "Enter a name, a positive amount, and a valid date (YYYY-MM-DD).",
      );
      return;
    }
    if (route === "edit")
      update({
        items: data.items.map((x) =>
          x.id === selected
            ? {
                ...x,
                name: draftName.trim(),
                amount,
                renewal: draftDate,
                frequency: draftFrequency,
                dateSource: "user",
              }
            : x,
        ),
      });
    else {
      const added: Subscription = {
        id: String(Date.now()),
        name: draftName.trim(),
        amount,
        renewal: draftDate,
        frequency: draftFrequency,
        dateSource: "user",
        status: "active",
        brand: "custom",
        category: "Other",
        history: [],
      };
      update({ items: [...data.items, added] });
      setSelected(added.id);
    }
    setRoute("detail");
    setStack(["home", "subscriptions"]);
  };
  const finish = () => {
    update({ onboarded: true });
    root("home");
  };
  const switchTab = (r: Screen) => {
    root(r);
    haptic();
  };
  const tabs: Screen[] = ["home", "subscriptions", "activity", "profile"];
  const gradient = [
    "home",
    "welcome",
    "login",
    "verify",
    "name",
    "connect",
    "ready",
    "profile",
  ].includes(route);
  const title: Partial<Record<Screen, string>> = {
    subscriptions: "Subscriptions",
    activity: "Activity",
    accounts: "Linked accounts",
    banks: "Choose your bank",
    consent: "Connect your account",
    detected: "We found your subscriptions",
    settings: "Settings",
    notifications: "Notifications",
    help: "How can we help?",
    privacy: "Your data",
    insights: "Subscription spending",
    "edit-profile": "Personal details",
    edit: "Edit subscription",
    add: "Add a subscription",
    cancel: "How to cancel",
    provider: "Provider preview",
    "reminders-setup": "Stay one step ahead",
  };
  const subrow = (it: Subscription) => (
    <Pressable
      key={it.id}
      accessibilityRole="button"
      accessibilityLabel={`${it.name}, ${money(it.amount)}, ${it.frequency}`}
      onPress={() => openItem(it)}
      style={({ pressed }) => [s.subrow, pressed && { opacity: 0.65 }]}
    >
      <Brand brand={it.brand} />
      <View style={{ flex: 1 }}>
        <T style={s.medium}>{it.name}</T>
        <T style={s.caption}>
          {it.status === "cancelled"
            ? "Cancelled by you"
            : `${it.frequency === "yearly" ? "Yearly" : "Monthly"} · ${dateLabel(it.renewal)}`}
        </T>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <T>{money(it.amount)}</T>
      </View>
    </Pressable>
  );
  if (!fonts || !loaded)
    return (
      <View style={[s.app, { justifyContent: "center" }]}>
        <ActivityIndicator color={c.text} />
      </View>
    );
  return (
    <ThemeContext.Provider value={c}>
      <View style={s.outside}>
        <View style={s.app}>
          <StatusBar style={data.appearance === "light" ? "dark" : "light"} />
          {gradient && (
            <LinearGradient
              pointerEvents="none"
              colors={route === "home" ? c.homeGradient : c.pageGradient}
              locations={route === "home" ? [0, 0.2, 0.52, 1] : [0, 0.34, 0.72]}
              style={[
                StyleSheet.absoluteFill,
                {
                  height:
                    route === "home" ? 560 : route === "welcome" ? 320 : 680,
                },
              ]}
            />
          )}
          <View style={{ height: headerInset }} />
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <BlurTargetView ref={headerBlurTarget} style={{ flex: 1 }}>
              <ScrollView
                ref={scroll}
                contentContainerStyle={[
                  s.content,
                  route === "welcome" && { flexGrow: 1 },
                  tabs.includes(route) && {
                    paddingBottom: 110 + insets.bottom,
                  },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {title[route] && (
                  <T accessibilityRole="header" style={s.title}>
                    {title[route]}
                  </T>
                )}
                {route === "welcome" && (
                  <>
                    <T style={s.welcomeTitle}>
                      {"ALL YOUR\nSUBSCRIPTIONS.\nONE PLACE."}
                    </T>
                    <T style={s.welcomeSub}>
                      See what’s coming. Keep what you love.
                    </T>
                    <View style={s.heroWrap}>
                      <Image
                        source={require("./assets/welcome-hero.png")}
                        style={s.hero}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={{ gap: 10, paddingBottom: 12 }}>
                      <Button label="Get started" onPress={() => go("login")} />
                      <Button
                        label="Explore the demo"
                        secondary
                        onPress={finish}
                      />
                      <T style={s.footnote}>
                        A prototype with sample data. No real bank connections.
                      </T>
                    </View>
                  </>
                )}
                {route === "login" && (
                  <>
                    <T style={s.title}>Let’s get started</T>
                    <T style={s.description}>
                      Keep your subscriptions together. Enter your email to try
                      the sign-in flow.
                    </T>
                    <Field
                      label="Email address"
                      value={email}
                      onChange={setEmail}
                      keyboard="email-address"
                      placeholder="you@example.com"
                    />
                    <T style={s.footnote}>
                      Demo sign-in. No email will be sent.
                    </T>
                    <View style={{ marginTop: 28 }}>
                      <Button
                        label="Continue"
                        onPress={() => {
                          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            setError("Enter a valid email address.");
                            return;
                          }
                          setCode("");
                          go("verify");
                        }}
                      />
                    </View>
                  </>
                )}
                {route === "verify" && (
                  <>
                    <T style={s.title}>Check your inbox</T>
                    <T style={s.description}>
                      In the real app, we’d send a code to {email}. For this
                      demo, enter 123456.
                    </T>
                    <Field
                      label="Verification code"
                      value={code}
                      onChange={setCode}
                      keyboard="number-pad"
                      placeholder="6-digit code"
                    />
                    <Button
                      label="Verify"
                      onPress={() => {
                        if (code !== "123456") {
                          setError(
                            "That code doesn’t match. Use 123456 for this demo.",
                          );
                          return;
                        }
                        update({ email });
                        setDraftName(data.name);
                        go("name");
                      }}
                    />
                  </>
                )}
                {route === "name" && (
                  <>
                    <T style={s.title}>Your profile</T>
                    <T style={s.description}>Let’s make this feel like you.</T>
                    <View style={s.profileAvatar}>
                      <T
                        style={{
                          fontSize: 30,
                          fontFamily: "Geist_600SemiBold",
                        }}
                      >
                        {draftName.slice(0, 1).toUpperCase() || "A"}
                      </T>
                    </View>
                    <Field
                      label="Your name"
                      value={draftName}
                      onChange={setDraftName}
                    />
                    <Button
                      label="Continue"
                      disabled={!draftName.trim()}
                      onPress={() => {
                        update({ name: draftName.trim() });
                        go("connect");
                      }}
                    />
                  </>
                )}
                {route === "connect" && (
                  <>
                    <View style={s.largeSymbol}>
                      <Icon name="link" size={48} />
                    </View>
                    <T style={s.title}>All together now</T>
                    <T style={s.description}>
                      Link your accounts to spot recurring payments and see your
                      subscriptions in one place.
                    </T>
                    <Group>
                      <Row icon="bank" title="Multiple accounts, one view" />
                      <Row
                        icon="shield"
                        title="You’re always in control"
                        sub="Disconnect an account whenever you like"
                      />
                    </Group>
                    <T style={s.footnote}>
                      This prototype connects fictional accounts only.
                    </T>
                    <Button
                      label="Link a demo account"
                      onPress={() => {
                        setFromSetup(true);
                        go("banks");
                      }}
                    />
                    <Button
                      label="Use sample subscriptions"
                      secondary
                      onPress={() => go("detected")}
                    />
                  </>
                )}
                {route === "home" && (
                  <>
                    <View style={s.balance}>
                      <T style={{ fontSize: 15 }}>Subscriptions · EUR</T>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Switch monthly or yearly total"
                        onPress={() =>
                          setPeriod(period === "monthly" ? "yearly" : "monthly")
                        }
                      >
                        <T style={s.amount}>
                          €
                          {
                            totalFor(data.items, period)
                              .toFixed(2)
                              .split(".")[0]
                          }
                          <T
                            style={{
                              fontSize: 22,
                              fontFamily: "Geist_600SemiBold",
                            }}
                          >
                            .
                            {
                              totalFor(data.items, period)
                                .toFixed(2)
                                .split(".")[1]
                            }
                          </T>
                        </T>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Change spending period"
                        style={[s.period, { backgroundColor: "transparent" }]}
                        onPress={() =>
                          setPeriod(period === "monthly" ? "yearly" : "monthly")
                        }
                      >
                        <GlassSurface
                          pointerEvents="none"
                          interactive
                          style={[
                            StyleSheet.absoluteFill,
                            { borderRadius: 25 },
                          ]}
                        />
                        <T style={{ fontSize: 14 }}>
                          {period === "monthly" ? "Per month" : "Per year"}
                        </T>
                        <Icon name="chevron" size={13} />
                      </Pressable>
                    </View>
                    <View style={s.dots}>
                      <View style={s.dot} />
                      <View style={[s.dot, { opacity: 0.35 }]} />
                    </View>
                    <View style={s.actions}>
                      {(
                        [
                          { icon: "add", label: "Add new", fn: () => edit() },
                          {
                            icon: "bank",
                            label: "Accounts",
                            fn: () => go("accounts"),
                          },
                          {
                            icon: "bell",
                            label: "Reminders",
                            fn: () => go("notifications"),
                          },
                          {
                            icon: "more",
                            label: "More",
                            fn: () => setSheet("more"),
                          },
                        ] as { icon: IconName; label: string; fn: () => void }[]
                      ).map((a) => (
                        <View key={a.label} style={s.action}>
                          <IconButton
                            name={a.icon}
                            label={a.label}
                            onPress={a.fn}
                          />
                          <T style={{ fontSize: 12, marginTop: 9 }}>
                            {a.label}
                          </T>
                        </View>
                      ))}
                    </View>
                    <Group>
                      <View style={s.sectionTop}>
                        <T style={s.sectionLabel}>Upcoming payments</T>
                        <T style={s.caption}>November</T>
                      </View>
                      {active.slice(0, 3).map(subrow)}
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => root("subscriptions")}
                        style={s.seeAll}
                      >
                        <T>See all</T>
                      </Pressable>
                    </Group>
                    <Group>
                      <Row
                        icon="link"
                        title="Linked accounts"
                        sub={
                          data.accounts.length
                            ? `${data.accounts.length} accounts connected`
                            : "Bring your accounts together"
                        }
                        onPress={() => go("accounts")}
                      />
                    </Group>
                    <Group>
                      <View style={s.sectionTop}>
                        <T style={s.sectionLabel}>Your monthly spending</T>
                        <Icon name="chart" size={18} color={muted} />
                      </View>
                      <View
                        style={{ paddingHorizontal: 16, paddingBottom: 18 }}
                      >
                        <T
                          style={{ fontSize: 26, fontFamily: "Geist_700Bold" }}
                        >
                          {money(totalFor(data.items, "monthly"))}
                          <T style={[s.caption, { color: c.success }]}>
                            {" "}
                            · {active.length} active
                          </T>
                        </T>
                        <View style={s.spendTrack}>
                          {active.map((x, i) => (
                            <View
                              key={x.id}
                              style={{
                                flex:
                                  x.amount *
                                  (x.frequency === "yearly" ? 1 / 12 : 1),
                                backgroundColor: [
                                  "#8FACFF",
                                  "#536AFF",
                                  "#C1CCFF",
                                  "#394493",
                                ][i % 4],
                              }}
                            />
                          ))}
                        </View>
                        <T style={s.caption}>
                          All active subscriptions, at a monthly rate
                        </T>
                      </View>
                    </Group>
                    <T style={s.footnote}>Sample data · November 2026</T>
                  </>
                )}
                {(route === "subscriptions" || route === "activity") && (
                  <>
                    <View style={s.search}>
                      <Icon name="search" size={20} color={muted} />
                      <TextInput
                        accessibilityLabel={
                          route === "activity"
                            ? "Search activity"
                            : "Search subscriptions"
                        }
                        placeholder="Search"
                        placeholderTextColor={muted}
                        value={query}
                        onChangeText={setQuery}
                        style={[s.input, { paddingVertical: 0, flex: 1 }]}
                      />
                    </View>
                    {route === "subscriptions" ? (
                      <>
                        <View style={s.segments}>
                          {(["active", "cancelled"] as const).map((f) => (
                            <Pressable
                              key={f}
                              accessibilityRole="button"
                              onPress={() => setFilter(f)}
                              style={[
                                s.segment,
                                filter === f && s.segmentActive,
                              ]}
                            >
                              <T
                                style={{ color: filter === f ? c.text : muted }}
                              >
                                {f === "active" ? "Active" : "Cancelled"} ·{" "}
                                {
                                  data.items.filter((x) => x.status === f)
                                    .length
                                }
                              </T>
                            </Pressable>
                          ))}
                        </View>
                        <Group>
                          {data.items
                            .filter(
                              (x) =>
                                x.status === filter &&
                                x.name
                                  .toLowerCase()
                                  .includes(query.toLowerCase()),
                            )
                            .map(subrow)}
                        </Group>
                        {!data.items.some(
                          (x) =>
                            x.status === filter &&
                            x.name.toLowerCase().includes(query.toLowerCase()),
                        ) && (
                          <View style={s.empty}>
                            <Icon name="repeat" size={40} />
                            <T style={s.sectionTitle}>No subscriptions here</T>
                            <T style={s.description}>
                              Try another search or add a subscription.
                            </T>
                          </View>
                        )}
                        <T style={s.footnote}>
                          Renewals are estimates unless you’ve set the date.
                        </T>
                      </>
                    ) : (
                      <>
                        <T style={s.description}>
                          Your observed payments, including subscriptions you’ve
                          cancelled or stopped tracking.
                        </T>
                        {data.items
                          .filter((x) =>
                            x.name.toLowerCase().includes(query.toLowerCase()),
                          )
                          .flatMap((it) =>
                            it.history.map((h, i) => (
                              <Group key={`${it.id}-${i}`}>
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`${it.name} payment ${money(h.amount)}`}
                                  onPress={() => openItem(it)}
                                  style={s.subrow}
                                >
                                  <Brand brand={it.brand} />
                                  <View style={{ flex: 1 }}>
                                    <T>{it.name}</T>
                                    <T style={s.caption}>
                                      {dateLabel(h.date, true)} · Completed
                                    </T>
                                  </View>
                                  <T>−{money(h.amount)}</T>
                                </Pressable>
                              </Group>
                            )),
                          )}
                      </>
                    )}
                  </>
                )}
                {route === "detail" && (
                  <>
                    <View style={s.detailHero}>
                      <View>
                        <T style={s.detailAmount}>{money(item.amount)}</T>
                        <T style={{ marginTop: 7 }}>{item.name}</T>
                        <T style={s.caption}>
                          {item.frequency === "yearly" ? "Yearly" : "Monthly"}{" "}
                          subscription
                        </T>
                      </View>
                      <Brand brand={item.brand} size={60} />
                    </View>
                    <Group>
                      <Row
                        title="Status"
                        right={
                          <T
                            style={{
                              color:
                                item.status === "active" ? c.success : muted,
                            }}
                          >
                            {item.status === "active"
                              ? "Active"
                              : item.status === "cancelled"
                                ? "Cancelled by you"
                                : "Not tracked"}
                          </T>
                        }
                      />
                      {item.status === "active" ? (
                        <Row
                          title="Next payment"
                          sub={
                            item.dateSource === "user"
                              ? "Set by you"
                              : "Estimated renewal"
                          }
                          right={<T>{dateLabel(item.renewal, true)}</T>}
                        />
                      ) : item.accessEnd ? (
                        <Row
                          title="Access until"
                          right={<T>{dateLabel(item.accessEnd, true)}</T>}
                        />
                      ) : null}
                      <Row
                        title="Frequency"
                        right={
                          <T>
                            {item.frequency === "yearly" ? "Yearly" : "Monthly"}
                          </T>
                        }
                      />
                    </Group>
                    <Group>
                      <Row
                        title="Monthly equivalent"
                        right={
                          <T>
                            {money(
                              item.amount *
                                (item.frequency === "yearly" ? 1 / 12 : 1),
                            )}
                          </T>
                        }
                      />
                      <Row
                        title="Category"
                        right={<T style={{ color: blue }}>{item.category}</T>}
                      />
                    </Group>
                    <Group>
                      <Row
                        icon="edit"
                        title="Edit details"
                        onPress={() => edit(item)}
                      />
                      <Row
                        icon="bell"
                        title="Renewal reminder"
                        sub={
                          data.reminders
                            ? `${data.days} days before renewal`
                            : "Off"
                        }
                        onPress={() => go("notifications")}
                      />
                    </Group>
                    <T style={s.sectionTitle}>Payments</T>
                    <Group>
                      {item.history.length ? (
                        item.history.map((h, i) => (
                          <Row
                            key={i}
                            title={dateLabel(h.date, true)}
                            sub="Observed payment · Completed"
                            right={<T>−{money(h.amount)}</T>}
                          />
                        ))
                      ) : (
                        <Row title="No observed payments yet" />
                      )}
                    </Group>
                    {item.status === "active" && (
                      <Group>
                        <Row
                          icon="help"
                          title="How to cancel"
                          onPress={() => go("cancel")}
                        />
                        <Row
                          icon="close"
                          title="Not a subscription?"
                          onPress={() => setSheet("remove")}
                        />
                      </Group>
                    )}
                    <T style={s.footnote}>
                      Sample subscription. Payment history is kept when you
                      cancel or remove it.
                    </T>
                  </>
                )}
                {(route === "edit" || route === "add") && (
                  <>
                    <T style={s.description}>
                      {route === "edit"
                        ? "Keep your subscription details up to date."
                        : "Track a recurring payment in one place."}
                    </T>
                    <Field
                      label="Subscription name"
                      value={draftName}
                      onChange={setDraftName}
                      placeholder="e.g. Netflix"
                    />
                    <Field
                      label="Amount in EUR"
                      value={draftAmount}
                      onChange={setDraftAmount}
                      keyboard="decimal-pad"
                      placeholder="0.00"
                    />
                    <T style={s.fieldLabel}>Frequency</T>
                    <View style={s.segments}>
                      {(["monthly", "yearly"] as const).map((f) => (
                        <Pressable
                          key={f}
                          accessibilityRole="button"
                          onPress={() => setDraftFrequency(f)}
                          style={[
                            s.segment,
                            draftFrequency === f && s.segmentActive,
                          ]}
                        >
                          <T>{f === "monthly" ? "Monthly" : "Yearly"}</T>
                        </Pressable>
                      ))}
                    </View>
                    <Field
                      label="Next renewal (YYYY-MM-DD)"
                      value={draftDate}
                      onChange={setDraftDate}
                    />
                    <Button
                      label={
                        route === "edit" ? "Save changes" : "Add subscription"
                      }
                      onPress={saveSubscription}
                    />
                    <Button label="Discard changes" secondary onPress={back} />
                  </>
                )}
                {route === "cancel" && (
                  <>
                    <Brand brand={item.brand} size={64} />
                    <T style={[s.sectionTitle, { marginTop: 20 }]}>
                      Cancel with {item.name}
                    </T>
                    <T style={s.description}>
                      Your subscription is managed by the provider. You’ll need
                      to cancel there first.
                    </T>
                    <Group>
                      <Row
                        title="1. Open your provider account"
                        sub="Sign in with the account you subscribed with"
                      />
                      <Row
                        title="2. Find your subscription"
                        sub="Follow the provider’s cancellation steps"
                      />
                      <Row
                        title="3. Update Subscript"
                        sub="Mark it as cancelled once you’re done"
                      />
                    </Group>
                    <Button
                      label="Preview provider website"
                      onPress={() => go("provider")}
                    />
                    <Button
                      label="I’ve cancelled with the provider"
                      secondary
                      onPress={() => {
                        setAccessEnd("");
                        setSheet("cancel");
                      }}
                    />
                    <T style={s.footnote}>
                      Marking it here doesn’t stop payments with the provider.
                    </T>
                  </>
                )}
                {route === "provider" && (
                  <>
                    <View style={s.largeSymbol}>
                      <Icon name="external" size={40} />
                    </View>
                    <T style={s.sectionTitle}>{item.name} account</T>
                    <T style={s.description}>
                      This is a preview of the handoff. In the real app, you’d
                      leave Subscript to manage your subscription with{" "}
                      {item.name}.
                    </T>
                    <Group>
                      <Row
                        title="No cancellation has been made"
                        sub="This prototype does not contact the provider."
                      />
                    </Group>
                    <Button label="Return to Subscript" onPress={back} />
                  </>
                )}
                {route === "profile" && (
                  <>
                    <View style={s.profileHead}>
                      <View style={s.profileAvatar}>
                        <T
                          style={{
                            fontSize: 28,
                            fontFamily: "Geist_600SemiBold",
                          }}
                        >
                          {data.name
                            .split(" ")
                            .map((x) => x[0])
                            .join("")
                            .slice(0, 2)}
                        </T>
                      </View>
                      <T
                        style={{
                          fontFamily: "Geist_600SemiBold",
                          fontSize: 24,
                        }}
                      >
                        {data.name}
                      </T>
                      <T style={s.caption}>{data.email}</T>
                    </View>
                    <View style={s.tiles}>
                      <Pressable
                        accessibilityRole="button"
                        style={s.tile}
                        onPress={() => go("accounts")}
                      >
                        <Icon name="bank" size={28} />
                        <T style={{ marginTop: 24 }}>Linked accounts</T>
                        <T style={s.caption}>
                          {data.accounts.length} connected
                        </T>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        style={s.tile}
                        onPress={() => go("insights")}
                      >
                        <Icon name="chart" size={28} />
                        <T style={{ marginTop: 24 }}>Your subscriptions</T>
                        <T style={s.caption}>{active.length} active</T>
                      </Pressable>
                    </View>
                    <Group>
                      <Row
                        icon="help"
                        title="Help"
                        onPress={() => go("help")}
                      />
                      <Row
                        icon="user"
                        title="Account"
                        onPress={() => {
                          setDraftName(data.name);
                          setEmail(data.email);
                          go("edit-profile");
                        }}
                      />
                      <Row
                        icon="activity"
                        title="Payment history"
                        onPress={() => root("activity")}
                      />
                    </Group>
                    <Group>
                      <Row
                        icon="shield"
                        title="Privacy"
                        onPress={() => go("privacy")}
                      />
                      <Row
                        icon="bell"
                        title="Notification settings"
                        onPress={() => go("notifications")}
                      />
                      <Row
                        icon="settings"
                        title="App settings"
                        onPress={() => go("settings")}
                      />
                    </Group>
                    <Group>
                      <Row
                        icon="logout"
                        title="Log out"
                        onPress={() => setSheet("logout")}
                      />
                    </Group>
                    <T style={s.footnote}>
                      {
                        "Subscript · Revolut design study\nNative prototype · 1.0.0"
                      }
                    </T>
                  </>
                )}
                {route === "accounts" && (
                  <>
                    <T style={s.description}>All your accounts, together.</T>
                    {data.accounts.map((a) => (
                      <Group key={a.id}>
                        <Row
                          icon="bank"
                          title={a.bank}
                          sub={`${a.name} · ${a.last4}`}
                        />
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Disconnect ${a.bank} ${a.last4}`}
                          onPress={() =>
                            update({
                              accounts: data.accounts.filter(
                                (x) => x.id !== a.id,
                              ),
                            })
                          }
                          style={s.seeAll}
                        >
                          <T style={{ color: blue }}>Disconnect account</T>
                        </Pressable>
                      </Group>
                    ))}
                    {!data.accounts.length && (
                      <View style={s.empty}>
                        <Icon name="bank" size={44} />
                        <T style={s.sectionTitle}>Link your first account</T>
                        <T style={s.description}>
                          Find recurring payments across your banks.
                        </T>
                      </View>
                    )}
                    <Button
                      label="Link a demo account"
                      onPress={() => {
                        setFromSetup(false);
                        go("banks");
                      }}
                    />
                    <T style={s.footnote}>
                      Fictional accounts only. No bank credentials are
                      requested.
                    </T>
                  </>
                )}
                {route === "banks" && (
                  <>
                    <T style={s.description}>
                      Choose a bank to preview linking an account.
                    </T>
                    <Group>
                      {[
                        "Revolut",
                        "Monzo",
                        "Barclays",
                        "HSBC",
                        "BNP Paribas",
                      ].map((b) => (
                        <Row
                          key={b}
                          title={b}
                          icon="bank"
                          onPress={() => {
                            setBank(b);
                            setBankAccount("4242");
                            setConsent(false);
                            go("consent");
                          }}
                        />
                      ))}
                    </Group>
                  </>
                )}
                {route === "consent" && (
                  <>
                    <View style={s.largeSymbol}>
                      <Icon name="bank" size={44} />
                    </View>
                    <T style={s.sectionTitle}>{bank}</T>
                    <T style={s.description}>
                      Choose a fictional account. Subscript will use sample
                      transactions to demonstrate subscription detection.
                    </T>
                    <Group>
                      {[
                        { last4: "4242", name: "Personal account" },
                        { last4: "8701", name: "Joint account" },
                      ].map((a) => {
                        const linked = data.accounts.some(
                          (x) => x.id === `${bank}:${a.last4}`,
                        );
                        return (
                          <Row
                            key={a.last4}
                            title={a.name}
                            sub={`•• ${a.last4}${linked ? " · Already linked" : ""}`}
                            onPress={() => !linked && setBankAccount(a.last4)}
                            right={
                              <Icon
                                name={
                                  bankAccount === a.last4 ? "check" : "card"
                                }
                                color={bankAccount === a.last4 ? blue : muted}
                              />
                            }
                          />
                        );
                      })}
                    </Group>
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: consent }}
                      onPress={() => setConsent(!consent)}
                      style={s.consent}
                    >
                      <View
                        style={[
                          s.checkbox,
                          consent && {
                            backgroundColor: blue,
                            borderColor: blue,
                          },
                        ]}
                      >
                        {consent && (
                          <Icon name="check" color={c.onAccent} size={16} />
                        )}
                      </View>
                      <T style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>
                        Use sample account data for this demo. No real banking
                        access is granted.
                      </T>
                    </Pressable>
                    <Button
                      label="Connect demo account"
                      disabled={
                        !consent ||
                        data.accounts.some(
                          (a) => a.id === `${bank}:${bankAccount}`,
                        )
                      }
                      onPress={() => {
                        update({
                          accounts: [
                            ...data.accounts,
                            {
                              id: `${bank}:${bankAccount}`,
                              bank,
                              last4: bankAccount,
                              name:
                                bankAccount === "4242"
                                  ? "Personal account"
                                  : "Joint account",
                            },
                          ],
                        });
                        if (fromSetup) go("detected");
                        else {
                          setRoute("accounts");
                          setStack(["home"]);
                        }
                      }}
                    />
                  </>
                )}
                {route === "detected" && (
                  <>
                    <T style={s.description}>
                      Review these sample recurring payments. You can edit or
                      remove them later.
                    </T>
                    <Group>{active.map(subrow)}</Group>
                    <Button
                      label="Continue"
                      onPress={() => go("reminders-setup")}
                    />
                    <Button
                      label="Link another account"
                      secondary
                      onPress={() => {
                        setFromSetup(true);
                        go("banks");
                      }}
                    />
                  </>
                )}
                {(route === "notifications" || route === "reminders-setup") && (
                  <>
                    <T style={s.description}>
                      A little heads-up before your next payment.
                    </T>
                    <Group>
                      <Row
                        icon="bell"
                        title="Renewal reminders"
                        right={
                          <Switch
                            thumbColor="#FFFFFF"
                            accessibilityLabel="Renewal reminders"
                            value={data.reminders}
                            onValueChange={(v) => update({ reminders: v })}
                            trackColor={{
                              false: c.switchOff,
                              true: c.switchOn,
                            }}
                          />
                        }
                      />
                    </Group>
                    {data.reminders && (
                      <>
                        <T style={s.sectionTitle}>Remind me</T>
                        <Group>
                          {[1, 3, 7].map((n) => (
                            <Row
                              key={n}
                              title={`${n} ${n === 1 ? "day" : "days"} before`}
                              onPress={() => update({ days: n })}
                              right={
                                data.days === n ? (
                                  <Icon name="check" color={blue} />
                                ) : undefined
                              }
                            />
                          ))}
                        </Group>
                        <View style={s.notice}>
                          <Icon name="bell" color={blue} />
                          <View style={{ flex: 1 }}>
                            <T style={s.medium}>
                              Your next payment is coming up
                            </T>
                            <T style={s.caption}>
                              {active[0]
                                ? `${active[0].name} · ${money(active[0].amount)} in ${data.days} days`
                                : "Add a subscription to preview a reminder."}
                            </T>
                          </View>
                        </View>
                      </>
                    )}
                    <T style={s.footnote}>
                      Preview only. This prototype saves your preference but
                      doesn’t send notifications.
                    </T>
                    {route === "reminders-setup" && (
                      <Button label="Continue" onPress={() => go("ready")} />
                    )}
                  </>
                )}
                {route === "ready" && (
                  <>
                    <View style={[s.largeSymbol, { marginTop: 90 }]}>
                      <Icon name="check" size={56} color={blue} />
                    </View>
                    <T style={[s.title, { textAlign: "center" }]}>
                      You’re all set
                    </T>
                    <T style={[s.description, { textAlign: "center" }]}>
                      Your subscriptions have a new home.
                    </T>
                    <Button label="Go to my subscriptions" onPress={finish} />
                  </>
                )}
                {route === "edit-profile" && (
                  <>
                    <Field
                      label="Full name"
                      value={draftName}
                      onChange={setDraftName}
                    />
                    <Field
                      label="Email address"
                      value={email}
                      onChange={setEmail}
                      keyboard="email-address"
                    />
                    <Button
                      label="Save details"
                      onPress={() => {
                        if (
                          !draftName.trim() ||
                          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                        ) {
                          setError(
                            "Enter your name and a valid email address.",
                          );
                          return;
                        }
                        update({ name: draftName.trim(), email });
                        back();
                      }}
                    />
                  </>
                )}
                {route === "settings" && (
                  <>
                    <T style={s.sectionTitle}>Appearance</T>
                    <Group>
                      <Row
                        icon="sun"
                        title="Light mode"
                        sub={data.appearance === "light" ? "On" : "Off"}
                        right={
                          <Switch
                            thumbColor="#FFFFFF"
                            accessibilityLabel="Light mode"
                            value={data.appearance === "light"}
                            onValueChange={(enabled) => {
                              haptic();
                              update({
                                appearance: enabled ? "light" : "dark",
                              });
                            }}
                            trackColor={{
                              false: c.switchOff,
                              true: c.switchOn,
                            }}
                          />
                        }
                      />
                    </Group>
                    <Group>
                      <Row
                        icon="bell"
                        title="Notifications"
                        onPress={() => go("notifications")}
                      />
                      <Row
                        icon="bank"
                        title="Linked accounts"
                        onPress={() => go("accounts")}
                      />
                      <Row
                        icon="mail"
                        title="Monthly email summary"
                        right={
                          <Switch
                            thumbColor="#FFFFFF"
                            accessibilityLabel="Monthly email summary"
                            value={data.summary}
                            onValueChange={(v) => update({ summary: v })}
                            trackColor={{
                              false: c.switchOff,
                              true: c.switchOn,
                            }}
                          />
                        }
                      />
                    </Group>
                    <T style={s.footnote}>
                      Email summaries are a saved demo preference. No emails are
                      sent.
                    </T>
                    <Group>
                      <Row
                        icon="shield"
                        title="Privacy"
                        onPress={() => go("privacy")}
                      />
                      <Row
                        icon="help"
                        title="Help"
                        onPress={() => go("help")}
                      />
                      <Row
                        icon="repeat"
                        title="Restart onboarding"
                        onPress={() => {
                          setFromSetup(true);
                          go("login");
                        }}
                      />
                      <Row
                        icon="close"
                        title="Reset demo"
                        danger
                        onPress={() => setSheet("reset")}
                      />
                    </Group>
                  </>
                )}
                {route === "privacy" && (
                  <>
                    <Group>
                      <Row
                        icon="shield"
                        title="Stored on this device"
                        sub="Your demo edits and preferences stay in local app storage."
                      />
                      <Row
                        icon="bank"
                        title="No bank access"
                        sub="All accounts and transactions are fictional."
                      />
                      <Row
                        icon="close"
                        title="Clear your demo data"
                        sub="Use Reset demo in App settings to start over."
                      />
                    </Group>
                    <T style={s.description}>
                      This is a design prototype. It does not move money,
                      contact providers, verify cancellation, or send
                      notifications.
                    </T>
                  </>
                )}
                {route === "help" && (
                  <Group>
                    {[
                      {
                        q: "How are subscriptions found?",
                        a: "In this prototype, subscriptions come from a fictional sample dataset. A connected production service would look for recurring transactions.",
                      },
                      {
                        q: "Does cancelling here stop payments?",
                        a: "No. Cancel with your provider first, then mark the subscription as cancelled here. Payment history stays visible.",
                      },
                      {
                        q: "Why is my monthly total different?",
                        a: "Annual subscriptions are divided by 12. Cancelled or untracked subscriptions are excluded from future totals.",
                      },
                      {
                        q: "Can I connect more than one account?",
                        a: "Yes. Choose personal or joint demo accounts at the same bank, or connect different banks. The same account cannot be added twice.",
                      },
                    ].map((v, i) => (
                      <View key={v.q}>
                        <Row
                          title={v.q}
                          onPress={() => setHelp(help === i ? null : i)}
                        />
                        {help === i && (
                          <T style={[s.description, { paddingHorizontal: 16 }]}>
                            {v.a}
                          </T>
                        )}
                      </View>
                    ))}
                  </Group>
                )}
                {route === "insights" && (
                  <>
                    <T style={s.description}>
                      Monthly equivalent across active subscriptions
                    </T>
                    <T style={[s.amount, { marginBottom: 24 }]}>
                      {money(totalFor(data.items, "monthly"))}
                    </T>
                    <Group>
                      {active.map((x) => (
                        <View key={x.id} style={{ padding: 16 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <T>{x.name}</T>
                            <T>
                              {money(
                                x.amount *
                                  (x.frequency === "yearly" ? 1 / 12 : 1),
                              )}
                            </T>
                          </View>
                          <View style={s.spendTrack}>
                            <View
                              style={{
                                width: `${totalFor(data.items, "monthly") ? ((x.amount * (x.frequency === "yearly" ? 1 / 12 : 1)) / totalFor(data.items, "monthly")) * 100 : 0}%`,
                                backgroundColor: blue,
                                borderRadius: 8,
                              }}
                            />
                          </View>
                        </View>
                      ))}
                    </Group>
                    <T style={s.footnote}>
                      Yearly projection: {money(totalFor(data.items, "yearly"))}
                      . Based on your current active subscriptions.
                    </T>
                  </>
                )}
                {!!error && (
                  <T accessibilityRole="alert" style={s.error}>
                    {error}
                  </T>
                )}
              </ScrollView>
            </BlurTargetView>
            <View style={s.fixedHeader}>
              <BlurView
                pointerEvents="none"
                intensity={80}
                tint={data.appearance === "light" ? "light" : "dark"}
                style={[StyleSheet.absoluteFill, { top: -headerInset }]}
                {...(Platform.OS === "android"
                  ? {
                      blurTarget: headerBlurTarget,
                      blurMethod: "dimezisBlurViewSdk31Plus" as const,
                    }
                  : {})}
              />
              {route === "home" ? (
                <View style={s.topbar}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open profile"
                    onPress={() => root("profile")}
                    style={s.avatarSmall}
                  >
                    <T style={{ fontSize: 13 }}>
                      {data.name
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)}
                    </T>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Search subscriptions"
                    style={[s.searchTop, { backgroundColor: "transparent" }]}
                    onPress={() => root("subscriptions")}
                  >
                    <GlassSurface
                      pointerEvents="none"
                      interactive
                      style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
                    />
                    <Icon name="search" size={18} />
                    <T style={{ fontSize: 15 }}>Search</T>
                  </Pressable>
                  <IconButton
                    name="chart"
                    label="Spending insights"
                    onPress={() => go("insights")}
                  />
                  <IconButton
                    name="card"
                    label="Linked accounts"
                    onPress={() => go("accounts")}
                  />
                </View>
              ) : route === "welcome" ? (
                <View style={s.topbar}>
                  <T
                    style={{
                      fontFamily: "Geist_700Bold",
                      fontSize: 23,
                      letterSpacing: -1,
                    }}
                  >
                    Subscript
                  </T>
                  <View style={{ flex: 1 }} />
                  <T style={s.tiny}>PROTOTYPE</T>
                </View>
              ) : route === "profile" ? (
                <View style={s.topbar}>
                  <IconButton
                    name="close"
                    label="Close profile"
                    onPress={() => root("home")}
                    plain
                  />
                  <View style={{ flex: 1 }} />
                  <View style={s.smallPill}>
                    <Icon name="shield" size={14} />
                    <T style={{ fontSize: 12 }}>Your account</T>
                  </View>
                </View>
              ) : (
                <View style={s.topbar}>
                  {!tabs.includes(route) && (
                    <IconButton name="back" label="Back" onPress={back} plain />
                  )}
                  <View style={{ flex: 1 }} />
                  {route === "subscriptions" && (
                    <IconButton
                      name="add"
                      label="Add a subscription"
                      onPress={() => edit()}
                    />
                  )}
                </View>
              )}
            </View>
            {tabs.includes(route) && (
              <GlassSurface
                fallbackColor={c.tabbar}
                style={[
                  s.tabbar,
                  {
                    bottom: Math.max(insets.bottom, 16),
                  },
                ]}
              >
                {(
                  [
                    { r: "home", label: "Home", icon: "home" },
                    {
                      r: "subscriptions",
                      label: "Subscriptions",
                      icon: "repeat",
                    },
                    { r: "activity", label: "Activity", icon: "activity" },
                    { r: "profile", label: "Profile", icon: "user" },
                  ] as { r: Screen; label: string; icon: IconName }[]
                ).map((t) => (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected: route === t.r }}
                    accessibilityLabel={t.label}
                    onPress={() => switchTab(t.r)}
                    key={t.r}
                    style={[
                      s.tab,
                      route === t.r && { backgroundColor: c.tabSelected },
                    ]}
                  >
                    <Icon
                      name={t.icon}
                      color={route === t.r ? c.text : c.tabMuted}
                      size={23}
                    />
                    <T
                      style={{
                        fontSize: 10,
                        marginTop: 5,
                        color: route === t.r ? c.text : c.tabMuted,
                      }}
                    >
                      {t.label}
                    </T>
                  </Pressable>
                ))}
              </GlassSurface>
            )}
          </KeyboardAvoidingView>
          {sheet !== null && (
            <BottomDrawer
              open={drawerOpen}
              onClose={closeDrawer}
              onClosed={clearDrawer}
              style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
            >
              <View style={s.handle} />
              <View style={s.sheetHeading}>
                <T style={[s.sectionTitle, { flex: 1 }]}>
                  {sheet === "more"
                    ? "More"
                    : sheet === "cancel"
                      ? `Mark ${item.name} as cancelled?`
                      : sheet === "remove"
                        ? "Remove from subscriptions?"
                        : sheet === "logout"
                          ? "Log out?"
                          : sheet === "reset"
                            ? "Reset the demo?"
                            : "All done"}
                </T>
                <IconButton
                  name="close"
                  label="Close sheet"
                  onPress={() => setSheet(null)}
                  plain
                />
              </View>
              {sheet === "more" ? (
                <Group>
                  <Row
                    icon="chart"
                    title="Spending insights"
                    onPress={() => {
                      setSheet(null);
                      go("insights");
                    }}
                  />
                  <Row
                    icon="repeat"
                    title="Cancelled subscriptions"
                    onPress={() => {
                      setSheet(null);
                      setFilter("cancelled");
                      root("subscriptions");
                    }}
                  />
                  <Row
                    icon="settings"
                    title="Settings"
                    onPress={() => {
                      setSheet(null);
                      go("settings");
                    }}
                  />
                </Group>
              ) : sheet === "cancel" ? (
                <>
                  <T style={s.description}>
                    Only continue if you’ve cancelled with the provider. This
                    updates your tracking and won’t stop payments on its own.
                  </T>
                  <Field
                    label="Access ends (optional, YYYY-MM-DD)"
                    value={accessEnd}
                    onChange={setAccessEnd}
                  />
                  {error && <T style={s.error}>{error}</T>}
                  <Button
                    label="Mark as cancelled"
                    onPress={() => {
                      if (accessEnd && !validDate(accessEnd)) {
                        setError("Enter a valid date, or leave it blank.");
                        return;
                      }
                      update({
                        items: data.items.map((x) =>
                          x.id === item.id
                            ? cancelSubscription(x, accessEnd)
                            : x,
                        ),
                      });
                      setSuccess(
                        `${item.name} is marked as cancelled. Your totals are updated and payment history is kept.`,
                      );
                      setSheet("success");
                      setRoute("detail");
                      setStack(["home", "subscriptions"]);
                    }}
                  />
                  <Button
                    label="Keep subscription"
                    secondary
                    onPress={() => setSheet(null)}
                  />
                </>
              ) : sheet === "success" ? (
                <>
                  <View style={s.successIcon}>
                    <Icon name="check" size={34} color={blue} />
                  </View>
                  <T style={s.description}>{success}</T>
                  <Button label="Done" onPress={() => setSheet(null)} />
                </>
              ) : (
                <>
                  <T style={s.description}>
                    {sheet === "remove"
                      ? "This removes it from your subscriptions and totals. Observed payments remain in Activity."
                      : sheet === "logout"
                        ? "Your demo edits will stay on this device."
                        : "Your subscription edits, linked accounts, and preferences will return to the starting sample."}
                  </T>
                  <Button
                    label={
                      sheet === "remove"
                        ? "Remove subscription"
                        : sheet === "logout"
                          ? "Log out"
                          : "Reset demo"
                    }
                    onPress={() => {
                      if (sheet === "remove") {
                        update({
                          items: data.items.map((x) =>
                            x.id === item.id ? { ...x, status: "removed" } : x,
                          ),
                        });
                        root("subscriptions");
                      } else if (sheet === "logout") {
                        update({ onboarded: false });
                        root("welcome");
                      } else {
                        setData(initial);
                        root("welcome");
                      }
                      setSheet(null);
                    }}
                  />
                  <Button
                    label="Keep as is"
                    secondary
                    onPress={() => setSheet(null)}
                  />
                </>
              )}
            </BottomDrawer>
          )}
        </View>
      </View>
    </ThemeContext.Provider>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <GlassProvider>
        <AppContent />
      </GlassProvider>
    </SafeAreaProvider>
  );
}
const createStyles = (c: Palette) =>
  StyleSheet.create({
    outside: { flex: 1, backgroundColor: c.outside, alignItems: "center" },
    app: {
      flex: 1,
      width: "100%",
      maxWidth: 480,
      backgroundColor: c.background,
      overflow: "hidden",
    },
    text: { fontFamily: "Geist_400Regular", fontSize: 16, color: c.text },
    content: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 40 },
    fixedHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 60,
      paddingHorizontal: 16,
    },
    topbar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: 52,
      marginBottom: 8,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.chrome,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarSmall: {
      height: 36,
      width: 36,
      borderRadius: 18,
      backgroundColor: c.avatar,
      alignItems: "center",
      justifyContent: "center",
    },
    searchTop: {
      height: 36,
      flex: 1,
      backgroundColor: c.chrome,
      borderRadius: 24,
      paddingHorizontal: 12,
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
    },
    title: {
      fontSize: 32,
      lineHeight: 37,
      fontFamily: "Geist_700Bold",
      letterSpacing: -1,
      marginBottom: 18,
      marginTop: 2,
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
      marginBottom: 24,
    },
    medium: { fontFamily: "Geist_500Medium" },
    caption: { fontSize: 13, lineHeight: 19, color: c.muted, marginTop: 4 },
    tiny: { fontSize: 9, letterSpacing: 1.4, color: c.muted },
    button: {
      backgroundColor: c.button,
      borderRadius: 30,
      minHeight: 54,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 22,
      paddingVertical: 14,
      marginBottom: 10,
    },
    buttonText: {
      fontFamily: "Geist_600SemiBold",
      fontSize: 16,
      color: c.buttonText,
    },
    secondary: { backgroundColor: c.secondary },
    field: {
      borderRadius: 14,
      backgroundColor: c.field,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
    },
    fieldLabel: { fontSize: 12, color: c.muted, marginBottom: 6 },
    input: {
      color: c.text,
      fontFamily: "Geist_400Regular",
      fontSize: 17,
      padding: 0,
      minHeight: 26,
    },
    group: {
      backgroundColor: c.surface,
      borderRadius: 17,
      overflow: "hidden",
      marginBottom: 16,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      minHeight: 59,
      paddingHorizontal: 16,
      paddingVertical: 17,
    },
    brand: { alignItems: "center", justifyContent: "center" },
    balance: {
      alignItems: "center",
      justifyContent: "center",
      height: 246,
      paddingBottom: 22,
    },
    amount: {
      fontSize: 50,
      letterSpacing: -2,
      fontFamily: "Geist_700Bold",
      lineHeight: 61,
    },
    period: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      backgroundColor: c.chrome,
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 11,
      marginTop: 7,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 5,
      marginBottom: 27,
    },
    dot: { height: 5, width: 5, borderRadius: 3, backgroundColor: c.text },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      marginBottom: 25,
    },
    action: { alignItems: "center", width: 66 },
    sectionTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 7,
    },
    sectionLabel: { fontSize: 13, color: c.muted },
    sectionTitle: {
      fontSize: 20,
      fontFamily: "Geist_600SemiBold",
      letterSpacing: -0.5,
      marginBottom: 14,
      marginTop: 8,
    },
    subrow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    seeAll: { alignItems: "center", padding: 17 },
    spendTrack: {
      height: 7,
      flexDirection: "row",
      borderRadius: 10,
      overflow: "hidden",
      gap: 3,
      marginTop: 17,
      marginBottom: 12,
      backgroundColor: c.track,
    },
    footnote: {
      fontSize: 12,
      lineHeight: 18,
      color: c.muted,
      textAlign: "center",
      marginVertical: 14,
      paddingHorizontal: 8,
    },
    tabbar: {
      flexDirection: "row",
      position: "absolute",
      left: 12,
      right: 12,
      borderRadius: 34,
      padding: 5,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 56,
      borderRadius: 28,
    },
    welcomeTitle: {
      fontSize: 36,
      lineHeight: 39,
      letterSpacing: -1.6,
      fontFamily: "Geist_700Bold",
      marginTop: 24,
    },
    welcomeSub: {
      fontSize: 16,
      lineHeight: 23,
      marginTop: 16,
      maxWidth: 260,
      color: c.muted,
    },
    heroWrap: {
      flex: 1,
      minHeight: 230,
      maxHeight: 350,
      marginHorizontal: c.mode === "light" ? 0 : -16,
      marginVertical: c.mode === "light" ? 18 : 0,
      borderRadius: c.mode === "light" ? 24 : 0,
      overflow: "hidden",
      backgroundColor: "#000000",
      justifyContent: "center",
    },
    hero: { width: "100%", height: "100%", minHeight: 230 },
    search: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      backgroundColor: c.search,
      borderRadius: 25,
      paddingHorizontal: 13,
      height: 40,
      marginBottom: 22,
    },
    segments: {
      flexDirection: "row",
      backgroundColor: c.segment,
      borderRadius: 24,
      padding: 4,
      marginBottom: 22,
    },
    segment: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      borderRadius: 22,
    },
    segmentActive: { backgroundColor: c.selected },
    empty: { paddingVertical: 48, alignItems: "center" },
    detailHero: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginVertical: 16,
      marginBottom: 28,
    },
    detailAmount: {
      fontSize: 36,
      fontFamily: "Geist_700Bold",
      letterSpacing: -1,
    },
    largeSymbol: {
      height: 100,
      width: 100,
      borderRadius: 50,
      backgroundColor: c.subtle,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginTop: 28,
      marginBottom: 32,
    },
    profileHead: { alignItems: "center", marginBottom: 28 },
    profileAvatar: {
      height: 76,
      width: 76,
      borderRadius: 38,
      backgroundColor: c.profileAvatar,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginVertical: 22,
    },
    tiles: { flexDirection: "row", gap: 10, marginBottom: 16 },
    tile: {
      backgroundColor: c.tile,
      borderRadius: 17,
      flex: 1,
      padding: 16,
    },
    smallPill: {
      flexDirection: "row",
      gap: 5,
      alignItems: "center",
      borderRadius: 20,
      backgroundColor: c.subtle,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    consent: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      paddingVertical: 18,
      marginBottom: 14,
    },
    checkbox: {
      height: 24,
      width: 24,
      borderWidth: 1,
      borderColor: c.checkbox,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    notice: {
      backgroundColor: c.notice,
      padding: 18,
      borderRadius: 16,
      flexDirection: "row",
      gap: 14,
    },
    error: { color: c.error, fontSize: 14, lineHeight: 21, marginVertical: 14 },
    sheet: {
      width: "100%",
      maxWidth: 480,
      backgroundColor: c.sheet,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: 20,
      paddingTop: 9,
    },
    handle: {
      height: 4,
      width: 38,
      borderRadius: 3,
      backgroundColor: c.handle,
      alignSelf: "center",
      marginBottom: 12,
    },
    sheetHeading: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 4,
    },
    successIcon: { alignItems: "center", padding: 18 },
  });

const styles = {
  dark: createStyles(palettes.dark),
  light: createStyles(palettes.light),
};
