# Spam and phishing wireframes

Low-fidelity wireframes and the interaction spec for reader's PRD 041 (`docs/design/041_remit-spam-and-phishing-filtering.prd.md` in remit-mail/reader). Each SVG in `wireframes/` draws one state. Each state maps to one Storybook story, named as `docs/architecture/storybook.md` requires. A component in `packages/ui` gets a `Design System/Spam/<Component>` story with the `proposed` tag. A screen no route mounts gets a `Playground/Proposed/<feature>` story.

Placeholder data only: a sender name, an example.com email, a subject line, and counts drawn for layout.

## States and stories

| # | Wireframe | Story | PRD |
| --- | --- | --- | --- |
| 1 | `spam-banner-warn-spam.svg` | `Design System/Spam/SpamWarningBanner` `WarnSpam` | S2.1 |
| 2 | `spam-banner-warn-phishing.svg` | `Design System/Spam/SpamWarningBanner` `WarnPhishing` | S2.2 |
| 3 | `spam-banner-model-skipped.svg` | `Design System/Spam/SpamWarningBanner` `ModelSkipped` | N1.3 |
| 4 | `spam-banner-now-junk.svg` | `Design System/Spam/SpamWarningBanner` `NowJunk` | S10.2 |
| 5 | `spam-banner-check-failed.svg` | `Design System/Spam/SpamWarningBanner` `CheckFailed` | N1.1 |
| 6 | `spam-banner-pending.svg` | `Design System/Spam/SpamWarningBanner` `Pending` | N1.7 |
| 7 | `spam-banner-action-failed.svg` | `Playground/Shipped/Mail/ErrorBanner` `ReportSpamFailed` (new story) | N1.7 |
| 8 | `spam-banner-phone.svg` | `Design System/Spam/SpamWarningBanner` `Phone` | N3.3 |
| 9 | `spam-not-spam-offer.svg` | `Design System/Spam/NeverInSpamOffer` `Default` | S3.2 |
| 10 | `spam-verdict-warn-spam.svg` | `Design System/Spam/SpamVerdictPanel` `WarnSpam` | S1.1, S1.2 |
| 11 | `spam-verdict-junk-phishing.svg` | `Design System/Spam/SpamVerdictPanel` `JunkPhishing` | S1.1 |
| 12 | `spam-verdict-model-judged.svg` | `Design System/Spam/SpamVerdictPanel` `ModelJudged` | S1.3 |
| 13 | `spam-verdict-screened-out.svg` | `Design System/Spam/SpamVerdictPanel` `ScreenedOut` | S1.4, S5.1 |
| 14 | `spam-verdict-reported-sender.svg` | `Design System/Spam/SpamVerdictPanel` `ReportedSender` | S1.5, S4.2 |
| 15 | `spam-verdict-unknown-reason.svg` | `Design System/Spam/SpamVerdictPanel` `UnknownReason` | N1.2 |
| 16 | `spam-verdict-warn-only-above-junk.svg` | `Design System/Spam/SpamVerdictPanel` `WarnOnlyAboveJunk` | S7.1 |
| 17 | `spam-row-warned.svg` | `Design System/Spam/SpamRowMarker` `Warned` | S2.3 |
| 18 | `spam-row-moved.svg` | `Design System/Spam/SpamRowMarker` `Moved` | S2.3 |
| 19 | `spam-settings-default.svg` | `Playground/Proposed/Spam settings` `Default` | S6, S7, S8, S9.1, S9.2 |
| 20 | `spam-settings-preview.svg` | `Playground/Proposed/Spam settings` `Preview` | S6.3 |
| 21 | `spam-settings-invalid.svg` | `Playground/Proposed/Spam settings` `InvalidThresholds` | N1.6 |
| 22 | `spam-settings-save-failed.svg` | `Playground/Proposed/Spam settings` `SaveFailed` | S6.1 |
| 23 | `spam-settings-loading.svg` | `Playground/Proposed/Spam settings` `Loading` | supporting state |
| 24 | `spam-settings-nothing-checked.svg` | `Playground/Proposed/Spam settings` `NothingChecked` | S8.3 |
| 25 | `spam-settings-load-error.svg` | `Playground/Proposed/Spam settings` `LoadError` | N1.8 |
| 26 | `spam-settings-signed-out.svg` | `Playground/Proposed/Spam settings` `SignedOut` | N1.8 |
| 27 | `spam-label-list.svg` | `Playground/Proposed/Spam check again` `Selecting` | S9.3, S9.4 |
| 28 | `spam-check-again-running.svg` | `Playground/Proposed/Spam check again` `Running` | S10.1 |
| 29 | `spam-check-again-done.svg` | `Playground/Proposed/Spam check again` `Done` | S10.1, S10.2 |
| 30 | `spam-check-again-partial-failure.svg` | `Playground/Proposed/Spam check again` `PartialFailure` | N1.4, N1.5 |
| 31 | `spam-check-again-signed-out.svg` | `Playground/Proposed/Spam check again` `SignedOut` | N1.8 |
| 32 | `spam-label-list-empty.svg` | `Playground/Proposed/Spam check again` `Empty` | S9.2 |
| 33 | `spam-senders-never-in-spam.svg` | `Playground/Proposed/Spam senders` `NeverInSpam` | S5, S4.1 |
| 34 | `spam-check-again-message-menu.svg` | `Playground/Proposed/Spam check again` `MessageMenu` | S10.1 |

