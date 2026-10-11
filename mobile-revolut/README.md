# Subscript — native Revolut alternative

An independent React Native / Expo SDK 57 iPhone prototype. The original Vite prototype in the parent directory is preserved. All app UI uses native React Native views, inputs, scroll views, switches and modal sheets; it is not a WebView. Geist regular/medium/semibold/bold fonts and the Hugeicons native SVG renderer are bundled. The web target is also available for browser-based testing on iPhone and Android; native glass and haptics still require a native device build.

## Open on iPhone

1. Install Expo Go from https://expo.dev/go on your iPhone.
2. Sign in to the same free Expo account in Expo Go and on this Mac (`npx expo login --browser` from this directory).
3. From the repository root, run `npm run mobile`. On first setup run `npm --prefix mobile-revolut install`.
4. Scan the terminal QR using the iPhone Camera. The launcher also refreshes `artifacts/iphone-qr.png` for each tunnel session.

Keep the terminal running. Connect your iPhone and Mac to the same Wi-Fi. For a different network, use `npm run start:iphone -- --tunnel` (requires the Expo tunnel service to be available). If port 8081 is in use, stop the previous Expo session first. Expo Go is the native runtime; no Xcode or Apple Developer membership is required for this prototype. A signed standalone IPA/TestFlight build is not part of this deliverable.

Official device setup: https://docs.expo.dev/get-started/set-up-your-environment/?device=physical&platform=ios

## Try it

- Start at Welcome, or choose Explore the demo to go directly to Home.
- Demo email verification uses **123456**. Other codes show a recoverable error.
- Onboarding: profile → bank/sample data → detected subscriptions → reminder preferences → ready.
- Home: €39/month or €468/year for the initial four subscriptions; tap the period pill to switch.
- Subscriptions: search, active/cancelled filtering, add, edit, manual renewal correction, removal, details.
- Apple TV: €120/year → How to cancel → preview provider → report cancellation with optional access end. Home becomes €29/month or €348/year; the historical €120 payment remains in Activity.
- Connect personal and joint demo accounts at one bank, or add accounts across banks. Duplicates are prevented.
- Profile, editable personal details, notifications, settings, privacy, help, logout, and Reset demo.

Data is stored locally using AsyncStorage under `subscript-revolut-native-v1`. It is separate from the old browser prototype. No bank, provider, authentication or notification service is called. Cancellation is user-reported. Dates retain the original November 2026 sample snapshot.

## Verification

- `npm run typecheck` — passes.
- `npx expo-doctor` — 21/21 checks pass.
- `npm run export:ios` — native iOS Hermes bundle and local fonts/images export successfully.
- Companion rendering checked at 390 × 844: welcome, home, details, edit, cancellation sheet, profile, bank linking and onboarding.
- Interaction checks: incorrect-code recovery, complete onboarding, renewal correction, cancellation with access date, €39 → €29 total, preserved payment history, account consent, duplicate prevention, personal + joint accounts, reload persistence and reset.
- Screenshots in `artifacts/*-preview.png` are from the companion renderer, **not iPhone screenshots**.
- This Mac has no Xcode/iOS simulator. Physical iPhone behavior and native keyboard/safe-area behavior still require Expo Go device verification.

## Design references

All supplied unique Mobbin flows were opened. The Home flow was also inspected through Mobbin's connector images; additional subscription screens informed the subscription-specific adaptations.

- Onboarding: https://mobbin.com/flows/7291bae9-7b5a-4b40-a911-316447f4437c
- Profile setup: https://mobbin.com/flows/a2a893a2-d70b-4a3a-ad61-7909e174c27c
- Home: https://mobbin.com/flows/5abbe06a-b1c2-4781-aa74-f6aee820b558
- Finish setting up: https://mobbin.com/flows/fe848fd8-58f2-48d4-bdd5-627ae623fda0
- Link a bank: https://mobbin.com/flows/10de8de0-3d7f-4e97-b4a0-68a4d108c1dc
- Details: https://mobbin.com/flows/226cf74f-1032-4388-8e60-80ddee857f46
- More actions: https://mobbin.com/flows/6090ad55-b53d-4af0-92ba-66f81fe03951
- Transaction detail: https://mobbin.com/flows/7b37312c-79a6-471b-a4f5-27d97a7a3596
- Card detail: https://mobbin.com/flows/3f84a3d2-cfed-4448-9696-c8c404f051f1

The result reproduces the dark blue visual direction and native screen patterns, adapted to Subscript content. Geist replaces Revolut's proprietary typography at the user's request. No claim of pixel-identical reproduction.

## Generated artwork

Built-in imagegen created `assets/welcome-hero.png`. Final prompt:

> Use case: stylized-concept. Asset type: native mobile finance app welcome hero, square composition. Create a premium photorealistic 3D product render of three floating rounded-square polished chrome tiles stacked in an exploded vertical arrangement, camera 3/4 overhead. Top tile has an embossed abstract circular recurring-arrows symbol, no lettering. Middle tile cobalt blue translucent glass, bottom tile brushed silver. Large sculptural hero occupies center 70% of image with generous margins. Beautiful silver reflections, electric blue edge lighting, dark black and navy studio environment. Background must fade to pure black on all edges so image blends into a black mobile screen. Revolut-style premium fintech material language. No text, no logos, no watermark, no UI, no phone frame. Asset for subscription app called Subscript.

## Native Liquid Glass

`src/Glass.tsx` uses Expo's native `GlassView` (`UIVisualEffectView`) for the floating tab bar, toolbar search, circular actions, and period picker on supported iOS 26+ runtimes. Runtime availability checks protect older OS versions; Reduce Transparency is respected, including changes while the app is open. Other platforms use a translucent fallback. The browser preview cannot demonstrate native refraction or interactive glass.

Expo project linked successfully: `11e10e1e-55aa-4565-9b11-010004cde33e` (slug `subscript`).

Implementation reference: https://docs.expo.dev/versions/v57.0.0/sdk/glass-effect/

## Light and dark appearance

Open **Profile → App settings → Appearance → Light mode** to switch. The preference is stored with the local prototype data; existing saved profiles keep the original dark appearance. Both themes cover home, lists, detail/edit screens, onboarding, confirmation sheets, icons, status bar, native keyboards and Liquid Glass's color scheme. Reduce Transparency fallbacks follow the selected appearance.

Subscription rows show the billing frequency under the name and the amount alone on the right, including Home and onboarding previews.

Validated the settings switch in both directions, light-theme home/list/edit/cancellation surfaces, and preference persistence after reload in the companion renderer. TypeScript, Expo lint and iOS bundle export pass. Actual iOS Liquid Glass rendering still requires device verification.

## Drawer motion

`src/BottomDrawer.tsx` keeps the full-screen backdrop stationary and fades its opacity separately from the panel's vertical animation. Content stays mounted until closing finishes, and Reduce Motion disables both animations. The backdrop also stays outside the keyboard-avoiding layout.

Companion-renderer frame samples in `artifacts/drawer-motion-check.json` confirm a constant backdrop top of 0 and full viewport height during entry and exit, with only the panel translating. Closing preserves the original content until unmount. Native device motion still needs visual verification.

## Share the browser version

Vercel deploys this directory (`mobile-revolut`) from the repository. It installs with `npm ci`, runs `npm run build:web`, and serves `dist`. The production branch is `main`; pushes deploy updates automatically once Git integration is connected. No environment variables or backend services are required.

Testers can open the public link in Safari or Chrome and choose **Explore the demo**. Each browser stores its own demo data. Email demo verification uses **123456**. Native Liquid Glass and haptics are not reproduced in the browser.
