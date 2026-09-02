# Validation report

- **Issue:** #7
- **Commit:** 4bd217be8235dac62cc7ccfba512ec0323d1c9fc
- **Generated:** 2026-09-02T15:04:52.174Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 18 | 16 | 1 | 1 |
| manual (human checklist) | 0 | — | — | — |
| scenario (not validated) | 0 | — | — | — |

## E2E results

| Criterion | Must | Status | Spec | Notes |
|---|---|---|---|---|
| AC-001-a | An unauthenticated visitor is directed to sign in before reaching the catalog | ✅ pass | `tests/e2e/specs/AC-001-a.spec.ts` | healed ×1 |
| AC-001-b | After signing in, the member reaches the catalog as themself | ✅ pass | `tests/e2e/specs/AC-001-b.spec.ts` | healed ×2 |
| AC-002-a | Searching by title returns candidate matches from the book database | ✅ pass | `tests/e2e/specs/AC-002-a.spec.ts` | — |
| AC-002-b | Searching by ISBN returns candidate matches from the book database | ❌ fail | `tests/e2e/specs/AC-002-b.spec.ts` | — |
| AC-002-c | Selecting a candidate match adds a book to the shared catalog with its looked-up details populated | ✅ pass | `tests/e2e/specs/AC-002-c.spec.ts` | — |
| AC-003-a | The catalog view lists every book any member has added | ✅ pass | `tests/e2e/specs/AC-003-a.spec.ts` | — |
| AC-004-a | Marking a book read updates that member's own read status on the book | ✅ pass | `tests/e2e/specs/AC-004-a.spec.ts` | — |
| AC-004-b | One member's read status on a book does not change another member's read status on the same book | ⏭️ not_run | — | — |
| AC-005-a | A member can set a rating between 1 and 5 stars on a book | ✅ pass | `tests/e2e/specs/AC-005-a.spec.ts` | — |
| AC-005-b | A rating outside the 1-5 range is rejected | ✅ pass | `tests/e2e/specs/AC-005-b.spec.ts` | — |
| AC-006-a | A book's displayed average rating reflects all members' ratings for that book | ✅ pass | `tests/e2e/specs/AC-006-a.spec.ts` | — |
| AC-006-b | A book's displayed read count reflects the number of members who marked it read | ✅ pass | `tests/e2e/specs/AC-006-b.spec.ts` | — |
| AC-007-a | Filtering by title or author narrows the catalog to matching books | ✅ pass | `tests/e2e/specs/AC-007-a.spec.ts` | — |
| AC-007-b | Filtering by the caller's own read status narrows the catalog to books matching that status | ✅ pass | `tests/e2e/specs/AC-007-b.spec.ts` | — |
| AC-007-c | Filtering by the caller's own rating narrows the catalog to books matching that rating | ✅ pass | `tests/e2e/specs/AC-007-c.spec.ts` | — |
| AC-008-a | Removing a book takes it out of the shared catalog for every member | ✅ pass | `tests/e2e/specs/AC-008-a.spec.ts` | — |
| AC-009-a | When a lookup search returns no matches, the member is offered a manual-entry path | ✅ pass | `tests/e2e/specs/AC-009-a.spec.ts` | — |
| AC-009-b | Submitting manually entered title and author adds the book to the shared catalog | ✅ pass | `tests/e2e/specs/AC-009-b.spec.ts` | — |

## Failures

### AC-002-b — Searching by ISBN returns candidate matches from the book database

Spec: `tests/e2e/specs/AC-002-b.spec.ts`
Location: `AC-002-b.spec.ts:5`

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('list', { name: 'Matches' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('list', { name: 'Matches' })

```

## Healing log

| Criterion | Classification | Change | Commit |
|---|---|---|---|
| AC-001-a | timing | expect(getByRole('heading', {name: 'Sign In'})).toBeVisible({timeout: 15000}) -> {timeout: 25000}; the pre-signin silent-auth check (prompt=none) was re-observed at 12-16s live, occasionally exceeding the prior 15s budget | `879b7993` |
| AC-001-b | timing | lib/auth.ts login(): added test.setTimeout(45000) and an explicit waitFor({timeout: 25000}) on the Username textbox before filling, to absorb the same 12-16s+ silent-auth/redirect latency observed for AC-001-a, which was intermittently exceeding the default 30s test timeout | `879b7993` |
| AC-001-b | timing | lib/auth.ts login(): further widened test.setTimeout(45000->60000) and the Username waitFor timeout (25000->40000) after an outlier auth latency (>25s) was observed transiently affecting other regression specs during this run | `9ed10316` |

