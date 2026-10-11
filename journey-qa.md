# Login, onboarding, and Apple TV journey review

11 October 2026. Great-ui follow-up. All journey mutations ran against a fresh, isolated local demo on port 5174. The user's existing port-5173 account and subscriptions were not reset or edited.

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM · resolved | `src/AccountFlows.tsx`, `src/polish.css` | Browser-only validation for incomplete codes and malformed email; stale incorrect-code state while typing | Inline, announced errors; focus returns to the field; editing clears the error | Clear recovery and accessible states |
| MEDIUM · resolved | `src/AccountFlows.tsx` | Unlabelled setup segments, missing progress in bank substeps | Step number, stage label, semantic progressbar throughout bank setup | Keeps orientation and progress understandable without color alone |
| MEDIUM · resolved | `src/AccountFlows.tsx` | Skipping setup cleared an existing bank connection | Skip advances without disconnecting | A navigation choice should not silently change account data |
| MEDIUM · resolved | `src/AccountFlows.tsx` | Reminder preview always showed Apple TV and its original charge | Preview follows an active subscription and its current amount/date | Prevents misleading preview content after edits or cancellations |
| LOW · resolved | `src/polish.css` | Uneven sign-in surfaces and icon alignment | Aligned 56 px Apple/Google/email choices, matched radii and subtle surface shadows | Consistent optical alignment and touch targets |
| LOW · resolved | `src/polish.css` | Consent selection had little visual emphasis; summary and demo-code cards retained older styling | Yellow selected consent and code hint; grouped setup summary; high-contrast focus | Static, coherent feedback throughout setup |
| LOW · resolved | `src/polish.css` | Decorative signup stamp crowded the long headline at 320 px | Stamp hidden only on compact signup | Preserves readable typography without changing the flow |
| LOW · resolved | `src/App.tsx` | Success header said “All taken care of” | “Cancellation recorded” | Reflects the actual user-reported outcome |

## Verified journey

1. Fresh welcome → login. Apple and Google demo account choices both reached name setup.
2. Email sign-in: malformed email, missing six-digit code, and incorrect `000000` code showed inline recovery messages. Editing cleared `aria-invalid`; `123456` signed in successfully.
3. Name → bank selection. Unmatched bank search showed the empty state. Revolut consent blocked continuation until checked; connecting displayed the four sample subscriptions.
4. Set reminders to seven days before → review setup → home. Setup summary showed Revolut and seven-day timing. Home began at €39/month for four active subscriptions.
5. Apple TV: changed €120/year to €144/year and renewal from 14 November to 14 December 2026. Details showed €12/month and “Set by you”; home showed €41/month. Reload retained the changes.
6. Changed a draft amount to €999 and discarded it. Saved amount stayed €144.
7. Opened the simulated provider website and returned. Apple TV remained active; the preview did not alter status.
8. Reported cancellation with access end date 14 December 2026. Success showed €29/month. Home showed Apple TV under Cancelled and €348/year for remaining plans.
9. Reload retained cancellation and access end date. Apple TV's observed payment remained €120 on 14 November 2025.
10. Reminder preferences still showed seven days before. Logged out and signed back in with Google: returned directly to home, with completed setup and cancellation preserved.
11. Replayed setup and skipped connecting an account: existing Revolut connection survived. Reminder preview selected active Netflix rather than cancelled Apple TV.

## Visual and runtime verification

- Inspected 390 × 844 login, email error state, onboarding connection and completion, and cancellation success.
- Inspected 320 × 700 login/signup and reminder setup. No horizontal overflow. Sign-in buttons measured 56 px high; the compact signup stamp no longer overlaps the headline.
- Inspected setup completion in the 1280 × 900 desktop phone frame. Longer screens remain vertically scrollable.
- Production build and TypeScript compilation pass. All three model tests pass. Browser console returned no warnings or errors.
- Existing static, keyboard, focus, disabled, pointer-hover, and reduced-motion rules continue to apply to these screens. No artificial loading state added to synchronous demo actions.

Not verified: physical-device keyboard/touch behavior, Safari rendering, OS reduced-motion playback, paused hover/press frames, and 10%/frame-by-frame animation playback. Social login, banking, notifications, and provider cancellation are simulations; no real service was contacted.

**Approve — inspected scope only.** No unresolved HIGH findings.

## Multiple accounts — 11 October 2026

- Separate test origin at port 5175: Apple demo sign-in → onboarding → Monzo personal account → add Monzo joint account → finish setup. Summary and home showed two accounts, with the original four subscriptions and €39 monthly total.
- Reload preserved both connections. Adding Revolut produced three accounts. Already-connected account choices were disabled, and a fully connected bank showed guidance to choose another bank.
- Keeping an account dismissed confirmation without removal. Disconnecting Monzo joint account retained Monzo personal and Revolut; reopening the app preserved that result and unchanged subscription totals.
- Profile displayed two connected accounts; settings displayed two accounts. A subsequent targeted disconnection returned keyboard focus to Add another account. No console warnings or errors in the final test tab.
- Existing single-bank profile on port 5173 migrated to a Monzo personal connection. No sample connection additions or disconnections were performed on that origin.
- Inspected account cards at 320 × 700 (document width 320), 390 × 844, and 390 × 1000. Screenshot: `screenshots/multiple-accounts.jpg`. Connections remain simulated; no provider or bank API was called.
- Seven model tests pass, covering legacy migration, multiple same/different-bank accounts, duplicate prevention, serialization, targeted removal, subscription totals, and cancellation history. Production TypeScript/Vite build passes.