The PRD test plan names `ReadingOrder` for N2.2. That story reuses `WarnSpam` and adds a play step that reads the banner's accessible text before the body, so it has no wireframe of its own. State 23 (Loading) is a supporting state: no PRD criterion asks for it, and it shows what the page draws before data arrives.

## Shared rules

1. The message view has one banner slot, and the spam banner replaces `AuthenticityBanner` in it. RFC 041 deletes `authenticityVerdict`, so a DKIM mismatch reaches the reader as one of the judge's reasons: "It was signed by a different domain than its sender." The banner spans the reading pane between the message header and the body, with an icon, a bold headline, the top reason as one sentence, then the buttons. It renders through `Banner`, with `role="alert"` for phishing and `role="status"` for spam. A screen reader meets it before the body, because the DOM puts it there (N2.2). Its icon and headline carry the tone besides the colour.
2. Spam uses the warning tone. Phishing uses the danger tone, the tone today's authenticity warning uses.
3. The banner has no close control. It goes when its verdict goes: Not spam, Report spam, or a Check again that clears it.
4. Why opens the intelligence rail on the message. Between 1024 and 1280px it opens the same drawer the authenticity warning opens. The rail scrolls to the new Spam check section and outlines it once. Why writes no fragment (N3.2). Under url-state R6 the message itself raises the rail again on a cold load.
5. Spam check is a new `IntelligencePanel` section between Sender and Category. Today's Quick actions keep Not spam and Report spam.
6. Every list and count that fails on an expired session raises the existing `SignedOutOverlay`. The section behind it stays a skeleton and never shows an empty list or a zero (N1.8).
7. Every other load failure shows a danger banner in that section with the error, Retry and Report an issue. Other sections keep working.
8. Each reason name has one sentence. The banner's top reason, the rail and Latest flagged all print that sentence, from one map in `packages/ui`.
9. Every user-facing string calls the folder Spam, as in "Move to Spam from". `Junk` stays only in code names: the RFC action, the `\Junk` role and story exports such as `NowJunk`. The two labels keep their names, `Spam` and `Phishing`.

## Message view

### 1. Warn spam

- Enters: the reader opens a message with a `Checked` verdict, action `Warn`, kind `Spam`.
- Exits: Not spam removes the label and the banner, and the message keeps its folder (S3.1). Report spam moves it to Spam with the `Spam` label and blocks the sender (S4.1), and the reading pane follows the existing move behaviour. Why opens the rail (state 10). Opening another message leaves.
- Dismissal: none. Esc and a click outside do nothing to it.
- Focus: focus stays where the reader put it on open. Tab reaches Not spam, Report spam, Why in that order, each with the focus ring (N2.1). Not spam sends focus to the message header. After Why, focus moves to the rail's Spam check heading. Closing the rail returns focus to Why.
- URL: path `/mail/<list>/<threadId>/<messageId>`. The banner holds nothing in the URL.
- Error: state 7.

### 2. Warn phishing

As state 1, with the danger tone and the headline "Remit suspects this message impersonates someone" (S2.2). Links in the body stay live until PRD open question 3 is settled.

### 3. Model skipped

As state 1. The reason line names the cause of the skipped model call: the daily model limit, or no model set up for this account (N1.3). Both are one sentence, chosen from the reason the server names.

### 4. Check again reaches the junk threshold

- Enters: a Check again that returns action `Junk` for a message that stays in its folder (S10.2).
- Exits: Move to Spam moves the message and the banner goes. Not spam and Why act as in state 1.
- Focus: Tab order Move to Spam, Not spam, Why.
- URL: same as state 1.
- Error: when the move fails, it shows the existing "Couldn't move message" ErrorBanner with Try again.

### 5. Check failed

