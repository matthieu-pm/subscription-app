# Subscript voice

A helpful friend who remembers the subscriptions you don’t. Warm, observant, lightly witty, and never pushy.

Both prototypes share this voice. Let headings and supporting copy carry the personality; keep navigation, form labels, amounts, dates, and action buttons easy to understand.

## How it sounds

| Moment | Copy | What it does |
| --- | --- | --- |
| Welcome | “They renew. You remember.” | Makes the benefit memorable. |
| Sign-up | “A little setup now. Less ‘what was that charge?’ later.” | Connects setup to a familiar moment. |
| Demo email | “Your inbox can sit this one out. No email is sent.” | Adds warmth while explaining the demo. |
| Subscription review | “Meet your regulars.” | Gives recurring payments a little personality. |
| Reminders | “Renewals have a habit of sneaking up. How much notice would you like?” | Offers help and leaves the choice with the user. |
| No accounts | “No accounts? No rush.” | Makes an optional step feel optional. |
| Add subscription | “One less thing to keep in your head.” | Explains the value without promising automation. |
| Help | “Glad you asked.” | Welcomes questions. |

## Keep the balance

- One playful idea per moment is enough. Supporting text must still explain the next step.
- Find humor in recurring admin, never in someone’s spending, mistakes, or circumstances.
- Keep errors reassuring and actionable. Don’t turn a failed payment or incorrect code into a punchline.
- Cancellation, disconnection, and reset confirmations state what changes and what doesn’t. Success confirms the recorded action, without implying provider verification or guaranteed savings.
- Keep demo boundaries visible: sample data, simulated connections, and unsent emails or notifications.
- Empty search, empty active subscriptions, and empty cancelled subscriptions need different explanations.
- Skip financial jargon, budget lectures, exaggerated celebration, and pressure to connect an account.

## Implementation

The yellow prototype uses `src/AccountFlows.tsx` and `src/App.tsx`. The Expo prototype uses `mobile-revolut/App.tsx`. The copy pass covers welcome, sign-in, setup, review, reminders, everyday tracking, empty states, help, and completion messages. Existing financial calculations, provider handoffs, and demo behavior remain the source of truth.
