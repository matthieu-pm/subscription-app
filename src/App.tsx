import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  Search,
  Plus,
  X,
  ChevronRight,
  Check,
  Cloud,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Info,
  Pencil,
  CalendarDays,
  CheckCheck,
  Sprout,
  LockKeyhole,
  Home,
  UserRound,
  ReceiptText,
  Bell,
  Landmark,
} from "./icons";
import {
  initialSubscriptions,
  totalFor,
  cancelSubscription,
  money,
  dateLabel,
  type Subscription,
} from "./model";

import AccountFlows from "./AccountFlows";
import {
  readAccount,
  defaultAccount,
  ACCOUNT_STORAGE,
  isAccountRoute,
  type AccountRoute,
  type Account,
} from "./account";

type Screen =
  | AccountRoute
  | "home"
  | "detail"
  | "edit"
  | "cancel"
  | "provider"
  | "confirm"
  | "success"
  | "add";
const STORAGE = "subscript-demo-v1";
function readData(): Subscription[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE) || "null");
    if (
      Array.isArray(data) &&
      data.every(
        (s) =>
          typeof s.id === "string" &&
          typeof s.amount === "number" &&
          Array.isArray(s.history) &&
          ["active", "cancelled", "removed"].includes(s.status),
      )
    )
      return data;
  } catch {
    /* Use demo data if storage is unavailable. */
  }
  return initialSubscriptions;
}
function Brand({ brand, large = false }: { brand: string; large?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`brand ${brand} ${large ? "large" : ""}`}
    >
      {brand === "apple" ? (
        <span className="apple-word">
          tv<span>+</span>
        </span>
      ) : brand === "netflix" ? (
        <b>N</b>
      ) : brand === "spotify" ? (
        <svg viewBox="0 0 32 32" width="30" height="30">
          <circle cx="16" cy="16" r="15" fill="currentColor" />
          <path
            d="M7 12c7-3 13-2 18 1M8 17c6-2 11-1 16 1M10 22c4-1 8-1 12 1"
            stroke="#202920"
            strokeWidth="2.3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <Cloud size={large ? 36 : 26} strokeWidth={1.8} />
      )}
    </span>
  );
}
export default function App() {
  const [items, setItems] = useState<Subscription[]>(readData);
  const [account, setAccount] = useState<Account>(readAccount);
  const [screen, setScreen] = useState<Screen>(() => {
    const a = readAccount();
    return a.signedIn ? (a.onboarded ? "home" : "onboard-name") : "welcome";
  });
  const updateAccount = (patch: Partial<Account>) =>
    setAccount((a) => ({ ...a, ...patch }));
  const showNav =
    account.signedIn &&
    account.onboarded &&
    ["home", "activity", "profile", "settings"].includes(screen);
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNT_STORAGE, JSON.stringify(account));
    } catch {
      /* Session works in memory when storage is unavailable. */
    }
  }, [account]);
  const [selected, setSelected] = useState("apple");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState("");
  const [dialog, setDialog] = useState<"remove" | "reset" | null>(null);
  const [accessEnd, setAccessEnd] = useState("");
  const [draft, setDraft] = useState<Subscription>(initialSubscriptions[0]);
  const scroll = useRef<HTMLDivElement>(null);
  const homeScroll = useRef(0);
  const modal = useRef<HTMLDialogElement>(null);
  const sub = items.find((s) => s.id === selected) || items[0];
  const active = items.filter((s) => s.status === "active");
  const cancelled = items.filter((s) => s.status === "cancelled");
  const total = totalFor(items, period);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(items));
    } catch {
      /* Prototype also works without persistence. */
    }
  }, [items]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (scroll.current)
      scroll.current.scrollTop = screen === "home" ? homeScroll.current : 0;
    scroll.current
      ?.querySelector<HTMLElement>("h1")
      ?.focus({ preventScroll: true });
  }, [screen]);
  useEffect(() => {
    if (dialog) modal.current?.showModal();
    else modal.current?.close();
  }, [dialog]);
  const go = (next: Screen) => {
    if (screen === "home") homeScroll.current = scroll.current?.scrollTop || 0;
    setScreen(next);
  };
  const update = (next: Subscription) =>
    setItems((prev) => prev.map((s) => (s.id === next.id ? next : s)));
  const edit = () => {
    setDraft({ ...sub });
    go("edit");
  };
  const open = (s: Subscription) => {
    setSelected(s.id);
    go("detail");
  };
  const beginAdd = () => {
    setDraft({
      id: crypto.randomUUID(),
      name: "",
      amount: 0,
      frequency: "monthly",
      renewal: "2026-11-14",
      dateSource: "user",
      status: "active",
      category: "Subscription",
      brand: "cloud",
      history: [],
    });
    go("add");
  };
  const reset = () => {
    setItems(initialSubscriptions);
    setSelected("apple");
    setPeriod("monthly");
    setQuery("");
    setSearching(false);
    homeScroll.current = 0;
    setDialog(null);
    setAccount(defaultAccount);
    setScreen("welcome");
    if (scroll.current) scroll.current.scrollTop = 0;
    setToast("Demo reset. Start again whenever you’re ready.");
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const next = {
      ...draft,
      name: draft.name.trim(),
      dateSource:
        screen === "add" || draft.renewal !== sub.renewal
          ? ("user" as const)
          : sub.dateSource,
    };
    if (!next.name || next.amount <= 0 || !Number.isFinite(next.amount)) return;
    if (screen === "add") {
      setItems((prev) => [...prev, next]);
      setSelected(next.id);
    } else update(next);
    go("detail");
    setToast(screen === "add" ? "Subscription added." : "Changes saved.");
  };
  const backTarget: Screen =
    screen === "detail" || screen === "add"
      ? "home"
      : screen === "confirm" || screen === "provider"
        ? "cancel"
        : "detail";
  const title =
    screen === "edit"
      ? "Edit details"
      : screen === "add"
        ? "Add subscription"
        : screen === "cancel"
          ? "How to cancel"
          : screen === "confirm"
            ? "Confirm cancellation"
            : screen === "provider"
              ? "Provider preview"
              : "Subscription";
  const row = (s: Subscription) => (
    <button className="subscription-row" key={s.id} onClick={() => open(s)}>
      <Brand brand={s.brand} />
      <span className="row-copy">
        <strong>{s.name}</strong>
        <span>
          {s.status === "cancelled"
            ? "Cancelled · reported by you"
            : `${s.dateSource === "estimated" ? "Est. next" : "Next"} ${dateLabel(s.renewal)}`}
        </span>
      </span>
      <span className="row-price">
        <strong>{money(s.amount)}</strong>
        <span>/{s.frequency === "yearly" ? "year" : "month"}</span>
      </span>
      <ChevronRight size={16} />
    </button>
  );
  return (
    <div
      className="stage"
      onPointerDownCapture={(event) => {
        event.currentTarget.dataset.input = "pointer";
      }}
      onKeyDownCapture={(event) => {
        event.currentTarget.dataset.input = "keyboard";
      }}
    >
      <header className="desktop-header">
        <a
          className="wordmark"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go(account.signedIn ? "home" : "welcome");
          }}
        >
          <span className="brand-mark">s</span>subscript
          <span className="wordmark-dot">.</span>
        </a>
        <span className="prototype-label">
          <span />
          Interactive prototype
        </span>
      </header>
      <div className="stage-layout">
        <aside className="stage-note">
          <span className="eyebrow">LESS ADMIN. MORE LIVING.</span>
          <h2>
            Your subscriptions.
            <br />A little more
            <br />
            <em>under control.</em>
          </h2>
          <p>
            One place for the things you pay for.
            <br />
            And the ones you’re ready to part with.
          </p>
          <div className="demo-guide">
            <span className="guide-arrow">↗</span>
            <p>
              From the first hello
              <br />
              to a little less admin.
              <br />
              Try the complete mobile journey.
            </p>
          </div>
          <div className="flow-shortcuts" aria-label="Prototype flow shortcuts">
            <span>EXPLORE THE PROTOTYPE</span>
            <button
              onClick={() => {
                updateAccount({ signedIn: false, onboarded: false });
                go("welcome");
              }}
            >
              01 <span>Login & onboarding</span>
              <ArrowUpRight size={16} />
            </button>
            <button
              onClick={() => {
                updateAccount({ signedIn: true, onboarded: true });
                go("home");
              }}
            >
              02 <span>Subscriptions</span>
              <ArrowUpRight size={16} />
            </button>
            <button
              onClick={() => {
                updateAccount({ signedIn: true, onboarded: true });
                go("profile");
              }}
            >
              03 <span>Profile & settings</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="demo-note">
            <ShieldCheck size={16} />
            <span>Demo data. No real payments or account changes.</span>
          </div>
        </aside>
        <div className="phone-wrap">
          <div className={`phone ${showNav ? "has-bottom-nav" : ""}`}>
            <div className="status-bar" aria-hidden="true">
              <span>9:41</span>
              <span className="status-icons">
                <svg width="16" height="12" viewBox="0 0 16 12">
                  <path
                    d="M1 9v3h2V9zm4-3v6h2V6zm4-3v9h2V3zm4-3v12h2V0z"
                    fill="currentColor"
                  />
                </svg>
                <svg width="16" height="12" viewBox="0 0 16 12">
                  <path
                    d="M1 3q7-5 14 0M4 6q4-3 8 0M7 9q1-1 2 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="battery" />
              </span>
            </div>
            <div className="app-scroll" ref={scroll}>
              {isAccountRoute(screen) ? (
                <AccountFlows
                  route={screen}
                  account={account}
                  update={updateAccount}
                  go={go}
                  notify={setToast}
                  items={items}
                  openSubscription={open}
                />
              ) : screen === "home" ? (
                <>
                  <header className="app-header">
                    <button
                      className="avatar-button"
                      aria-label="Open profile"
                      onClick={() => go("profile")}
                    >
                      {account.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </button>
                    <span className="home-greeting">
                      Hello, {account.name.split(" ")[0]}
                      <small>Let’s keep things in check.</small>
                    </span>
                    <button
                      className="icon-button"
                      aria-label={
                        searching ? "Close search" : "Search subscriptions"
                      }
                      aria-expanded={searching}
                      aria-controls="subscription-search"
                      onClick={() => {
                        setSearching(!searching);
                        setQuery("");
                      }}
                    >
                      <span
                        className="icon-swap"
                        data-active={searching}
                        aria-hidden="true"
                      >
                        <span className="icon-swap-default">
                          <Search size={20} />
                        </span>
                        <span className="icon-swap-active">
                          <X size={20} />
                        </span>
                      </span>
                    </button>
                  </header>
                  <main className="home page">
                    <div className="home-heading">
                      <span className="eyebrow">
                        A LITTLE CLARITY GOES A LONG WAY
                      </span>
                      <h1 className="display-heading" tabIndex={-1}>
                        Your subscriptions.
                        <br />
                        <mark>All in sight.</mark>
                      </h1>
                    </div>
                    <section
                      className="total-card"
                      aria-label="Subscription totals"
                    >
                      <div className="total-top">
                        <span>Recurring cost</span>
                        <div
                          className="period-toggle"
                          aria-label="Total period"
                        >
                          {(["monthly", "yearly"] as const).map((p) => (
                            <button
                              key={p}
                              aria-pressed={period === p}
                              onClick={() => setPeriod(p)}
                            >
                              {p === "monthly" ? "Monthly" : "Yearly"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="total-amount">
                        {money(total)}
                        <span>/{period === "monthly" ? "mo" : "yr"}</span>
                        <span className="total-flower" aria-hidden="true">
                          ✳
                        </span>
                      </div>
                      <div className="total-rule" />
                      <div className="total-bottom">
                        <span>
                          {period === "monthly"
                            ? "Monthly equivalent"
                            : "Yearly equivalent"}
                          <small>
                            {period === "monthly"
                              ? "Annual plans spread across 12 months."
                              : "Monthly plans multiplied by 12."}
                          </small>
                        </span>
                        <span className="count-bubble">
                          {active.length}
                          <small>active</small>
                        </span>
                      </div>
                      <div className="quick-actions">
                        <button onClick={beginAdd}>
                          <span>
                            <Plus size={20} />
                          </span>
                          Add
                        </button>
                        <button onClick={() => go("accounts")}>
                          <span>
                            <Landmark size={20} />
                          </span>
                          Accounts
                        </button>
                        <button onClick={() => go("notifications")}>
                          <span>
                            <Bell size={20} />
                          </span>
                          Reminders
                        </button>
                        <button onClick={() => go("activity")}>
                          <span>
                            <ReceiptText size={20} />
                          </span>
                          History
                        </button>
                      </div>
                    </section>
                    <section className="subscriptions">
                      <div className="section-heading">
                        <h2>
                          Your subscriptions <span>{active.length}</span>
                        </h2>
                        <button
                          className="icon-button small"
                          aria-label="Add subscription"
                          onClick={beginAdd}
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      {searching && (
                        <div id="subscription-search" className="search-box">
                          <Search size={20} />
                          <input
                            autoFocus
                            placeholder="Find a subscription"
                            aria-label="Find a subscription"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                        </div>
                      )}
                      <div className="subscription-list">
                        {active
                          .filter((s) =>
                            s.name.toLowerCase().includes(query.toLowerCase()),
                          )
                          .map(row)}
                      </div>
                      {!active.filter((s) =>
                        s.name.toLowerCase().includes(query.toLowerCase()),
                      ).length && (
                        <div className="empty">
                          <Sprout size={28} />
                          <h3>
                            {query
                              ? "No subscriptions found"
                              : "No active subscriptions"}
                          </h3>
                          <p>
                            {query
                              ? "Try a different name or clear your search."
                              : "Add a subscription to track its cost and renewal date."}
                          </p>
                        </div>
                      )}
                      <button className="add-button" onClick={beginAdd}>
                        <Plus size={20} />
                        Add subscription
                      </button>
                    </section>
                    {cancelled.length > 0 && (
                      <section className="cancelled-list">
                        <h2>
                          Cancelled <span>{cancelled.length}</span>
                        </h2>
                        {cancelled
                          .filter((s) =>
                            s.name.toLowerCase().includes(query.toLowerCase()),
                          )
                          .map(row)}
                      </section>
                    )}
                    <footer className="home-footer">
                      <span>
                        <CheckCheck size={16} />
                        {account.connections.length
                          ? `${account.connections.length} demo ${account.connections.length === 1 ? "account" : "accounts"} connected`
                          : "Sample subscriptions · no account connected"}
                      </span>
                      <button onClick={() => setDialog("reset")}>
                        Demo mode <span>·</span> Reset
                      </button>
                    </footer>
                  </main>
                </>
              ) : (
                <>
                  <header className="screen-header">
                    <button
                      className="icon-button"
                      aria-label="Go back"
                      onClick={() =>
                        go(screen === "success" ? "home" : backTarget)
                      }
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <span>
                      {screen === "success" ? "Cancellation recorded" : title}
                    </span>
                    {screen === "detail" ? (
                      <button
                        className="icon-button"
                        aria-label="Edit details"
                        onClick={edit}
                      >
                        <Pencil size={20} />
                      </button>
                    ) : (
                      <span className="header-spacer" />
                    )}
                  </header>
                  <main className={`page product-surface ${screen}`}>
                    {screen === "detail" && (
                      <>
                        <div className="detail-identity">
                          <Brand brand={sub.brand} large />
                          <span
                            className={`status-chip ${sub.status === "cancelled" ? "muted" : ""}`}
                          >
                            <span />
                            {sub.status === "cancelled"
                              ? "Cancelled · reported by you"
                              : "Active"}
                          </span>
                          <h1 className="display-heading" tabIndex={-1}>
                            <mark>{sub.name}</mark>
                          </h1>
                          <p>{sub.category}</p>
                        </div>
                        <div className="plan-price">
                          {money(sub.amount)}
                          <span>
                            /{sub.frequency === "yearly" ? "year" : "month"}
                          </span>
                        </div>
                        <p className="equivalent">
                          {money(
                            sub.frequency === "yearly"
                              ? sub.amount / 12
                              : sub.amount * 12,
                          )}{" "}
                          {sub.frequency === "yearly"
                            ? "per month, on average"
                            : "per year, on average"}
                        </p>
                        {sub.status === "active" ? (
                          <section className="renewal-card">
                            <div className="card-top">
                              <span>
                                <CalendarDays size={16} />
                                Next expected charge
                              </span>
                              <span className="tag">
                                {sub.dateSource === "user"
                                  ? "Set by you"
                                  : "Estimated"}
                              </span>
                            </div>
                            <div className="renewal-value">
                              <strong>{money(sub.amount)}</strong>
                              <span>
                                {sub.dateSource === "estimated"
                                  ? "around "
                                  : "on "}
                                {dateLabel(sub.renewal)}
                              </span>
                            </div>
                            <p>
                              {sub.dateSource === "estimated"
                                ? "Based on your previous payment. The next date and amount may change."
                                : "Using the renewal date you provided. The provider may change the actual charge."}
                            </p>
                          </section>
                        ) : (
                          <section className="cancelled-card">
                            <Check size={20} />
                            <div>
                              <strong>Excluded from future totals</strong>
                              <p>
                                {sub.accessEnd
                                  ? `Access until ${dateLabel(sub.accessEnd, true)}. `
                                  : ""}
                                You reported this cancellation. We haven’t
                                confirmed it with the provider.
                              </p>
                            </div>
                          </section>
                        )}
                        <section className="detail-section">
                          <h2>Payment details</h2>
                          <div className="payment-row">
                            <span className="visa-icon">VISA</span>
                            <span>
                              Visa ending 4242
                              <small>Sample payment method</small>
                            </span>
                            <ShieldCheck size={20} />
                          </div>
                        </section>
                        <section className="detail-section history">
                          <div className="section-heading">
                            <h2>Payment history</h2>
                            <span className="plain-label">Observed</span>
                          </div>
                          {sub.history.length ? (
                            sub.history.map((h, i) => (
                              <div className="history-row" key={i}>
                                <span className="history-icon">
                                  <ArrowUpRight size={20} />
                                </span>
                                <span>
                                  <strong>{sub.name}</strong>
                                  <small>{dateLabel(h.date, true)}</small>
                                </span>
                                <strong>{money(h.amount)}</strong>
                              </div>
                            ))
                          ) : (
                            <p className="helper">No observed payments yet.</p>
                          )}
                          <p className="helper">
                            Observed charges from your sample account.
                          </p>
                        </section>
                        <div className="bottom-actions">
                          <button className="button primary" onClick={edit}>
                            <Pencil size={16} />
                            Edit details
                          </button>
                          {sub.status === "active" && (
                            <button
                              className="button secondary"
                              onClick={() => go("cancel")}
                            >
                              How to cancel
                              <ArrowUpRight size={20} />
                            </button>
                          )}
                          <button
                            className="text-button"
                            onClick={() => go("home")}
                          >
                            Back to subscriptions
                          </button>
                        </div>
                      </>
                    )}
                    {(screen === "edit" || screen === "add") && (
                      <>
                        <span className="eyebrow">
                          {screen === "add"
                            ? "NEW SUBSCRIPTION"
                            : "SUBSCRIPTION DETAILS"}
                        </span>
                        <h1 className="display-heading" tabIndex={-1}>
                          {screen === "add"
                            ? "Add a\nsubscription."
                            : "Edit your\nsubscription."}
                        </h1>
                        <p className="intro">
                          {screen === "add"
                            ? "Enter the amount you pay and how often it renews."
                            : "Update the details below. This won’t change your plan with the provider."}
                        </p>
                        <form onSubmit={save}>
                          <label>
                            Subscription name
                            <input
                              required
                              maxLength={50}
                              value={draft.name}
                              onChange={(e) =>
                                setDraft({ ...draft, name: e.target.value })
                              }
                            />
                          </label>
                          <div className="form-columns">
                            <label>
                              Amount (€)
                              <input
                                required
                                type="number"
                                min="0.01"
                                max="999999"
                                step="0.01"
                                inputMode="decimal"
                                value={draft.amount || ""}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    amount: Number(e.target.value),
                                  })
                                }
                              />
                            </label>
                            <label>
                              Billing frequency
                              <select
                                value={draft.frequency}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    frequency: e.target
                                      .value as Subscription["frequency"],
                                  })
                                }
                              >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                              </select>
                            </label>
                          </div>
                          <label>
                            Next renewal date
                            <input
                              required
                              type="date"
                              value={draft.renewal}
                              onInput={(e) =>
                                setDraft({
                                  ...draft,
                                  renewal: e.currentTarget.value,
                                })
                              }
                              onChange={(e) =>
                                setDraft({ ...draft, renewal: e.target.value })
                              }
                            />
                            <small>
                              Changing this date replaces our estimate with “Set
                              by you.”
                            </small>
                          </label>
                          {screen === "edit" && (
                            <label>
                              Status
                              <select
                                value={draft.status}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    status: e.target
                                      .value as Subscription["status"],
                                  })
                                }
                              >
                                <option value="active">Active</option>
                                <option value="cancelled">
                                  Cancelled — reported by you
                                </option>
                              </select>
                            </label>
                          )}
                          {draft.status === "cancelled" && (
                            <p className="inline-info">
                              <Info size={20} />
                              Updating the status here won’t cancel billing with
                              the provider.
                            </p>
                          )}
                          <div className="bottom-actions">
                            <button className="button primary" type="submit">
                              {screen === "add"
                                ? "Add subscription"
                                : "Save changes"}
                              <Check size={20} />
                            </button>
                            <button
                              className="button secondary"
                              type="button"
                              onClick={() =>
                                go(screen === "add" ? "home" : "detail")
                              }
                            >
                              {screen === "add"
                                ? "Discard draft"
                                : "Discard changes"}
                            </button>
                            {screen === "edit" && (
                              <button
                                className="text-button danger-text"
                                type="button"
                                onClick={() => setDialog("remove")}
                              >
                                This isn’t a subscription
                              </button>
                            )}
                          </div>
                        </form>
                      </>
                    )}
                    {screen === "cancel" && (
                      <>
                        <div className="small-brand-row">
                          <Brand brand={sub.brand} />
                          <span>{sub.name}</span>
                        </div>
                        <span className="eyebrow">A TWO-STEP HANDOFF</span>
                        <h1 className="display-heading" tabIndex={-1}>
                          Cancel with
                          <br />
                          <mark>the provider.</mark>
                        </h1>
                        <p className="intro">
                          To stop billing, cancel with {sub.name}. Updating this
                          app alone won’t cancel your subscription.
                        </p>
                        <div className="step">
                          <span className="step-number">1</span>
                          <div>
                            <h2>Cancel your plan with the provider</h2>
                            <p>
                              Sign in with the provider and look for{" "}
                              <strong>Account</strong> or{" "}
                              <strong>Subscriptions</strong>. Follow their
                              cancellation steps.
                            </p>
                            <button
                              className="button primary"
                              onClick={() => go("provider")}
                            >
                              Preview provider website
                              <ExternalLink size={16} />
                            </button>
                            <small className="simulation-note">
                              Opens a simulated provider page in this demo.
                            </small>
                          </div>
                        </div>
                        <div className="step">
                          <span className="step-number">2</span>
                          <div>
                            <h2>Update your status here</h2>
                            <p>
                              Once you’ve cancelled with them, come back and
                              update your subscription here.
                            </p>
                            <button
                              className="button secondary"
                              onClick={() => {
                                setAccessEnd("");
                                go("confirm");
                              }}
                            >
                              I’ve cancelled with the provider
                              <Check size={20} />
                            </button>
                          </div>
                        </div>
                        <p className="inline-info">
                          <Info size={20} />A website visit alone won’t change
                          your status here.
                        </p>
                      </>
                    )}
                    {screen === "provider" && (
                      <>
                        <div className="provider-address">
                          <LockKeyhole size={16} />
                          {sub.brand === "apple"
                            ? "tv.apple.com/account"
                            : "Provider account"}
                          <span>Preview</span>
                        </div>
                        <div className="provider-content">
                          <Brand brand={sub.brand} large />
                          <span className="eyebrow">
                            SIMULATED PROVIDER WEBSITE
                          </span>
                          <h1 className="display-heading" tabIndex={-1}>
                            Your provider,
                            <br />
                            <mark>previewed.</mark>
                          </h1>
                          <p className="intro">
                            This is where you’d sign in and cancel your plan
                            directly with {sub.name}.
                          </p>
                          <div className="provider-boundary">
                            <ShieldCheck size={24} />
                            <p>
                              This is a preview. No provider was contacted, and
                              nothing in Subscript has changed.
                            </p>
                          </div>
                          <button
                            className="button primary"
                            onClick={() => go("cancel")}
                          >
                            Return to Subscript
                            <ArrowRight size={20} />
                          </button>
                        </div>
                      </>
                    )}
                    {screen === "confirm" && (
                      <>
                        <div className="confirmation-icon">
                          <Check size={30} />
                        </div>
                        <span className="eyebrow">REPORTED BY YOU</span>
                        <h1 className="display-heading" tabIndex={-1}>
                          Mark as
                          <br />
                          <mark>cancelled?</mark>
                        </h1>
                        <p className="intro">
                          We’ll stop predicting future payments for{" "}
                          <strong>{sub.name}</strong>. Past payments stay in
                          your history.
                        </p>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            update(cancelSubscription(sub, accessEnd));
                            go("success");
                          }}
                        >
                          <label>
                            Access end date{" "}
                            <span className="optional">Optional</span>
                            <input
                              type="date"
                              value={accessEnd}
                              onInput={(e) =>
                                setAccessEnd(e.currentTarget.value)
                              }
                              onChange={(e) => setAccessEnd(e.target.value)}
                            />
                            <small>
                              Add the last day you can use this subscription, if
                              you know it.
                            </small>
                          </label>
                          <div className="inline-info">
                            <Info size={20} />
                            <p>
                              This records what you tell us. It doesn’t contact
                              the provider or stop billing on its own.
                            </p>
                          </div>
                          <div className="bottom-actions">
                            <button className="button primary" type="submit">
                              Mark as cancelled
                              <Check size={20} />
                            </button>
                            <button
                              className="button secondary"
                              type="button"
                              onClick={() => go("cancel")}
                            >
                              Go back
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                    {screen === "success" && (
                      <div className="success-content">
                        <div className="success-art" aria-hidden="true">
                          <span className="sun-ray r1" />
                          <span className="sun-ray r2" />
                          <span className="sun-ray r3" />
                          <span className="success-check">
                            <Check size={48} strokeWidth={2} />
                          </span>
                          <span className="spark s1">✳</span>
                          <span className="spark s2">✦</span>
                        </div>
                        <span className="eyebrow">CANCELLATION RECORDED</span>
                        <h1 className="display-heading" tabIndex={-1}>
                          Marked as
                          <br />
                          <mark>cancelled.</mark>
                        </h1>
                        <p className="intro">
                          {sub.name} is marked as cancelled.
                          <br />
                          Reported by you. Not verified with the provider.
                        </p>
                        <section className="success-summary">
                          <div>
                            <span>New monthly equivalent</span>
                            <strong>
                              {money(totalFor(items, "monthly"))}
                              <small>/mo</small>
                            </strong>
                          </div>
                          <span className="success-sprout">
                            <Sprout size={29} />
                          </span>
                        </section>
                        {sub.accessEnd && (
                          <p className="access-note">
                            Access until {dateLabel(sub.accessEnd, true)}
                          </p>
                        )}
                        <p className="helper">
                          Payment history is preserved. You’ll find {sub.name}{" "}
                          in your cancelled subscriptions.
                        </p>
                        <button
                          className="button primary"
                          onClick={() => go("home")}
                        >
                          Back to Home
                          <ArrowRight size={20} />
                        </button>
                        <button
                          className="text-button"
                          onClick={() => go("detail")}
                        >
                          View subscription
                        </button>
                      </div>
                    )}
                  </main>
                </>
              )}
            </div>
            {showNav && (
              <nav className="bottom-nav" aria-label="Main navigation">
                {(
                  [
                    { route: "home", label: "Home", icon: Home },
                    { route: "activity", label: "Activity", icon: ReceiptText },
                    { route: "profile", label: "Profile", icon: UserRound },
                  ] as const
                ).map(({ route, label, icon: Icon }) => (
                  <button
                    key={route}
                    aria-label={label}
                    aria-current={
                      screen === route ||
                      (route === "profile" && screen === "settings")
                        ? "page"
                        : undefined
                    }
                    onClick={() => go(route)}
                  >
                    <span>
                      <Icon size={20} />
                    </span>
                    <small>{label}</small>
                  </button>
                ))}
              </nav>
            )}
            <div className="home-indicator" aria-hidden="true" />
            {toast && (
              <div className="toast" role="status">
                <Check size={16} />
                {toast}
              </div>
            )}
            <dialog
              ref={modal}
              onCancel={() => setDialog(null)}
              onClick={(e) => {
                if (e.target === e.currentTarget) setDialog(null);
              }}
              aria-labelledby="dialog-title"
            >
              <div className="dialog-handle" />
              <button
                className="icon-button dialog-close"
                aria-label="Close confirmation"
                onClick={() => setDialog(null)}
              >
                <X size={20} />
              </button>
              <span className="dialog-icon">
                {dialog === "reset" ? (
                  <RotateCcw size={24} />
                ) : (
                  <Info size={25} />
                )}
              </span>
              <h2 id="dialog-title">
                {dialog === "reset"
                  ? "Reset this demo?"
                  : "Remove from subscriptions?"}
              </h2>
              <p>
                {dialog === "reset"
                  ? "This resets the sample subscriptions, profile, and preferences, then restarts onboarding."
                  : `${sub.name} will be removed from subscription totals and predictions. This won’t cancel billing or delete observed payment history.`}
              </p>
              <button
                className="button primary"
                onClick={() => {
                  if (dialog === "reset") reset();
                  else {
                    update({ ...sub, status: "removed" });
                    setDialog(null);
                    go("home");
                    setToast(
                      "Removed from subscriptions. Payment history kept.",
                    );
                  }
                }}
              >
                {dialog === "reset"
                  ? "Reset demo"
                  : "Remove from subscriptions"}
              </button>
              <button
                className="button secondary"
                onClick={() => setDialog(null)}
              >
                {dialog === "reset" ? "Keep current demo" : "Keep subscription"}
              </button>
            </dialog>
          </div>
          <div className="under-phone">
            <span>SUBSCRIPT / MOBILE PROTOTYPE</span>
            <button onClick={() => setDialog("reset")}>
              <RotateCcw size={16} />
              Reset demo
            </button>
          </div>
        </div>
      </div>
      <footer className="desktop-footer">
        <span>A little clarity. A lot less admin.</span>
        <span>
          MADE FOR EVERYDAY PEACE OF MIND <span>↗</span>
        </span>
      </footer>
    </div>
  );
}
