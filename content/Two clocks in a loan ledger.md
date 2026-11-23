I maintain a private loan ledger app for a small lending business. It holds borrowers, principal, monthly interest, and the reminders that go out when a month is missed. The diagrams here are drawn from the code instead of screenshots.

I cut 1.5.1 and 1.5.2 in the week of 17 November. The first rebuilt the Home screen around two money views, reworked the theme tokens and typography, and added a whole-book Overview page. The second shrank the Android build and set up over-the-air updates. The ledger work kept running into the same problem: a rupee has two dates.

## The first of the month was wrong

Interest for a month is due in the first three days of the next one. Every screen depends on that sentence. `money.ts` holds the constants: `SHORT_RATE = 6`, `LONG_RATE = 2`, `DUE_DAY_START = 1`, `DUE_DAY_END = 3`. A short loan accrues 6 percent a month. A long loan accrues 2 percent, paid yearly or when the loan closes.

The Home screen had a card for this month's interest. On 1 November it read zero collected against November's expected amount. November's payment window is 1 to 3 December, so no November money could have arrived yet. The money arriving that morning was for October, and the card did not look at October. I had built a card around the due month and then read it as if it were the cash month.

`resolveMonthState` returns one of five states. A recorded payment wins, then `future`, `awaiting`, `pending` or `delayed` as the month and its window move.

```ts
export function resolveMonthState(
  dueMonth: string,
  paidOn: string | null,
  today: Date
): MonthState {
  if (paidOn) return 'paid';
  const nowKey = monthKey(today);
  if (dueMonth > nowKey) return 'future';
  const windowKey = dueWindowMonth(dueMonth);
  if (nowKey < windowKey) return 'awaiting';
  if (nowKey > windowKey) return 'delayed';
  return today.getDate() <= DUE_DAY_END ? 'pending' : 'delayed';
}
```

`awaiting` is what makes a mid-month loan fair. A loan given on 28 October has October interest, and October's window is 1 to 3 November, so it is not late on the day it starts. Without that state the grid would paint a new borrower red immediately.

Each loan gets a month cell from its start month to `lastDueMonth`: the current month for an open loan, the close month for a closed one. The expected amount is `monthlyInterest(loan.amount, loan.rate)`, not a stored number, so a corrected principal flows through every cell.

The fix was small once the model was right. `computeDashboard` gained `shortInterestDueLastMonth` and `shortInterestCollectedForLastMonth`, computed from the month cells and from payments whose `due_month` is last month. `CashSummary` takes the due amount, the collected amount and the month label, and keeps the cash figure on the current calendar month. The interest half opens `month-payments` for last month with `scope=interest`; the cash half opens the current month with `scope=received`. Tapping either half opens the month it is actually reporting.

![[ledger-month-states.png|The month state machine: due month, payment window, and the five states resolveMonthState returns]]

*How a due month moves from future to awaiting, pending, delayed or paid.*

## Every rupee once

The new Overview page is a book statement, not another Home. Every rupee appears once. Principal is a stock, lending and closing are flows, and cash is what actually landed. The old page mixed them, so the same rupees could show up in more than one headline.

`computeOverview` returns them separately. `totalLent` is all-time principal, split into `closedPrincipal`, `principalShort` and `principalLong`, which add back to the total. `principalOut` is the active principal. The month's movement is one identity: `openingPrincipal = principalOut - lentThisMonth + closedThisMonth`. That identity keeps the opening and closing figures in agreement.

The risk block only counts short-term dues. `totalDue = overdueAmount + inWindowAmount`, and the overdue part is aged by `daysPastDeadline`, which measures from `dueDeadline(dueMonth)`, the third of the following month. The buckets are 30, 60, 90 and older. The day count uses `Date.UTC(y, m - 1, d)` on both ends, so a daylight-saving shift cannot move a payment into the next bucket. `arrearsMonths` is `overdueAmount / shortMonthlyRunRate`, which turns rupees into months of collection.

The long-term side had a bug. It counted payment rows, so a borrower who paid a year's interest in one transfer looked like they had settled one month and owed eleven. The new code accrues every month from the start to today, subtracts the money actually received, and floors the result at zero. A test fixture sets 21 months at 2,000 and one 24,000 payment and expects 18,000 still accrued. Another test pins the case where a due month is paid early and the cash belongs elsewhere.

![[ledger-overview-identities.png|The Overview identities: principal composition, month movement, and aging buckets measured from the third of the following month]]

*The three blocks on Overview and the arithmetic that keeps them from overlapping.*

The design is in `docs/OVERVIEW-DESIGN.md`, which keeps the rejected versions too. A second collection queue lost because Home already owns the chase list, and a three-chip scope switcher would hide the whole-book totals behind a tap.

## Money writes go in one batch

The database is Turso, libSQL over HTTP. It has no interactive transactions, so a multi-statement change cannot be rolled back by hand. The atomic unit is `db.batch(statements, 'write')`, which sends the list as one write. Every money change goes through it.

Marking a month paid is an upsert plus an audit row. The upsert targets `(loan_id, due_month)` where `kind = 'interest'`, backed by the partial unique index `idx_payments_interest_month`. The insert creates the row if it is missing and updates it otherwise. The second statement appends a `paid` event with the amount and the date that was actually recorded. Both are in one batch, so an audit entry cannot exist without its payment, or the other way round.

Undo is the more interesting one. It does not delete the row. It writes an `unpaid` event by selecting from `payments` where `paid_on IS NOT NULL`, then clears `paid_on` in the same batch. The `INSERT ... SELECT` means a second undo writes no event, because the select returns nothing. The month goes back to pending or delayed, `totalPaid` drops, and the history still shows that the payment existed and was reversed. A lender will sometimes mark the wrong month. The history should show the correction instead of erasing it.

Reads fail differently. `listPeople` loads people, loans and payments in three queries and groups them in memory. When the network is down, `listPeopleOffline` returns the last snapshot from `readPeopleCache` and sets an `offline` flag. Writes still need a connection; there is no write queue. I preferred a visible offline read over a silent write that might never land.

## Shipping updates without a cable

Version 1.5.2 carries `expo-updates` with the `appVersion` runtime policy. `app.json` sets `runtimeVersion` to the `appVersion` policy, and `eas.json` gives the production build the `production` channel and an APK. The APK's runtime version equals its app version, currently 1.5.2. A JS or asset-only change ships with `npx eas-cli update --branch production --message "..."` and lands on launch. A native dependency, permission, config plugin, icon or splash change needs a new build, because the runtime version moves with the app version.

The same release had a dependency conflict. `npm ci` failed on reanimated 4.7.1, which wants worklets 0.13, while Expo 57 allows worklets 0.10. The fix was to pin the pair that matches the SDK, 4.5.1 and 0.10.1.

I also deleted an unused SVG chart and the native `react-native-svg` package, `expo-linear-gradient`, five unused font weights and the starter assets. ProGuard, resource shrinking and minification were already on; 1.5.2 added legacy native-library packaging and JS bundle compression. A config plugin, `withArm64Only`, writes `abiFilters 'arm64-v8a'` into `build.gradle` and sets `reactNativeArchitectures` to the same value, so the APK carries one set of native libraries instead of four. `npx expo prebuild` stays reproducible because the change is a plugin, not an edit to `android/`.

![[ledger-ota-lanes.png|The build lane and the over-the-air update lane, with the native change that forces a new build]]

*What can ship over the air and what still needs a new APK.*

The tradeoff is that an old 32-bit phone cannot install the APK, and Android is the only build profile in the repo. For the phones this app runs on that is fine, but I have to remember it when someone asks for the app.
