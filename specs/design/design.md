# Shared Library Catalog — Design

A shared-catalog reading tracker: any signed-in member can add a book — looked up by title or ISBN
against an external book database, with manual entry as a fallback — browse the full catalog, and
mark each book read/unread and rate it for themself. `library-webapp` is the SPA members use;
`library-api` owns the catalog and per-member state and is the only component that talks to the
book-lookup provider and the database.

## Context (C1)

```mermaid
graph TD
    member[Member]
    member --> webapp[Library Webapp]
    webapp --> api[Library API]
    api --> db[(Library Database)]
    api --> lookup[Book Lookup Provider]
    webapp --> auth[Thunder Auth]
    api --> auth
```

## Domain model (ER)

```mermaid
erDiagram
    BOOK {
        string id
        string title
        string author
        string isbn
        string coverUrl
        string addedByMemberId
        string source
        datetime createdAt
    }
    MEMBER_BOOK_STATUS {
        string memberId
        string bookId
        boolean read
        int rating
        datetime updatedAt
    }
    BOOK ||--o{ MEMBER_BOOK_STATUS : "tracked by"
```

`MEMBER_BOOK_STATUS` is keyed by `(memberId, bookId)` — one row per member per book, holding that
member's own read flag and 1–5 rating. A book's average rating and read count are computed by
aggregating this table, never stored redundantly.

## Key flows

### Add a book via lookup

```mermaid
sequenceDiagram
    participant M as Member
    participant W as Library Webapp
    participant A as Library API
    participant L as Book Lookup Provider
    participant D as Library Database
    M->>W: Search title/ISBN
    W->>A: GET /book-lookup?q=...
    A->>L: Query external catalog
    L-->>A: Candidate matches
    A-->>W: Candidate matches
    M->>W: Pick match (or choose manual entry)
    W->>A: POST /books
    A->>D: Insert book
    A-->>W: Created book
```

### Mark read and rate

```mermaid
sequenceDiagram
    participant M as Member
    participant W as Library Webapp
    participant A as Library API
    participant D as Library Database
    M->>W: Toggle read / set rating
    W->>A: PUT /books/{id}/status
    A->>D: Upsert member_book_status
    A-->>W: Updated status + aggregate rating
```

## Notes

- The book-lookup provider is a genuinely choosable third-party dependency (no requirement names a
vendor) — resolved as `candidates` on `library-api`'s design.json; see "Needs your input".
- Sign-in is via Thunder, shared by `library-webapp` and `library-api` under the same dependency name.

