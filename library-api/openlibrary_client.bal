import ballerina/http;
import ballerina/url;

// book-lookup (external, Open Library) — see specs/design/components/library-api/dependencies/book-lookup.openapi.yaml.
// Open Library's /isbn/{isbn}.json redirects (302) to the canonical /books/{id}.json
// edition record, so redirects must be followed or the lookup fails to bind.
final http:Client openLibraryClient = check new (resolvedOpenLibraryBaseUrl(), {
    followRedirects: {enabled: true, maxCount: 5}
});

type OpenLibrarySearchDoc record {
    string title?;
    string[] author_name?;
    string[] isbn?;
    int cover_i?;
};

type OpenLibrarySearchResponse record {
    int numFound?;
    OpenLibrarySearchDoc[] docs?;
};

type OpenLibraryAuthorRef record {
    string key?;
};

type OpenLibraryIsbnEdition record {
    string title?;
    OpenLibraryAuthorRef[] authors?;
    int[] covers?;
    string publish_date?;
};

function normalizeIsbn(string q) returns string {
    return re `[-\s]`.replaceAll(q, "");
}

function looksLikeIsbn(string q) returns boolean {
    string normalized = normalizeIsbn(q);
    if normalized.length() == 10 {
        return re `[0-9]{9}[0-9Xx]`.isFullMatch(normalized);
    }
    if normalized.length() == 13 {
        return re `[0-9]{13}`.isFullMatch(normalized);
    }
    return false;
}

function coverUrlForIsbn(string isbn) returns string => string `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

function authorLabelFromKey(string authorKey) returns string {
    int? lastSlash = authorKey.lastIndexOf("/");
    if lastSlash is int {
        return authorKey.substring(lastSlash + 1);
    }
    return authorKey;
}

function searchBookLookup(string q) returns BookLookupResult[]|error {
    if looksLikeIsbn(q) {
        return searchByIsbn(normalizeIsbn(q));
    }
    return searchByText(q);
}

function searchByIsbn(string isbn) returns BookLookupResult[]|error {
    OpenLibraryIsbnEdition|http:ClientError result = openLibraryClient->get(string `/isbn/${isbn}.json`);
    if result is http:ClientRequestError {
        int statusCode = result.detail().statusCode;
        if statusCode == 404 {
            return [];
        }
        return result;
    }
    if result is http:ClientError {
        return result;
    }
    OpenLibraryIsbnEdition edition = result;
    string? editionTitle = edition?.title;
    string title = editionTitle is string ? editionTitle : isbn;
    string author = "Unknown";
    OpenLibraryAuthorRef[]? authors = edition?.authors;
    if authors is OpenLibraryAuthorRef[] && authors.length() > 0 {
        string[] authorLabels = [];
        foreach OpenLibraryAuthorRef authorRef in authors {
            string? authorKey = authorRef?.key;
            if authorKey is string {
                authorLabels.push(authorLabelFromKey(authorKey));
            }
        }
        if authorLabels.length() > 0 {
            author = string:'join(", ", ...authorLabels);
        }
    }
    BookLookupResult lookupResult = {
        title: title,
        author: author,
        isbn: isbn,
        coverUrl: coverUrlForIsbn(isbn)
    };
    return [lookupResult];
}

function searchByText(string q) returns BookLookupResult[]|error {
    string encodedQuery = check url:encode(q, "UTF-8");
    OpenLibrarySearchResponse result = check openLibraryClient->get(string `/search.json?q=${encodedQuery}&limit=10`);
    OpenLibrarySearchDoc[]? docs = result?.docs;
    if docs is () {
        return [];
    }
    BookLookupResult[] results = [];
    foreach OpenLibrarySearchDoc doc in docs {
        string? title = doc?.title;
        if title is () {
            continue;
        }
        string[]? authorNames = doc?.author_name;
        string author = "Unknown";
        if authorNames is string[] && authorNames.length() > 0 {
            author = string:'join(", ", ...authorNames);
        }
        string[]? isbns = doc?.isbn;
        string? isbn = ();
        string? coverUrl = ();
        if isbns is string[] && isbns.length() > 0 {
            string firstIsbn = isbns[0];
            isbn = firstIsbn;
            coverUrl = coverUrlForIsbn(firstIsbn);
        }
        BookLookupResult lookupResult = {
            title: title,
            author: author,
            isbn: isbn,
            coverUrl: coverUrl
        };
        results.push(lookupResult);
    }
    return results;
}
