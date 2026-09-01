# library-management-keep — PRD

## Problem Statement

Book lovers who share a collection — a household, a book club, a small team — have no easy shared way to track what books they own, which ones each person has actually read, and what they thought of them. Today this lives in spreadsheets, sticky notes, or memory, so the same book gets bought twice, nobody remembers if a copy was ever finished, and opinions on it are never captured anywhere the group can see.

## Solution

A shared library catalog that any signed-in member can add books to — by looking them up via title or ISBN instead of typing details by hand — and where each member tracks, for every book in the catalog, whether they personally have read it and what rating they'd give it.

## Actors

- **Member**: a signed-in user of the shared library. Can search for and add books to the shared catalog, browse the full catalog, and mark books as read/unread and rate them for themself. Every member has equal standing — there is no separate administrator role.

## User Stories

1. As a member, I want to sign in securely, so that my catalog activity is tied to my account.
2. As a member, I want to search for a book by title or ISBN and add it to the shared catalog, so that I don't have to type in book details by hand.
3. As a member, I want to browse the full shared catalog, so that I can see every book the group has added.
4. As a member, I want to mark a book as read or unread for myself, so that I can track my own reading progress independent of other members.
5. As a member, I want to rate a book I've read on a simple scale, so that I can record my opinion of it.
6. As a member, I want to see each book's average rating and how many members have read it, so that I can gauge the group's opinion at a glance.
7. As a member, I want to filter or search the catalog by title, author, my read status, or my rating, so that I can quickly find a specific book or decide what to read next.
8. As a member, I want to remove a book I added by mistake from the shared catalog, so that the catalog stays accurate.

## Product Decisions

- Sign-in is via SSO through Thunder, the platform identity provider (organization default).
- The catalog is shared: every member sees the same list of books. Read status and rating are personal to each member — the same book can be "read, 5 stars" for one member and "unread" for another. *assumed*
- Any member can add or remove books from the shared catalog; there is no separate admin/librarian role. *assumed*
- New books are added via lookup against an external book database (by title or ISBN) rather than manual entry, per the user's decision. The specific provider is chosen at design time.
- Rating scale is a 1–5 star rating. *assumed*

## Out of Scope

- Physical copy/inventory tracking (number of copies, loaning books out, due dates).
- Manual entry of book details when a lookup finds no match.
- Social features beyond aggregate rating (comments, reviews, discussion threads).
- Reading progress tracking below whole-book granularity (e.g., page/chapter progress, reading lists/queues).

## Open Questions

1. When a title/ISBN lookup finds no match, should the member be blocked from adding the book, or is manual fallback entry needed? Currently out of scope, but worth confirming.

## Further Notes

None.