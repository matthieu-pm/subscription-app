import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  HelpCircle,
  Landmark,
  Leaf,
  Link2,
  LockKeyhole,
  LogOut,
  Mail,
  Plus,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  Eye,
} from "./icons";
import {
  type Account,
  type AccountRoute,
  demoBankAccounts,
  bankConnection,
  addConnection,
  disconnectAccount,
} from "./account";
import { type Subscription, dateLabel, money } from "./model";

type Props = {
  route: AccountRoute;
  account: Account;
  update: (patch: Partial<Account>) => void;
  go: (route: AccountRoute | "home") => void;
  notify: (message: string) => void;
  items: Subscription[];
  openSubscription: (s: Subscription) => void;
};
function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.31 2.99-7.36Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.05.97-3.38.97-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.93A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.93V7.48H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.52l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.79.51 3.82 1.51l2.87-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.48l3.34 2.59C7.2 7.71 9.4 5.95 12 5.95Z"
      />
    </svg>
  );
}
function AppleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill="currentColor"
    >
      <path d="M17.1 12.3c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.7-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 6.9 1.1 9.2.8 1.1 1.6 2.3 2.8 2.2 1.1 0 1.5-.7 2.9-.7 1.4 0 1.8.7 3 .7 1.2 0 2-1.1 2.7-2.2.9-1.3 1.2-2.5 1.2-2.6-.1 0-2.4-.9-2.4-3.6ZM14.8 5.6c.6-.8 1.1-1.8 1-2.9-.9.1-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.8 1 .1 2.1-.5 2.8-1.3Z" />
    </svg>
  );
}
function Row({
  icon,
  title,
  subtitle,
  value,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button className="setting-row" onClick={onClick}>
      <span className="setting-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        {subtitle && <small>{subtitle}</small>}
      </span>
      {value && <span className="setting-value">{value}</span>}
      <ChevronRight size={16} />
    </button>
  );
}
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={onChange}
        className="switch"
      >
        <span />
      </button>
    </div>
  );
}
function Progress({ step }: { step: number }) {
  const labels = [
    "Your profile",
    "Connect accounts",
    "Reminders",
    "Ready to go",
  ];
  return (
    <div className="setup-progress">
      <div className="progress-caption">
        <span>Step {step} of 4</span>
        <strong>{labels[step - 1]}</strong>
      </div>
      <div
        className="onboard-progress"
        role="progressbar"
        aria-label="Account setup"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={step}
        aria-valuetext={`Step ${step} of 4: ${labels[step - 1]}`}
      >
        {[1, 2, 3, 4].map((n) => (
          <span key={n} className={n <= step ? "filled" : ""} />
        ))}
      </div>
    </div>
  );
}
function Action({
  children,
  onClick,
  type = "button",
  static: isStatic = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  static?: boolean;
}) {
  return (
    <button
      className="graphic-action"
      data-static={isStatic || undefined}
      type={type}
      onClick={onClick}
    >
      <span>{children}</span>
      <span>
        <ArrowRight size={24} />
      </span>
    </button>
  );
}
export default function AccountFlows({
  route,
  account,
  update,
  go,
  notify,
  items,
  openSubscription,
}: Props) {
  const [provider, setProvider] = useState<"Apple" | "Google">("Apple");
  const [email, setEmail] = useState(account.email);
  const [name, setName] = useState(account.name);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [bank, setBank] = useState(account.connections[0]?.bank || "Monzo");
  const [selectedAccount, setSelectedAccount] = useState("4242");
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [bankQuery, setBankQuery] = useState("");
  const [consent, setConsent] = useState(false);
  const [modalType, setModalType] = useState<"logout" | "disconnect" | null>(
    null,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const addAccountButton = useRef<HTMLButtonElement>(null);
  const inSetup = !account.onboarded;
  useEffect(() => {
    setError("");
    if (route === "edit-profile" || route === "onboard-name") {
      setName(account.name);
      setEmail(account.email);
    }
  }, [route, account.name, account.email]);
  useEffect(() => {
    if (modalType) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modalType]);
  const signIn = (method: Account["provider"]) => {
    update({
      signedIn: true,
      provider: method,
      ...(method === "Email" ? { email } : {}),
    });
    go(account.onboarded ? "home" : "onboard-name");
  };
  const finish = () => {
    update({ onboarded: true, signedIn: true });
    go("home");
  };
  const titles: Partial<Record<AccountRoute, string>> = {
    profile: "Your profile",
    "edit-profile": "Personal details",
    settings: "Settings",
    notifications: "Notifications",
    accounts: "Connected accounts",
    privacy: "Privacy & security",
    help: "A little help",
    activity: "Payment activity",
    banks: "Choose your bank",
    "bank-consent": "Connect an account",
    social: `Continue with ${provider}`,
    email: "Sign in with email",
    verify: "Email sign-in",
  };
  const back: Partial<Record<AccountRoute, AccountRoute | "home">> = {
    login: "welcome",
    signup: "welcome",
    social: "login",
    email: "login",
    verify: "email",
    "onboard-name": "login",
    connect: "onboard-name",
    banks: inSetup ? "connect" : "accounts",
    "bank-consent": "banks",
    detected: inSetup ? "connect" : "accounts",
    "reminders-setup": account.connections.length ? "detected" : "connect",
    ready: "reminders-setup",
    profile: "home",
    "edit-profile": "profile",
    settings: "profile",
    notifications: "settings",
    accounts: "settings",
    privacy: account.signedIn ? "settings" : "login",
    help: account.signedIn ? "profile" : "login",
    activity: "home",
  };
  const connectionCount = account.connections.length;
  const accountCountLabel = `${connectionCount} ${connectionCount === 1 ? "account" : "accounts"}`;
  const selectedConnection = bankConnection(bank, selectedAccount);
  const alreadyConnected = account.connections.some(
    (a) => a.id === selectedConnection.id,
  );
  const disconnectTarget = account.connections.find(
    (a) => a.id === disconnectId,
  );
  const firstName = account.name.split(" ")[0];
  const reminderExample = items.find((item) => item.status === "active");
  const bankNames = [
    "Monzo",
    "Revolut",
    "BNP Paribas",
    "N26",
    "Crédit Agricole",
  ];
  return (
    <>
      <header
        className={`flow-header ${route === "welcome" ? "welcome-header" : ""}`}
      >
        {route === "welcome" ? (
          <span className="wordmark">
            <span className="brand-mark">s</span>subscript.
          </span>
        ) : (
          <button
            className="icon-button"
            aria-label="Go back"
            onClick={() => go(back[route] || "home")}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <span>{titles[route] || ""}</span>
        {route === "profile" ? (
          <button
            className="icon-button"
            aria-label="Open settings"
            onClick={() => go("settings")}
          >
            <Settings size={20} />
          </button>
        ) : route === "welcome" ? (
          <span className="tiny-tag">DEMO</span>
        ) : (
          <span className="header-spacer" />
        )}
      </header>
      <main className={`page flow-page flow-${route}`}>
        {route === "welcome" && (
          <>
            <div className="welcome-topline">
              <span className="eyebrow">GOODBYE, SUBSCRIPTION CHAOS.</span>
              <span className="dot-pattern" />
            </div>
            <h1 className="display-heading" tabIndex={-1}>
              LESS ADMIN.
              <br />
              MORE <mark>LIVING.</mark>
            </h1>
            <p className="intro">
              All your subscriptions in one place.
              <br />
              Keep the good stuff. Let the rest go.
            </p>
            <div className="subscription-art" aria-hidden="true">
              <span className="art-orbit" />
              <div className="art-slip slip-back">
                <span>YOUR SUBSCRIPTIONS</span>
                <strong>ALL. IN. SIGHT.</strong>
                <span className="checker" />
              </div>
              <div className="art-slip slip-front">
                <span className="slip-label">
                  THE MONTHLY LINE-UP <Check size={16} />
                </span>
                <div>
                  <span className="art-logo apple"></span>
                  <strong>Apple TV</strong>
                  <span>€120 / yr</span>
                </div>
                <div>
                  <span className="art-logo netflix">N</span>
                  <strong>Netflix</strong>
                  <span>€15 / mo</span>
                </div>
                <div>
                  <span className="art-logo spotify">≋</span>
                  <strong>Spotify</strong>
                  <span>€11 / mo</span>
                </div>
                <span className="slip-footer">
                  A LITTLE CLARITY. A LOT LESS ADMIN.
                </span>
              </div>
              <span className="art-stamp">
                <ArrowUpRight size={31} />
              </span>
            </div>
            <div className="auth-actions">
              <Action onClick={() => go("signup")}>Get started</Action>
              <button className="button secondary" onClick={() => go("login")}>
                Log in
              </button>
              <button
                className="text-button"
                onClick={() => {
                  update({ signedIn: true, onboarded: true });
                  go("home");
                }}
              >
                Explore the demo <ArrowUpRight size={16} />
              </button>
            </div>
          </>
        )}
        {(route === "login" || route === "signup") && (
          <>
            <div className="auth-title">
              <span className="eyebrow">
                {route === "login"
                  ? "PICK UP WHERE YOU LEFT OFF"
                  : "MAKE ROOM FOR WHAT MATTERS"}
              </span>
              <h1 className="display-heading" tabIndex={-1}>
                {route === "login" ? (
                  <>
                    WELCOME
                    <br />
                    <mark>BACK.</mark>
                  </>
                ) : (
                  <>
                    YOUR MONEY.
                    <br />
                    <mark>YOUR CALL.</mark>
                  </>
                )}
              </h1>
              <span className="auth-stamp">
                <UserRound size={36} />
              </span>
            </div>
            <p className="intro">
              {route === "login"
                ? "Sign in to manage your subscriptions."
                : "Create your profile. See what renews next."}
            </p>
            <div className="social-buttons">
              <button
                className="social-button apple-login"
                onClick={() => {
                  setProvider("Apple");
                  go("social");
                }}
              >
                <AppleMark />
                Continue with Apple
                <ArrowRight size={16} />
              </button>
              <button
                className="social-button"
                onClick={() => {
                  setProvider("Google");
                  go("social");
                }}
              >
                <GoogleMark />
                Continue with Google
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="or-divider">
              <span />
              or use your email
              <span />
            </div>
            <button className="button email-button" onClick={() => go("email")}>
              <Mail size={20} />
              Continue with email
              <ArrowRight size={20} />
            </button>
            <p className="demo-disclosure">
              <ShieldCheck size={16} />
              Prototype only. No real accounts are created and no credentials
              are requested.
            </p>
            <p className="auth-switch">
              {route === "login"
                ? "New to Subscript?"
                : "Already have an account?"}{" "}
              <button
                onClick={() => go(route === "login" ? "signup" : "login")}
              >
                {route === "login" ? "Get started" : "Log in"}
              </button>
            </p>
            <button
              className="text-button full-width"
              onClick={() => go("privacy")}
            >
              How we handle your data
            </button>
          </>
        )}
        {route === "social" && (
          <>
            <div className="provider-auth-icon">
              {provider === "Apple" ? <AppleMark /> : <GoogleMark />}
            </div>
            <span className="eyebrow">SIMULATED SIGN-IN</span>
            <h1 className="display-heading" tabIndex={-1}>
              Choose your
              <br />
              <mark>demo account.</mark>
            </h1>
            <p className="intro">
              Preview signing in with {provider} using the sample account below.
            </p>
            <div
              className="demo-account"
              role="group"
              aria-label="Selected demo account"
            >
              <span className="avatar">
                {account.name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <span>
                <strong>{account.name}</strong>
                <small>{account.email}</small>
              </span>
              <Check size={20} />
            </div>
            <div className="permission-list">
              <p>
                <UserRound size={20} />
                Name and email address
              </p>
              <p>
                <LockKeyhole size={20} />
                No password shared with Subscript
              </p>
            </div>
            <button className="button primary" onClick={() => signIn(provider)}>
              Use demo account
              <ArrowRight size={20} />
            </button>
            <button
              className="text-button full-width"
              onClick={() => go("login")}
            >
              Use another sign-in method
            </button>
            <p className="helper centered">
              No connection to {provider} is made in this prototype.
            </p>
          </>
        )}
        {route === "email" && (
          <>
            <span className="flow-feature-icon">
              <Mail size={28} />
            </span>
            <h1 className="display-heading" tabIndex={-1}>
              Sign in with
              <br />
              <mark>email.</mark>
            </h1>
            <p className="intro">
              Sign in with a one-time code.
              <br />
              One less password to remember.
            </p>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const field = e.currentTarget.elements.namedItem(
                  "email",
                ) as HTMLInputElement;
                if (!field.validity.valid) {
                  setError(
                    email.trim()
                      ? "Enter a valid email address, such as alex@subscript.demo."
                      : "Enter your email address to continue.",
                  );
                  field.focus();
                  return;
                }
                setCode("");
                go("verify");
              }}
            >
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={email}
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-error" : undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                />
              </label>
              {error && (
                <p id="email-error" className="form-error" role="alert">
                  {error}
                </p>
              )}
              <Action type="submit">Get demo code</Action>
            </form>
            <p className="demo-disclosure">
              <ShieldCheck size={16} />
              Demo only. No email will be sent. You can use the sample address
              above.
            </p>
          </>
        )}
        {route === "verify" && (
          <>
            <span className="flow-feature-icon">
              <Mail size={28} />
            </span>
            <h1 className="display-heading" tabIndex={-1}>
              Enter your
              <br />
              <mark>demo code.</mark>
            </h1>
            <p className="intro">
              Enter the six-digit code for
              <br />
              <strong>{email}</strong>
            </p>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (code !== "123456") {
                  setError(
                    code.length !== 6
                      ? "Enter all 6 digits. The demo code is 123456."
                      : "That code doesn’t match. Enter 123456 to try this demo.",
                  );
                  (
                    e.currentTarget.elements.namedItem(
                      "code",
                    ) as HTMLInputElement
                  ).focus();
                  return;
                }
                signIn("Email");
              }}
            >
              <label>
                Verification code
                <input
                  className="code-input"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  aria-describedby={
                    error ? "code-hint code-error" : "code-hint"
                  }
                  aria-invalid={!!error}
                />
              </label>
              <p id="code-hint" className="demo-code">
                Your demo code: <strong>123456</strong>
              </p>
              {error && (
                <p id="code-error" className="form-error" role="alert">
                  {error}
                </p>
              )}
              <Action type="submit">Sign in</Action>
            </form>
            <button
              className="text-button full-width"
              onClick={() => notify("Demo code: 123456. No email was sent.")}
            >
              Show demo code
            </button>
            <button
              className="text-button full-width"
              onClick={() => go("email")}
            >
              Use a different email
            </button>
          </>
        )}
        {route === "onboard-name" && (
          <>
            <Progress step={1} />
            <span className="eyebrow">YOUR PROFILE</span>
            <h1 className="display-heading" tabIndex={-1}>
              LET’S MAKE
              <br />
              THIS <mark>YOURS.</mark>
            </h1>
            <p className="intro">What should we call you?</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                update({ name: name.trim() });
                go("connect");
              }}
            >
              <label>
                Your name
                <input
                  required
                  maxLength={50}
                  autoComplete="name"
                  pattern=".*\S.*"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <div className="friendly-card">
                <Leaf size={25} />
                <p>
                  A clearer view of your subscriptions.
                  <br />
                  Set it up once. Adjust it anytime.
                </p>
              </div>
              <Action type="submit">Save and continue</Action>
            </form>
          </>
        )}
        {route === "connect" && (
          <>
            <Progress step={2} />
            <span className="eyebrow">LESS MANUAL. MORE HELPFUL.</span>
            <h1 className="display-heading" tabIndex={-1}>
              FIND YOUR
              <br />
              <mark>SUBSCRIPTIONS.</mark>
            </h1>
            <p className="intro">
              Preview a bank connection to find recurring payments. Review the
              results before tracking them.
            </p>
            <div className="connection-art" aria-hidden="true">
              <span>
                <Landmark size={34} />
              </span>
              <i />
              <span className="brand-mark">s</span>
            </div>
            <div className="feature-lines">
              <p>
                <Eye size={20} />
                <span>
                  <strong>Read-only access</strong>
                  <small>View transactions. Never make payments.</small>
                </span>
              </p>
              <p>
                <ShieldCheck size={20} />
                <span>
                  <strong>Always your choice</strong>
                  <small>Disconnect whenever you like.</small>
                </span>
              </p>
            </div>
            <Action onClick={() => go("banks")}>Connect an account</Action>
            <button
              className="text-button full-width"
              onClick={() => {
                go("reminders-setup");
              }}
            >
              Skip for now
            </button>
            <p className="helper centered">
              This demo uses sample transactions only.
            </p>
          </>
        )}
        {route === "banks" && (
          <>
            {inSetup && <Progress step={2} />}
            <h1 className="display-heading" tabIndex={-1}>
              Choose your
              <br />
              <mark>bank.</mark>
            </h1>
            <p className="intro">Choose a bank to preview the connection.</p>
            <label className="bank-search">
              Search banks
              <input
                type="search"
                placeholder="Search your bank"
                value={bankQuery}
                onChange={(e) => setBankQuery(e.target.value)}
              />
            </label>
            <div className="settings-group">
              {bankNames
                .filter((b) =>
                  b.toLowerCase().includes(bankQuery.toLowerCase()),
                )
                .map((b) => (
                  <Row
                    key={b}
                    icon={
                      <span
                        className={`bank-letter bank-${b.toLowerCase().replaceAll(" ", "-")}`}
                      >
                        {b[0]}
                      </span>
                    }
                    title={b}
                    subtitle={
                      account.connections.some((a) => a.bank === b)
                        ? `${account.connections.filter((a) => a.bank === b).length} connected`
                        : "Demo accounts available"
                    }
                    onClick={() => {
                      setBank(b);
                      setSelectedAccount(
                        demoBankAccounts.find(
                          (a) =>
                            !account.connections.some(
                              (c) => c.id === bankConnection(b, a.last4).id,
                            ),
                        )?.last4 || "4242",
                      );
                      setConsent(false);
                      go("bank-consent");
                    }}
                  />
                ))}
            </div>
            {!bankNames.some((b) =>
              b.toLowerCase().includes(bankQuery.toLowerCase()),
            ) && <p className="empty">No banks found. Try a different name.</p>}
            <p className="demo-disclosure">
              <LockKeyhole size={16} />
              We won’t ask for your banking password.
            </p>
          </>
        )}
        {route === "bank-consent" && (
          <>
            {inSetup && <Progress step={2} />}
            <span className="flow-feature-icon">
              <Landmark size={30} />
            </span>
            <span className="eyebrow">YOU’RE IN CONTROL</span>
            <h1 className="display-heading" tabIndex={-1}>
              Connect
              <br />
              <mark>{bank}.</mark>
            </h1>
            <p className="intro">
              In the live app, you’d approve read-only access securely with your
              bank.
            </p>
            <fieldset className="bank-account-picker">
              <legend>Choose an account</legend>
              {demoBankAccounts.map((details) => {
                const connected = account.connections.some(
                  (a) => a.id === bankConnection(bank, details.last4).id,
                );
                return (
                  <label
                    key={details.last4}
                    className="bank-account-option"
                    data-connected={connected || undefined}
                  >
                    <input
                      type="radio"
                      name="bank-account"
                      value={details.last4}
                      checked={selectedAccount === details.last4}
                      disabled={connected}
                      onChange={() => {
                        setSelectedAccount(details.last4);
                        setConsent(false);
                      }}
                    />
                    <span>
                      <strong>{details.name}</strong>
                      <small>•• {details.last4} · Demo account</small>
                    </span>
                    {connected && <span className="tag">Connected</span>}
                  </label>
                );
              })}
            </fieldset>
            {demoBankAccounts.every((a) =>
              account.connections.some(
                (c) => c.id === bankConnection(bank, a.last4).id,
              ),
            ) && (
              <p className="helper">
                Both demo accounts are connected. Choose another bank to add
                more.
              </p>
            )}
            <div className="consent-card">
              <h2>What Subscript could see</h2>
              <p>
                <Check size={20} />
                Account name and masked card details
              </p>
              <p>
                <Check size={20} />
                Transaction dates, merchants, and amounts
              </p>
              <p className="muted">
                <X size={20} />
                No transfers, payments, or banking password
              </p>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>I understand this connects sample data only.</span>
            </label>
            <button
              className="button primary"
              disabled={!consent || alreadyConnected}
              onClick={() => {
                update({
                  connections: addConnection(
                    account.connections,
                    selectedConnection,
                  ),
                });
                go("detected");
              }}
            >
              Connect demo account
              <Link2 size={20} />
            </button>
            <button
              className="text-button full-width"
              onClick={() => go("banks")}
            >
              Choose a different bank
            </button>
          </>
        )}
        {route === "detected" && (
          <>
            {inSetup && <Progress step={2} />}
            <span className="flow-feature-icon success-tone">
              <Check size={30} />
            </span>
            <h1 className="display-heading" tabIndex={-1}>
              Review your
              <br />
              <mark>subscriptions.</mark>
            </h1>
            <p className="intro">
              {selectedConnection.bank} {selectedConnection.name.toLowerCase()}{" "}
              is connected. You now have {accountCountLabel} connected in this
              demo.
            </p>
            <div className="settings-group detected-list">
              {items
                .filter((s) => s.status === "active")
                .map((s) => (
                  <div key={s.id} className="detected-row">
                    <span className={`detected-icon ${s.brand}`}>
                      {s.brand === "apple" ? "" : s.name[0]}
                    </span>
                    <span>
                      <strong>{s.name}</strong>
                      <small>
                        {s.frequency === "yearly" ? "Yearly" : "Monthly"} ·
                        {s.dateSource === "user"
                          ? "renewal set by you"
                          : "estimated renewal"}
                      </small>
                    </span>
                    <strong>{money(s.amount)}</strong>
                    <Check size={16} />
                  </div>
                ))}
            </div>
            <p className="helper">
              These are the same sample subscriptions across your accounts.
              Adding an account won’t duplicate them.
            </p>
            <Action
              onClick={() => go(inSetup ? "reminders-setup" : "accounts")}
            >
              {inSetup ? "Set up reminders" : "Back to accounts"}
            </Action>
            <button
              className="button secondary"
              onClick={() => {
                setBankQuery("");
                go("banks");
              }}
            >
              <Plus size={20} /> Add another account
            </button>
          </>
        )}
        {route === "reminders-setup" && (
          <>
            <Progress step={3} />
            <span className="flow-feature-icon">
              <Bell size={29} />
            </span>
            <span className="eyebrow">A HEADS-UP, NOT A NAG</span>
            <h1 className="display-heading" tabIndex={-1}>
              BEFORE IT
              <br />
              <mark>RENEWS.</mark>
            </h1>
            <p className="intro">
              Choose when you’d like a reminder before an expected payment.
            </p>
            <div className="notification-preview">
              <span className="brand-mark">s</span>
              <span>
                <strong>
                  {reminderExample
                    ? `${reminderExample.name} is coming up`
                    : "Your renewal reminder"}
                </strong>
                <small>
                  {reminderExample
                    ? `${reminderExample.dateSource === "estimated" ? "Estimated" : "Expected"} ${money(reminderExample.amount)} around ${dateLabel(reminderExample.renewal)}. Review your plan before it renews.`
                    : "Add a subscription to preview its renewal reminder."}
                </small>
              </span>
              <span>now</span>
            </div>
            <div className="settings-group">
              <Toggle
                label="Renewal reminders"
                description="A heads-up before an expected payment"
                checked={account.reminders}
                onChange={() => update({ reminders: !account.reminders })}
              />
            </div>
            {account.reminders && (
              <label>
                Remind me
                <select
                  value={account.reminderDays}
                  onChange={(e) => update({ reminderDays: e.target.value })}
                >
                  <option value="1">1 day before</option>
                  <option value="3">3 days before</option>
                  <option value="7">7 days before</option>
                </select>
              </label>
            )}
            <Action onClick={() => go("ready")}>Review setup</Action>
            <p className="helper centered">
              This demo saves your preference without sending notifications.
            </p>
          </>
        )}
        {route === "ready" && (
          <>
            <Progress step={4} />
            <div className="ready-art" aria-hidden="true">
              <span className="checker" />
              <span>
                <Check size={56} />
              </span>
              <span className="dot-pattern" />
            </div>
            <span className="eyebrow">A LITTLE CLARITY LOOKS GOOD ON YOU</span>
            <h1 className="display-heading" tabIndex={-1}>
              ALL SET,
              <br />
              <mark>{firstName.toUpperCase()}.</mark>
            </h1>
            <p className="intro">
              Your preferences are saved.
              <br />
              You can change them anytime in Settings.
            </p>
            <div className="setup-summary">
              <p>
                <Check size={16} />
                {connectionCount
                  ? `${accountCountLabel} connected · demo`
                  : "Sample data · connect an account later"}
              </p>
              <p>
                <Check size={16} />
                {account.reminders
                  ? `Reminders set to ${account.reminderDays} ${account.reminderDays === "1" ? "day" : "days"} before`
                  : "Reminders turned off"}
              </p>
            </div>
            <Action onClick={finish}>View subscriptions</Action>
          </>
        )}
        {route === "profile" && (
          <>
            <div className="profile-hero">
              <span className="profile-avatar">
                {account.name
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <span className="eyebrow">YOUR PROFILE</span>
              <h1 className="display-heading" tabIndex={-1}>
                <mark>{account.name}</mark>
              </h1>
              <p>{account.email}</p>
              <span className="profile-badge">
                <span />
                Demo profile
              </span>
            </div>
            <div className="profile-stats">
              <span>
                <strong>
                  {items.filter((s) => s.status === "active").length}
                </strong>
                Active subscriptions
              </span>
              <span>
                <strong>{connectionCount}</strong>Connected{" "}
                {connectionCount === 1 ? "account" : "accounts"}
              </span>
            </div>
            <div className="settings-group">
              <Row
                icon={<UserRound size={20} />}
                title="Personal details"
                subtitle="Your name and email"
                onClick={() => go("edit-profile")}
              />
              <Row
                icon={<Landmark size={20} />}
                title="Connected accounts"
                value={String(connectionCount)}
                onClick={() => go("accounts")}
              />
              <Row
                icon={<Settings size={20} />}
                title="Settings"
                subtitle="Reminders, accounts, and privacy"
                onClick={() => go("settings")}
              />
              <Row
                icon={<HelpCircle size={20} />}
                title="Help & support"
                onClick={() => go("help")}
              />
            </div>
            <button
              className="logout-button"
              onClick={() => setModalType("logout")}
            >
              <LogOut size={20} />
              Log out
            </button>
            <p className="helper centered">SUBSCRIPT · INTERACTIVE PROTOTYPE</p>
          </>
        )}
        {route === "edit-profile" && (
          <>
            <h1 className="display-heading" tabIndex={-1}>
              Your personal
              <br />
              <mark>details.</mark>
            </h1>
            <p className="intro">Keep your profile up to date.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                update({ name: name.trim(), email });
                go("profile");
                notify("Personal details updated.");
              }}
            >
              <label>
                Your name
                <input
                  required
                  maxLength={50}
                  autoComplete="name"
                  pattern=".*\S.*"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <p className="helper">
                Changes are saved in this browser for the demo.
              </p>
              <button className="button primary" type="submit">
                Save details
                <Check size={20} />
              </button>
              <button
                type="button"
                className="text-button full-width"
                onClick={() => go("profile")}
              >
                Discard changes
              </button>
            </form>
          </>
        )}
        {route === "settings" && (
          <>
            <h1 className="display-heading" tabIndex={-1}>
              Make it
              <br />
              <mark>your own.</mark>
            </h1>
            <p className="intro">
              Manage your reminders, accounts, and privacy.
            </p>
            <span className="group-label">YOUR PREFERENCES</span>
            <div className="settings-group">
              <Row
                icon={<Bell size={20} />}
                title="Notifications"
                value={account.reminders ? "On" : "Off"}
                onClick={() => go("notifications")}
              />
              <Row
                icon={<Landmark size={20} />}
                title="Connected accounts"
                value={connectionCount ? accountCountLabel : "None"}
                onClick={() => go("accounts")}
              />
              <Row
                icon={<ShieldCheck size={20} />}
                title="Privacy & security"
                onClick={() => go("privacy")}
              />
            </div>
            <span className="group-label">GOOD TO KNOW</span>
            <div className="settings-group">
              <Row
                icon={<HelpCircle size={20} />}
                title="Help & support"
                onClick={() => go("help")}
              />
              <div className="static-setting">
                <span>Currency</span>
                <span>Euro (€)</span>
              </div>
              <div className="static-setting">
                <span>Version</span>
                <span>Prototype 1.1</span>
              </div>
            </div>
            <div className="friendly-card">
              <Sparkles size={24} />
              <p>
                Your preferences save automatically.
                <br />
                You can change them anytime.
              </p>
            </div>
          </>
        )}
        {route === "notifications" && (
          <>
            <span className="flow-feature-icon">
              <Bell size={27} />
            </span>
            <h1 className="display-heading" tabIndex={-1}>
              Reminders,
              <br />
              <mark>your way.</mark>
            </h1>
            <p className="intro">Choose which updates you’d like and when.</p>
            <div className="settings-group">
              <Toggle
                label="Renewal reminders"
                description="Before an expected subscription payment"
                checked={account.reminders}
                onChange={() => update({ reminders: !account.reminders })}
              />
              <Toggle
                label="Monthly email summary"
                description="Your subscriptions, once a month"
                checked={account.emailSummary}
                onChange={() => update({ emailSummary: !account.emailSummary })}
              />
            </div>
            {account.reminders && (
              <label>
                Remind me
                <select
                  value={account.reminderDays}
                  onChange={(e) => update({ reminderDays: e.target.value })}
                >
                  <option value="1">1 day before</option>
                  <option value="3">3 days before</option>
                  <option value="7">7 days before</option>
                </select>
              </label>
            )}
            <p className="inline-info">
              <ShieldCheck size={20} />
              Preferences save automatically on this device. This prototype
              doesn’t send push notifications or emails.
            </p>
          </>
        )}
        {route === "accounts" && (
          <>
            <h1 className="display-heading" tabIndex={-1}>
              Your connected
              <br />
              <mark>accounts.</mark>
            </h1>
            <p className="intro">
              Connect personal or joint accounts from the same bank or different
              banks.
            </p>
            {connectionCount ? (
              <div className="connected-accounts-list">
                {account.connections.map((connection) => (
                  <section
                    key={connection.id}
                    className="connected-account"
                    aria-label={`${connection.bank} ${connection.name} ending ${connection.last4}`}
                  >
                    <div>
                      <span className="bank-symbol">
                        <Landmark size={24} />
                      </span>
                      <span>
                        <strong>{connection.bank}</strong>
                        <small>
                          {connection.name} · •• {connection.last4}
                        </small>
                      </span>
                      <span className="tag">Demo</span>
                    </div>
                    <p>
                      <span />
                      Sample transactions connected
                    </p>
                    <div className="account-access">
                      <Eye size={16} />
                      Read-only access
                    </div>
                    <button
                      className="text-button danger-text"
                      onClick={() => {
                        setDisconnectId(connection.id);
                        setModalType("disconnect");
                      }}
                      aria-label={`Disconnect ${connection.bank} ${connection.name} ending ${connection.last4}`}
                    >
                      Disconnect account
                    </button>
                  </section>
                ))}
              </div>
            ) : (
              <div className="empty-account">
                <Landmark size={35} />
                <h2>No account connected</h2>
                <p>
                  Your sample subscriptions are still here. Connect a demo
                  account to try the flow.
                </p>
              </div>
            )}
            <button
              className="button primary"
              ref={addAccountButton}
              onClick={() => {
                setBankQuery("");
                go("banks");
              }}
            >
              <Plus size={20} />
              {connectionCount ? "Add another account" : "Connect an account"}
            </button>
            <p className="helper centered">
              Disconnecting won’t cancel your subscriptions.
            </p>
          </>
        )}
        {route === "privacy" && (
          <>
            <span className="flow-feature-icon">
              <ShieldCheck size={28} />
            </span>
            <h1 className="display-heading" tabIndex={-1}>
              Your data.
              <br />
              <mark>Your control.</mark>
            </h1>
            <p className="intro">Here’s exactly how this prototype works.</p>
            <div className="privacy-cards">
              <section>
                <LockKeyhole size={24} />
                <h2>On this device</h2>
                <p>
                  Your profile, preferences, and demo subscriptions are saved in
                  this browser. Clearing its site data removes them.
                </p>
              </section>
              <section>
                <Eye size={24} />
                <h2>No real account access</h2>
                <p>
                  Apple, Google, and bank connections are simulated. No
                  passwords, tokens, or banking details are collected.
                </p>
              </section>
              <section>
                <UserRound size={24} />
                <h2>You’re in charge</h2>
                <p>
                  Disconnect accounts in Settings. Subscription cancellation
                  must happen with the provider; this app records what you
                  report.
                </p>
              </section>
            </div>
            <p className="helper">
              Sign-in is simulated. Use the sample profile rather than personal
              information.
            </p>
          </>
        )}
        {route === "help" && (
          <>
            <span className="flow-feature-icon">
              <HelpCircle size={28} />
            </span>
            <h1 className="display-heading" tabIndex={-1}>
              A little
              <br />
              <mark>help.</mark>
            </h1>
            <p className="intro">
              Answers about your subscriptions and this demo.
            </p>
            <div className="faq-list">
              <details>
                <summary>Does Subscript cancel subscriptions?</summary>
                <p>
                  Not directly. Open a subscription and choose “How to cancel”
                  for the provider handoff. Once you’ve cancelled with the
                  provider, mark it as cancelled here.
                </p>
              </details>
              <details>
                <summary>Why is a renewal “estimated”?</summary>
                <p>
                  It’s a prediction based on a previous charge. The provider may
                  change the amount or date. Edit the renewal date to replace it
                  with one set by you.
                </p>
              </details>
              <details>
                <summary>Can I use my real account?</summary>
                <p>
                  This is an interactive prototype. Sign-in and bank connections
                  use sample data only. Please don’t enter passwords or real
                  banking credentials.
                </p>
              </details>
              <details>
                <summary>What if something isn’t a subscription?</summary>
                <p>
                  Open it, choose “Edit details,” then “This isn’t a
                  subscription.” It will leave your totals, while its payment
                  history stays in the demo data.
                </p>
              </details>
            </div>
            <div className="friendly-card">
              <Mail size={24} />
              <p>
                No support messages are sent from this demo. Everything here is
                yours to explore.
              </p>
            </div>
          </>
        )}
        {route === "activity" && (
          <>
            <span className="eyebrow">OBSERVED PAYMENTS</span>
            <h1 className="display-heading" tabIndex={-1}>
              Your payment
              <br />
              <mark>history.</mark>
            </h1>
            <p className="intro">
              Payments recorded in your sample account. Check each subscription
              for its next estimated renewal.
            </p>
            <div className="settings-group activity-list">
              {items
                .flatMap((s) =>
                  s.history.map((h, i) => ({ s, h, key: `${s.id}-${i}` })),
                )
                .sort((a, b) => b.h.date.localeCompare(a.h.date))
                .map(({ s, h, key }) => (
                  <button
                    key={key}
                    className="activity-row"
                    onClick={() =>
                      s.status === "removed"
                        ? notify(
                            "This payment is kept in history. Subscription tracking is off.",
                          )
                        : openSubscription(s)
                    }
                  >
                    <span className="setting-icon">
                      <ArrowUpRight size={20} />
                    </span>
                    <span>
                      <strong>{s.name}</strong>
                      <small>
                        {dateLabel(h.date, true)}
                        {s.status === "removed" ? " · Not a subscription" : ""}
                      </small>
                    </span>
                    <strong>−{money(h.amount)}</strong>
                  </button>
                ))}
            </div>
            <p className="helper">
              Observed history stays even after a subscription is cancelled or
              removed from tracking.
            </p>
          </>
        )}
      </main>
      <dialog
        ref={dialog}
        aria-labelledby="account-dialog-title"
        onCancel={() => setModalType(null)}
      >
        <div className="dialog-handle" />
        <button
          className="icon-button dialog-close"
          aria-label="Close confirmation"
          onClick={() => setModalType(null)}
        >
          <X size={20} />
        </button>
        <span className="dialog-icon">
          {modalType === "logout" ? <LogOut size={24} /> : <Link2 size={24} />}
        </span>
        <h2 id="account-dialog-title">
          {modalType === "logout"
            ? "Log out of Subscript?"
            : `Disconnect ${disconnectTarget?.bank ?? "this account"}?`}
        </h2>
        <p>
          {modalType === "logout"
            ? "You’ll return to the welcome screen. Your demo subscriptions and preferences stay in this browser."
            : `This removes the ${disconnectTarget?.name.toLowerCase() ?? "the account"} ending ${disconnectTarget?.last4 ?? ""}. Your other connections, subscriptions, and payment history stay. No subscriptions will be cancelled.`}
        </p>
        <button
          className="button primary"
          onClick={() => {
            const action = modalType;
            setModalType(null);
            if (action === "logout") {
              update({ signedIn: false });
              go("welcome");
            } else {
              update({
                connections: disconnectAccount(
                  account.connections,
                  disconnectId ?? "",
                ),
              });
              requestAnimationFrame(() => addAccountButton.current?.focus());
              notify(
                "Account disconnected. Your subscriptions are still here.",
              );
            }
          }}
        >
          {modalType === "logout" ? "Log out" : "Disconnect account"}
        </button>
        <button className="button secondary" onClick={() => setModalType(null)}>
          {modalType === "logout" ? "Stay logged in" : "Keep account connected"}
        </button>
      </dialog>
    </>
  );
}