- Enters: a `Failed` verdict on the open message (N1.1).
- Exits: Check again sends this one id. The banner shows "Checking..." on the button, then the new verdict's banner, or none when the message is clean.
- Focus: Check again is the only stop. A clean result sends focus to the header.
- URL: path only.
- Error: when Check again fails, this banner stays and names the new failure. `RateLimited` adds "Try again in a minute". `DailyCap` adds "Try again tomorrow" and disables the button.

### 6. Pending

- Enters: a press on either mutating button.
- Exits: the request lands (state 1 exits), or it fails (state 7).
- Focus: stays on the pressed button, which is `aria-disabled` and `aria-busy`. Its label names the work: "Removing label...", "Moving...", or "Reporting...". The other mutating button disables too, as `IntelligencePanel` does for a second press.
- URL: as state 1.

### 7. Action failed

- Enters: either mutating button fails (N1.7).
- Shows: the existing `ErrorBanner` stack, "Couldn't report this message as spam" or "Couldn't mark this message as not spam", its error, and Try again. The warning banner stays.
- Dismissal: the ErrorBanner's close control and Esc. Try again repeats the request.
- Focus: returns to the button that failed.
- URL: nothing.

### 8. Phone

Full width on the screen, the banner keeps its three buttons in one row at 40px tall, and they fit a 360px screen without horizontal scroll (N3.3). Why opens the existing intelligence drawer. Focus and URL are as state 1.

### 9. Never in Spam offer

The strings and the slot are the ones #612 settled.

- Enters: Not spam on a message in Spam. The message returns to the Inbox without its label (S3.2), and the open message clears, so the reader lands beside the offer.
- Shows: the banner slot above the Spam list, the one `SpamRescue` owns. It holds one banner at a time: the offer first, otherwise the rescue banner. Copy: `Moved to Inbox. Should mail from Sender name (sender@example.com) stay out of Spam from now on?` with `Never put this sender in Spam` and `No thanks`. The sender's email is always on screen. A blocked sender, as after state 14, gets #612's blocked copy and its unblock button.
- Exits: accepting sets `neverSpam` and moves on to #612's older-mail step. `No thanks` hides the offer and stores nothing. The next Not spam replaces it.
- Dismissal: `No thanks`, or Esc with focus inside the offer. It never times out.
- Focus: moves to the accept button on entry, because the trigger was the reader's own press. Dismissal returns focus to the first row of the list.
- URL: nothing. The offer is a transient result of one press (R6).
- Error: the accept button reads "Saving..." with `aria-busy`. A failed write keeps the offer and shows the ErrorBanner "Couldn't save Never in Spam" with Try again.

## Why, in the intelligence rail

Each state renders the Spam check section. Entry is Why on the banner, or the reader opening the rail on a flagged message. Its close control and Esc close the rail and return focus to the control that opened it. Top to bottom, the section holds a headline, the label chip, the score sentence, the score bar, then Why with one sentence per reason. Each reason shows what the check found in a code chip (S1.1). The score sentence reads "Score 0.72. Remit warns from 0.40 and moves to Spam from 0.85." (S1.2). The bar repeats it for sighted readers and is `aria-hidden`. URL: path only, as state 1. The rail holds no state of its own beyond scroll.

### 10. Warn spam

Headline "Remit suspects this is spam", chips Spam and Suspected, score, reasons, and a model line when the model did not judge.

### 11. Phishing, moved to Spam

Headline "Remit moved this to Spam", Phishing chip only. Quick actions show Not spam.

### 12. Model judged

The model line reads "Remit asked the model. It said:" and quotes the model's reason as returned (S1.3).

### 13. Screened out

No score and no bar. The headline is "Remit skipped the spam check", then one sentence naming the stage 1 rule: VIP, known sender, Never in Spam, the filter by name, or a newsletter from a known sender (S1.4, S5.1). A filter name links to that filter in Settings, Filters. Never in Spam links to Senders & Rules. No banner exists on the message, so this state is reached only by opening the rail.

### 14. Reported sender

Headline "You reported this sender", the sentence "Remit sent their mail to Spam without checking it.", and Not spam in the section (S1.5). Not spam follows S3.2 and raises state 9.

### 15. Unknown reason

A reason name the app has no sentence for reads "Remit ran a check this version can't describe", shows the name in a code chip, and links to report an issue with the name prefilled (N1.2). The other reasons render as usual.

### 16. Warn only above the Spam threshold

This state covers a Spam label on Warn only, with a score at the Spam threshold or past it. The section adds "The score reached your Spam threshold. Spam is set to Warn only, so it stays here." and links to `/settings/spam` (S7.1).

