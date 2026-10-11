# Subscript

## Repository and shared testing

This repository contains both prototypes. Vercel serves the current Expo app from `mobile-revolut`; the root Vite app is the earlier design. The GitHub repository is https://github.com/matthieu-pm/subscription-app.

To update the shared app, commit and push to `main`. Vercel builds `mobile-revolut` using `npm ci` and `npm run build:web`, then publishes `dist`. No backend or environment variables are needed.

A mobile-first subscription-management prototype built with React, TypeScript, and Vite. The latest direction uses light finance surfaces, white grouped cards, a charcoal summary card, and floating black navigation. Bold condensed headings, yellow highlights, and outlined actions carry through login, onboarding, subscription details, profile, and settings. Welcome and authentication include graphic artwork and split arrow buttons from the supplied taxi-app reference. DM Sans and Barlow Condensed are bundled locally. The earlier Revolut styling direction was superseded.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:5173. On desktop, the app is presented in a phone frame; on mobile, it fills the viewport.

```sh
npm run build
npm test
```

## Login, onboarding, and account flows

A fresh browser opens the welcome screen. **Get started** and **Log in** lead to Apple, Google, or passwordless email demo sign-in. Apple and Google use a clearly labelled account preview; email accepts the demo verification code **123456** and shows an error for incorrect codes.

Onboarding includes your name, optional bank connection, explicit sample-data consent, a review of detected subscriptions, renewal-reminder preferences, and a completion screen. You can skip connecting an account and explore sample subscriptions. No real OAuth, banking connection, email, or notification is initiated.

The floating navigation opens **Home**, **Activity**, and **Profile**. Profile includes editable personal details, connected accounts, settings, help, and confirmed logout. Settings include persistent renewal-reminder timing and email-summary preferences, account disconnection, privacy information, and expandable help answers. Activity retains observed payment history after cancellation or removal from subscription tracking.

Desktop flow shortcuts let you jump into login/onboarding, subscriptions, or profile/settings. **Reset demo** clears both prototype data and account preferences and restarts onboarding. The onboarding shortcut restarts setup while preserving subscription edits.

## Try the Apple TV journey

1. Open **Apple TV** from the home screen (€120/year; €10 monthly equivalent).
2. **Edit details** to change the amount, frequency, name, renewal date, or reported status. A changed renewal date is labelled **Set by you**. **Discard changes** leaves the draft unsaved.
3. **How to cancel** explains the provider handoff. **Preview provider website** opens a clearly labelled local simulation and does not change the subscription.
4. Return and select **I’ve cancelled with the provider**, optionally enter an access end date, then **Mark as cancelled**.
5. From the initial four-subscription dataset, Home updates to €29/month or €348/year and moves Apple TV into **Cancelled**. The observed €120 payment remains unchanged.

Search, add, correction/removal, confirmation sheets, and reset are also interactive. State persists in this browser's local storage. Use **Reset demo** to restore the sample data.

## Prototype boundaries

All data is fictional and anchored to a November 2026 demo snapshot; the wireframe's dates were moved forward one year. Account syncing, Visa 4242, provider access, and cancellation are simulations. No banking, payment, Apple, or other provider API is called. Cancellation is always user-reported, never provider-verified. Removing a mistaken subscription excludes it from totals but retains its observed history in local data.

## References

- [Figma Make wireframe](https://www.figma.com/make/C5suY962cJSY6oPnQG7nZG/Subscription-Management-App-Wireframe) — inspected in the shared browser preview, including the edit, provider handoff, and cancellation confirmation screens.
- [Figma visual inspiration](https://www.figma.com/design/SKAkBj2GKseaVE2Agveve0/Subscription-App-Design?node-id=0-1) — inspected as a moodboard in the browser. Its references combine finance/taxi app interfaces and warm, nature-inspired interiors.
- Latest user-supplied finance reference: light surfaces, white cards, dark summary card, circular actions, and floating black navigation.
- Latest user-supplied taxi reference: bold condensed type, yellow graphic highlights, black outlines, and split arrow actions for welcome and authentication.

Figma's design-context connector required edit access. The public browser views were readable and used as references; this is an original styled implementation, not an exported Figma design.

## Verification

- Production build and TypeScript check pass.
- Model tests verify normalization, cancellation totals, and retained observed history.
- Browser-checked at desktop, 390 × 844, and 320 × 700: home, period switching, detail, editing, reload persistence, provider simulation, cancellation with access date, success, cancelled history, search, adding, correction/removal, and reset.
- Native labelled forms, native dialog focus containment, keyboard focus styles, and reduced-motion support.

- Additional browser checks: Apple/Google/email sign-in, incorrect-code recovery, bank consent gating, setup completion, profile updates, preferences after reload, account disconnection, help expansion, logout, and the existing Apple TV cancellation journey.

## Content and visual consistency

Screen copy follows the ux-writing skill: explicit action labels, recoverable verification errors, clear next steps, and separate language for estimated renewals, observed payments, and user-reported cancellations. Demo sign-in, account connections, and reminders describe their actual prototype behavior. Financial amounts remain in DM Sans for scanning; display headings use Barlow Condensed with yellow highlights.

The latest update was checked at desktop, 390 × 844, and 320 × 700 for subscription details, cancellation instructions and confirmation, profile, settings, privacy, reminder toggles, email-code error recovery, onboarding completion, and bank connection/review.

## Icon and interaction polish

Interface icons now use the official `@hugeicons/react` renderer and `@hugeicons/core-free-icons` package. `src/icons.tsx` centralizes icon semantics and stroke weight; `src/polish.css` centralizes touch targets, focus rings, selected/disabled states, surface depth, and motion. Buttons support `data-static="true"` to suppress press scaling, and the shared onboarding `Action` exposes a `static` prop. Keyboard actions remain instant. See [design-qa.md](design-qa.md) for the great-ui review, inspected states, and verification limits.

Login and onboarding now share polished 56 px sign-in choices, labelled setup progress, inline email/code recovery, and selected consent styling. Skipping connection setup preserves any existing demo connection, and the reminder preview follows an active subscription. The full sign-in → setup → Apple TV edit → cancellation journey, including reload persistence and returning sign-in, is documented in [journey-qa.md](journey-qa.md).

## Multiple connected accounts

Users can add personal and joint demo accounts at the same bank or across banks during onboarding or from Connected accounts. Each connection is identified separately, already-connected accounts cannot be added twice, and disconnecting targets only the chosen account. Counts update in setup, home, profile, and settings. Existing single-bank data migrates automatically without resetting the profile or preferences. Sample subscriptions remain shared and are not duplicated when connecting another account.

## Alternative native iPhone prototype

The independent Revolut-style React Native app is in [`mobile-revolut`](mobile-revolut/README.md). It uses Geist and Hugeicons. Run `npm run mobile`, then open its QR in Expo Go on iPhone. The original Vite app continues to use `npm run dev`.
