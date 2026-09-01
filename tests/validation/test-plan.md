# Validation test plan — library-management-keep v1

Targets: `library-webapp` (primary, UI) and `library-api` (API, request fixture).
Auth: Thunder OIDC (authorization-code + PKCE) via the webapp's own sign-in
redirect. No ROPC/password grant is exposed by Thunder
(`/.well-known/openid-configuration` lists only `authorization_code`,
`client_credentials`, `refresh_token`, `token-exchange`), so every
authenticated spec drives the real browser login through
`tests/e2e/lib/auth.ts#login()`, which fills the Thunder "Sign In" form with
`AEP_E2E_USERNAME` / `AEP_E2E_PASSWORD` and waits for the "Shared Catalog"
heading.

**Only one test account is provisioned** for this project's single role
("Library Member" — `test-library-member`, cold start). Criteria that
inherently require two distinct signed-in members to observe a difference
(AC-004-b) cannot be exercised with a real second identity in this run; see
that section for how it is reported.

**Live-app finding that shapes every spec below:** the deployed webapp emits
its `env-config.js` (and other static-asset) script tags with a **relative**
`src`, so a hard navigation or reload to any nested route (e.g.
`/books/{id}`, `/add-book/search`) resolves the request against the current
path (e.g. `/books/env-config.js`) instead of the site root, gets the SPA's
`index.html` back instead of JavaScript, and fails to boot
(`window._env_ not set`). Reproduced consistently via `curl` and
`playwright-cli`. No acceptance criterion covers deep-linking directly, so
this is not scored against any AC, but it means every spec below reaches
non-root routes only by **clicking through the UI**, never
`page.goto()`/`page.reload()` to a nested path.

## AC-001-a — An unauthenticated visitor is directed to sign in before reaching the catalog

- Target: library-webapp (primary)
- Steps:
  1. Navigate to `/` with no session.
  2. Observe the redirect.
- Assert: the page lands on Thunder's sign-in screen (heading "Sign In"
  visible) rather than the catalog.
- Source of truth: live redirect observed via playwright-cli
  (`/` → `https://thunder.../gate/signin`).

## AC-001-b — After signing in, the member reaches the catalog as themself

- Target: library-webapp (primary)
- Steps:
  1. Navigate to `/`, fill Thunder's Username/Password with the test
     account, submit.
  2. Observe the post-login landing page.
- Assert: the "Shared Catalog" heading is visible, and the catalog's
  member-scoped "My rating" filter is present (proving a personalized,
  signed-in session rather than a generic/anonymous view).
- Source of truth: live login flow via playwright-cli.

## AC-002-a — Searching by title returns candidate matches from the book database

- Target: library-webapp (primary)
- Steps:
  1. Log in, open Add Book (nav link), search "Dune".
- Assert: the Matches list contains an entry titled "Dune" by "Frank
  Herbert".
- Source of truth: live search via playwright-cli (Open Library-backed
  lookup, confirmed working).

## AC-002-b — Searching by ISBN returns candidate matches from the book database

- Target: library-webapp (primary)
- Steps:
  1. Log in, open Add Book, search a known-valid ISBN
     (`9780441013593`, Dune).
- Assert: the Matches list contains at least one candidate.
- Source of truth: live search via playwright-cli AND direct `curl` against
  `library-api`'s `/book-lookup?q=<isbn>` — **both reproduce a 500** ("No
  content"); `library-api` does not handle Open Library's ISBN-lookup
  redirect. This is authored to the criterion and is expected to **fail
  genuinely** — not healed (see healing.md: app error → genuine).

## AC-002-c — Selecting a candidate match adds a book to the shared catalog with its looked-up details populated

- Target: library-webapp (primary)
- Steps:
  1. Log in, search "Dune", select the "Dune" / "Frank Herbert" match,
     confirm, "Add to Catalog".
  2. From the catalog, open the row matching that title/author.
- Assert: the book detail page shows title "Dune", "by Frank Herbert", and
  "Added via lookup" (proving looked-up fields were populated, not left for
  manual entry).
- Source of truth: live flow via playwright-cli.

## AC-003-a — The catalog view lists every book any member has added

- Target: library-webapp (primary)
- Steps:
  1. Log in, add two distinct manually-entered books with unique
     run-marked titles.
  2. Return to the catalog root.
- Assert: both run-marked titles are listed in the shared catalog table
  (proving the catalog is not scoped to a single add-event but aggregates
  everything added).
- Source of truth: live flow via playwright-cli. (Only one real member
  account is available this run — see plan header — so this proves the
  catalog is shared/aggregate across additions, not literally across
  multiple distinct members.)

## AC-004-a — Marking a book read updates that member's own read status on the book