## Thread rows

### 17. Warned

A warned row shows the label chip, then an outlined Suspected marker, after the category badge. A row carries one warning mark, so the shield after the subject goes: `dkimMismatch` drives it, and a mismatch is now a reason in the verdict. The row's accessible name ends "Spam, suspected" or "Phishing, suspected". The marker takes no focus and has no action. Rows open as today. URL: nothing new.

### 18. Moved

A row Remit moved to Spam shows the label chip alone (S2.3).

## The spam settings page

A new settings page, "Spam & phishing", at the path `/settings/spam` (N3.1). It sits after Mail classification in the settings nav and renders inside `SettingsShell`. The page holds five sections: Last 30 days, Latest flagged, Thresholds, Per label, and Senders. Every section loads and fails on its own. The URL holds the path alone. The threshold draft, the preview and the save state are in memory.

### 19. Default

- Last 30 days: one total line, then a Spam chart and a Phishing chart from a new `SpamDailyChart` component in `packages/ui`, one bar per day, stacked moved and warned. Dots under the Spam chart mark the messages the reader marked Not spam that day (S8.1, S8.2). Each bar has a text alternative: "2026-11-13: 4 moved, 2 warned, 1 marked Not spam".
- Latest flagged: the 10 latest warned or moved messages with sender, subject, date, label and action, and the top reason on a second line under the subject (S9.1). The reason is the rail's sentence (shared rule 8). A row opens the message under its label list, `/mail/label/<labelId>/<threadId>/<messageId>`. Review all in Spam and Open Phishing go to `/mail/label/<labelId>` (S9.2).
- Thresholds: Warn from and Move to Spam from, the deployment default named under them, Save thresholds and Reset to default (S6.1, S6.2). The note under the buttons says the values apply to mail arriving from now on, and that Check again updates older mail (S6.4).
- Per label: a segmented control per label, Warn only or Move to Spam (S7). A change saves at once and announces "Saved".
- Senders: Never in Spam and Reported, each with a one-line hint and Manage, which opens Senders & Rules on that group.
- Focus: on entry the page heading takes focus, as other settings pages do. Tab runs through the section links, the two inputs, Save, Reset, the two segmented controls and the two Manage links. Enter in an input saves (N2.3).

### 20. Preview

- Enters: editing either threshold.
- Shows: a line under the inputs, "With these values, Remit warns about N and moves M of the mail it checked in the last 30 days", next to the saved values' counts (S6.3). It recounts 400ms after the last keystroke.
- Exits: Save stores both values and announces "Saved". Reset restores the default and saves it. Leaving the page drops the draft.
- Focus: stays in the input being edited.
- Error: a failed preview count shows "Couldn't count the last 30 days" in place of the line, and saving still works.

### 21. Invalid thresholds

- Enters: Save with a Warn value at or past the Spam value, or a value outside 0 to 1 (N1.6).
- Shows: the broken field outlined, and the rule under it: "Warn from must be below Move to Spam from. Nothing was saved." or "Scores run from 0 to 1."
- Focus: moves to the first broken field. The message is linked with `aria-describedby`.
- Exits: editing the field clears the message.

### 22. Save failed

The existing classification `FailureBanner`, "The thresholds were not saved", its error and a retry button. The draft stays in the inputs. Focus lands on the retry button.

### 23. Loading

A supporting state with no PRD criterion. Skeletons for the charts and the latest list. Inputs and controls stay disabled until the saved values arrive. Nothing reads as zero.

### 24. Nothing checked

Last 30 days reads "Remit has not checked any mail yet" in place of a chart of zeros (S8.3). Latest flagged reads "Nothing flagged yet." The thresholds and label actions work.

### 25. Load error

A non-auth failure on the counts or the latest list shows the danger banner from shared rule 7 in that section. Retry refetches that section only. Report an issue opens the prefilled issue link.

### 26. Signed out

An expired session on any section raises the existing `SignedOutOverlay`, "You're signed out", with Sign in. Focus stays trapped on Sign in. Signing in returns to `/settings/spam`, and until then the sections behind stay skeletons (N1.8).

## Label lists and Check again

The Remit labels `Spam` and `Phishing` sit in the sidebar under Daily brief, like any label. Their lists live at `/mail/label/<labelId>`.

### 27. Selecting

