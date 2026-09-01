import ballerina/http;

listener http:Listener ep0 = new (9090);

service / on ep0 {
    # Search the external book database by title or ISBN
    #
    # + X\-User\-Id - caller identity injected by the gateway from the validated token
    # + q - title or ISBN to search for
    # + return - candidate matches, or an error response
    resource function get book\-lookup(@http:Header string? X\-User\-Id, string q) returns BookLookupResult[]|ErrorBadRequest|ErrorUnauthorized|error {
        string|ErrorUnauthorized callerId = requireUserId(X\-User\-Id);
        if callerId is ErrorUnauthorized {
            return callerId;
        }
        string trimmedQuery = q.trim();
        if trimmedQuery == "" {
            return badRequestError("q must not be empty");
        }
        return searchBookLookup(trimmedQuery);
    }

    # Browse/filter the shared catalog
    #
    # + X\-User\-Id - caller identity injected by the gateway from the validated token
    # + read - filter by the caller's own read status
    # + rating - filter by the caller's own rating
    # + return - a page of matching books, or an error response
    resource function get books(@http:Header string? X\-User\-Id, string? title, string? author, boolean? read, int? rating, int 'limit = 20, int offset = 0) returns BooksPage|ErrorUnauthorized|error {
        string|ErrorUnauthorized callerId = requireUserId(X\-User\-Id);
        if callerId is ErrorUnauthorized {
            return callerId;
        }
        int effectiveLimit = 'limit > 100 ? 100 : ('limit < 1 ? 20 : 'limit);
        int effectiveOffset = offset < 0 ? 0 : offset;

        [Book[], int] page = check listBooks(callerId, title, author, read, rating, effectiveLimit, effectiveOffset);
        Book[] books = page[0];
        int totalCount = page[1];

        string? next = ();
        if effectiveOffset + effectiveLimit < totalCount {
            next = buildBooksPageLink(effectiveLimit, effectiveOffset + effectiveLimit, title, author, read, rating);
        }
        string? previous = ();
        if effectiveOffset > 0 {
            int previousOffset = effectiveOffset - effectiveLimit;
            previous = buildBooksPageLink(effectiveLimit, previousOffset < 0 ? 0 : previousOffset, title, author, read, rating);
        }

        BooksPage result = {count: totalCount, next: next, previous: previous, data: books};
        return result;
    }

    # Add a book to the shared catalog (via lookup match or manual entry)
    #
    # + X\-User\-Id - caller identity injected by the gateway from the validated token
    # + return - the created book, or an error response
    resource function post books(@http:Header string? X\-User\-Id, @http:Payload NewBook payload) returns Book|ErrorBadRequest|ErrorUnauthorized|error {
        string|ErrorUnauthorized callerId = requireUserId(X\-User\-Id);
        if callerId is ErrorUnauthorized {
            return callerId;
        }
        if payload.title.trim() == "" || payload.author.trim() == "" {
            return badRequestError("title and author are required");
        }
        return insertBook(payload, callerId);
    }

    # Get one book, with aggregate rating and read count
    #
    # + bookId - book identifier
    # + X\-User\-Id - caller identity injected by the gateway from the validated token
    # + return - the book, or an error response
    resource function get books/[string bookId](@http:Header string? X\-User\-Id) returns Book|ErrorNotFound|ErrorUnauthorized|error {
        string|ErrorUnauthorized callerId = requireUserId(X\-User\-Id);
        if callerId is ErrorUnauthorized {
            return callerId;
        }
        Book? book = check getBookById(bookId);
        if book is () {
            return notFoundError("book not found");
        }
        return book;
    }

    # Remove a book from the shared catalog
    #
    # + bookId - book identifier
    # + X\-User\-Id - caller identity injected by the gateway from the validated token
    # + return - no content, or an error response
    resource function delete books/[string bookId](@http:Header string? X\-User\-Id) returns http:NoContent|ErrorNotFound|ErrorUnauthorized|error {
        string|ErrorUnauthorized callerId = requireUserId(X\-User\-Id);
        if callerId is ErrorUnauthorized {
            return callerId;
        }
        boolean deleted = check deleteBookById(bookId);
        if !deleted {
            return notFoundError("book not found");
        }
        return http:NO_CONTENT;
    }

    # Get the caller's own read status and rating for a book
    #
    # + bookId - book identifier
    # + X\-User\-Id - caller identity injected by the gateway from the validated token
    # + return - the caller's status for this book, or an error response
    resource function get books/[string bookId]/status(@http:Header string? X\-User\-Id) returns MemberBookStatus|ErrorNotFound|ErrorUnauthorized|error {
        string|ErrorUnauthorized callerId = requireUserId(X\-User\-Id);
        if callerId is ErrorUnauthorized {
            return callerId;
        }
        boolean exists = check bookExists(bookId);
        if !exists {
            return notFoundError("book not found");
        }
        return getMemberBookStatus(bookId, callerId);
    }

    # Set the caller's own read status and/or rating for a book
    #
    # + bookId - book identifier
    # + X\-User\-Id - caller identity injected by the gateway from the validated token
    # + return - the updated status, or an error response
    resource function put books/[string bookId]/status(@http:Header string? X\-User\-Id, @http:Payload MemberBookStatusUpdate payload) returns MemberBookStatus|ErrorBadRequest|ErrorNotFound|ErrorUnauthorized|error {
        string|ErrorUnauthorized callerId = requireUserId(X\-User\-Id);
        if callerId is ErrorUnauthorized {
            return callerId;
        }
        int? rating = payload?.rating;
        if rating is int && (rating < 1 || rating > 5) {
            return badRequestError("rating must be between 1 and 5");
        }
        boolean exists = check bookExists(bookId);
        if !exists {
            return notFoundError("book not found");
        }
        return upsertMemberBookStatus(bookId, callerId, payload);
    }
}
