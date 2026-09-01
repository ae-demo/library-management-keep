screen Catalog "Browse the shared catalog and jump to any book"
  navbar "Library | Catalog -> Catalog | Add Book -> AddBookSearch"
  row
    heading "Shared Catalog"
    right
      search "Search by title or author"
      select "All / Read / Unread"
      button "Add Book" primary -> AddBookSearch
  table "Title | Author | Avg Rating | Read Count | My Status" -> BookDetail
    row "Dune | Frank Herbert | 4.6 | 5 | Read, 5 stars"
    row "Project Hail Mary | Andy Weir | 4.8 | 4 | Unread"
    row "The Hobbit | J.R.R. Tolkien | 4.7 | 6 | Read, 4 stars"

screen BookDetail "One book's shared info and the caller's own status"
  navbar "Library | Catalog -> Catalog | Add Book -> AddBookSearch"
  card "Project Hail Mary"
    badge "Avg 4.8 stars" success
    text "by Andy Weir"
    image "Cover" 120x160
    text "Added by jordan · via lookup"
  row
    card "Group stats | 4.8 | average rating across 4 members"
    card "Read by | 4 | of the group"
  divider
  heading "My Status"
  row
    toggle "Read" active
    select "My rating: 5 stars"
    right
      button "Save" primary
  button "Remove from catalog" danger

screen AddBookSearch "Search the external book database by title or ISBN"
  navbar "Library | Catalog -> Catalog | Add Book -> AddBookSearch"
  heading "Add a Book"
  row
    search "Search by title or ISBN"
    button "Search" primary
  list "Dune, Frank Herbert | Project Hail Mary, Andy Weir | The Martian, Andy Weir" -> AddBookConfirm
  divider
  text "Can't find it?"
  button "Enter details manually" -> AddBookManual

screen AddBookConfirm "Confirm a matched book before adding it"
  navbar "Library | Catalog -> Catalog | Add Book -> AddBookSearch"
  heading "Confirm Book"
  card "Project Hail Mary"
    image "Cover" 120x160
    text "by Andy Weir"
    text "ISBN 9780593135204"
  row
    button "Back" -> AddBookSearch
    right
      button "Add to Catalog" primary -> Catalog

screen AddBookManual "Manually enter a book the lookup could not find"
  navbar "Library | Catalog -> Catalog | Add Book -> AddBookSearch"
  heading "Add Book Manually"
  input "Title"
  input "Author"
  input "ISBN (optional)"
  input "Cover URL (optional)"
  row
    button "Cancel" -> Catalog
    right
      button "Add to Catalog" primary -> Catalog

flow "Browse and track reading"
  role "Library Member"
  description "A member browses the shared catalog and updates their own read status and rating"
  Catalog
  BookDetail

flow "Add a book"
  role "Library Member"
  description "A member searches the book-lookup provider, confirms a match, or falls back to manual entry"
  AddBookSearch
  AddBookConfirm
  AddBookManual