- Enters: Select, a row checkbox, or the existing modifier select.
- Shows: the bulk action bar with "N selected", Not spam, Check again and Delete.
- Exits: Not spam treats each pick as S3.1 or S3.2 (S9.3). Delete moves the picks to Trash through the existing delete flow (S9.4). Check again starts state 28. Esc clears the picks.
- Focus: Tab from the list reaches the bar's buttons in order. Esc returns focus to the last focused row.
- URL: the path only. The picks live in memory (R6).
- Error: a failed Not spam or Delete uses the existing ErrorBanner, "Couldn't mark 3 messages as not spam", with Try again for the failed ids.

Check again sits in the bulk action bar of every list, and in the message action menu (state 34). One new `packages/ui` component, `CheckAgainPanel`, draws states 28 to 31 in every list.

### 28. Running

- Shows: a progress panel, "Checked 20 of 35", with a bar, the note that Remit sends ten at a time, and Stop. Each row shows its new verdict as a dashed tag as its batch lands: "Now: Spam 0.88", "Now: clean 0.12", "Unchanged 0.51" (S10.1).
- Exits: the last batch lands (state 29), Stop ends the run after the batch in flight, a failure (state 30), or the session expires (state 31).
- Dismissal: Esc presses Stop. The panel has no close control while it runs.
- Focus: moves to Stop. A polite live region reads the count.
- URL: nothing. Closing the page ends the run, which lives in memory.

### 29. Done

"Checked 35 of 35", then a summary: "6 changed: 2 now reach Spam, 4 are no longer suspected. Nothing moved." Done closes the panel and keeps the tags until the list reloads. Messages that now reach Spam carry the state 4 banner when opened. Focus moves to Done. Esc and Done put focus back on the bulk action bar.

### 30. Partial failure

The panel names each failed message by subject and cause (N1.4, N1.5). Rate-limited ones read "wait a minute". Ones past the daily cap read "wait until tomorrow". `NotFound` and `NotPermitted` name the cause, offer no retry, and link to report an issue. Try again for N sends only the retryable ids. The failed messages stay selected. Focus lands on Try again, or on Close when nothing is retryable.

### 31. Signed out

A 401 or 403 stops the run and raises `SignedOutOverlay`. The count already shown stays. No batch shows as failed or empty.

### 32. Empty

"No messages in Spam", the line "Remit adds this label to mail it suspects.", and a link to `/settings/spam`. The loading state is the existing `MessageListLoading` skeleton.

## The senders page

### 33. The never-in-spam group

A fourth group in Settings, Senders & Rules, beside VIPs, Muted and Blocked. Blocked shows "(reported)" because Report spam fills it. Each row has the sender, the date the flag was set, and Remove, which puts the sender back through the spam check from their next message. Search, focus and errors follow the existing Blocked group. The rows come from `searchAddresses` with a new optional flag filter, so the browser stops filtering on the flag. URL: the path `/settings/senders`; the group stays in memory as today.

## The message menu

### 34. Check again on one message

- Enters: the reader picks Check again from the menu on an open message.
- Shows: the banner slot shows "Checking...", then the new verdict: state 1, 2 or 4 for a suspect message, state 5 on failure, or no banner for a clean result.
- Dismissal: the menu closes on choice, on Esc and on a click outside, as today.
- Focus: returns to the menu's trigger. A new banner takes no focus.
- URL: nothing.
- Error: as state 5.

## Gaps in the current UI

1. Senders & Rules has no Never in Spam group. Today the page searches addresses and filters on the flag in the browser. State 33 needs an optional flag filter on `searchAddresses`, a small additive change.
2. The offer #612 specifies has no component. Ruled in scope: build `NeverInSpamOffer` (state 9).
3. No list has a Check again action. Ruled in scope: build `CheckAgainPanel` for every list and the message menu (states 27 to 31 and 34).
4. `packages/ui` has no bar chart. Ruled in scope: build `SpamDailyChart` (state 19).
5. `AuthenticityBanner` goes. The spam banner takes its slot, and the row's shield goes with it (shared rule 1, state 17).
6. The rows and the rail need the verdict, the score, the reasons and the stage 1 rule on the message and on the thread row (PRD RFC gaps 1, 3 and 4). PRD RFC gaps 9 and 10 block the preview and the latest list. These stay with the PRD's RFC gaps.

## FAQ

Why put the overview in Settings and leave the Daily brief alone? PRD N3.1 places it at `/settings/spam`. The Daily brief lists mail to act on, and the overview counts what Remit did.

Why no banner on mail in Spam? The PRD gives the banner to `Warn` only. The Spam folder and the label chip already say what happened, and the rail says why.

Why does Why not write `#intelligence`? Rule R6 in url-state keeps a rail raised for one message out of the URL. The authenticity banner's Why works the same way.