- Target: library-webapp (primary)
- Steps:
  1. Log in, add a unique manual book, open its detail page.
  2. Toggle the "Read" switch on, Save.
  3. Navigate back to the catalog (nav link) and back into the book (link
     click, never reload) to confirm persistence.
- Assert: the "Read" switch is checked on return, and the catalog row's "My
  Status" cell shows "Read".
- Source of truth: live flow via playwright-cli.

## AC-004-b — One member's read status does not change another member's read status on the same book

- **Not run.** This criterion requires two distinct signed-in member
  identities observing independent state on the same book. Only one test
  account (`test-library-member`) is provisioned for this project's single
  role, and `library-api` only ever sees the identity the gateway injects
  from a validated token — there is no way to simulate a second member
  without a second real login, and per the validation workflow's own rule,
  a login must never be improvised. Lands `not_run` in the report; this is
  a coverage gap from single-account provisioning, not an app defect.

## AC-005-a — A member can set a rating between 1 and 5 stars on a book

- Target: library-webapp (primary)
- Steps:
  1. Log in, add a unique manual book, open its detail page.
  2. Select "4 stars" in "My rating", Save.
  3. Navigate away and back (link clicks) to confirm persistence.
- Assert: "My rating" shows "4 stars" after return.
- Source of truth: live flow via playwright-cli.

## AC-005-b — A rating outside the 1-5 range is rejected

- Target: library-api (via request fixture, using the token the browser
  session holds)
- Steps:
  1. Log in via the browser, extract the access token from
     `localStorage` (`oidc.user:...`).
  2. `PUT /books/{id}/status` with `rating: 6` and separately `rating: 0`.
- Assert: both responses are `400`.
- Source of truth: confirmed live via `curl` with a real bearer token (both
  return `400` "rating must be between 1 and 5").

## AC-006-a — A book's displayed average rating reflects all members' ratings for that book

- Target: library-webapp (primary)
- Steps:
  1. Log in, add a unique manual book, rate it "4 stars", Save.
  2. Return to the catalog root.
- Assert: the catalog row's "Avg Rating" cell reads "4.0", and the book
  detail page's "Group stats" heading reads "4.0".
- Source of truth: live flow via playwright-cli. (Single-account run: this
  proves the aggregate reflects the caller's own rating; see plan header.)

## AC-006-b — A book's displayed read count reflects the number of members who marked it read

- Target: library-webapp (primary)
- Steps:
  1. Log in, add a unique manual book, toggle "Read" on, Save.
  2. Return to the catalog root.
- Assert: the catalog row's "Read Count" cell reads "1", and the detail
  page's "Read by" heading reads "1".
- Source of truth: live flow via playwright-cli.

## AC-007-a — Filtering by title or author narrows the catalog to matching books

- Target: library-webapp (primary)
- Steps:
  1. Log in, add a unique manual book (run-marked title).
  2. On the catalog root, type the run-marked title into "Search by title
     or author".
- Assert: the table contains only rows matching the run-marked title.
- Source of truth: live flow via playwright-cli.

## AC-007-b — Filtering by the caller's own read status narrows the catalog to books matching that status

- Target: library-webapp (primary)
- Steps:
  1. Log in, add a unique manual book, mark it Read, Save.
  2. On the catalog root, filter by the run-marked title, then set "Read
     status" to "Unread".
- Assert: with the title filter still applied, the read book is no longer
  listed ("No books match your filters").
- Source of truth: live flow via playwright-cli.

## AC-007-c — Filtering by the caller's own rating narrows the catalog to books matching that rating

- Target: library-webapp (primary)
- Steps:
  1. Log in, add a unique manual book, rate it "5 stars", Save.
  2. On the catalog root, filter by the run-marked title, then set "My
     rating" to "4 stars" (a non-matching rating).
- Assert: with the title filter still applied, the book is no longer
  listed.
- Source of truth: live flow via playwright-cli.

## AC-008-a — Removing a book takes it out of the shared catalog for every member

- Target: library-webapp (primary)
- Steps:
  1. Log in, add a unique manual book.
  2. Open its detail page, click "Remove from catalog".
- Assert: back on the catalog root, the run-marked title is no longer
  present.
- Source of truth: live flow via playwright-cli.

## AC-009-a — When a lookup search returns no matches, the member is offered a manual-entry path

- Target: library-webapp (primary)
- Steps:
  1. Log in, open Add Book, search a run-marked nonsense title guaranteed
     to have zero Open Library matches.
- Assert: "No matches found" is shown and "Enter details manually" is
  visible/actionable.
- Source of truth: live flow via playwright-cli.

## AC-009-b — Submitting manually entered title and author adds the book to the shared catalog

- Target: library-webapp (primary)
- Steps:
  1. Log in, open Add Book → Enter details manually, fill a unique
     run-marked title + author, submit.
- Assert: the catalog root lists the run-marked title/author.
- Source of truth: live flow via playwright-cli (confirmed working).
