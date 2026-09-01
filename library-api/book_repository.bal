import ballerina/sql;
import ballerina/time;
import ballerina/uuid;

type BookAggregateRow record {|
    string id;
    string title;
    string author;
    string? isbn;
    string? coverUrl;
    string 'source;
    string addedByMemberId;
    time:Utc createdAt;
    decimal? averageRating;
    int readCount;
|};

function toBookSource(string bookSource) returns "lookup"|"manual" => bookSource == "lookup" ? "lookup" : "manual";

function toBook(BookAggregateRow row) returns Book => {
    id: row.id,
    title: row.title,
    author: row.author,
    isbn: row.isbn,
    coverUrl: row.coverUrl,
    'source: toBookSource(row.'source),
    addedByMemberId: row.addedByMemberId,
    averageRating: row.averageRating,
    readCount: row.readCount,
    createdAt: time:utcToString(row.createdAt)
};

function insertBook(NewBook payload, string memberId) returns Book|error {
    string bookId = uuid:createRandomUuid();
    time:Utc createdAt = time:utcNow();
    string? isbn = payload?.isbn;
    string? coverUrl = payload?.coverUrl;
    string title = payload.title;
    string author = payload.author;
    "lookup"|"manual" bookSource = payload.'source;
    sql:ExecutionResult _ = check dbClient->execute(`
        INSERT INTO book (id, title, author, isbn, cover_url, source, added_by_member_id, created_at)
        VALUES (${bookId}, ${title}, ${author}, ${isbn}, ${coverUrl}, ${bookSource}, ${memberId}, ${new sql:TimestampValue(createdAt)})
    `);
    Book created = {
        id: bookId,
        title: title,
        author: author,
        isbn: isbn,
        coverUrl: coverUrl,
        'source: bookSource,
        addedByMemberId: memberId,
        averageRating: (),
        readCount: 0,
        createdAt: time:utcToString(createdAt)
    };
    return created;
}

function getBookById(string bookId) returns Book?|error {
    BookAggregateRow|sql:Error row = dbClient->queryRow(`
        SELECT b.id, b.title, b.author, b.isbn, b.cover_url AS "coverUrl", b.source AS "source",
               b.added_by_member_id AS "addedByMemberId", b.created_at AS "createdAt",
               AVG(m.rating) AS "averageRating",
               COUNT(*) FILTER (WHERE m.read = true) AS "readCount"
        FROM book b
        LEFT JOIN member_book_status m ON m.book_id = b.id
        WHERE b.id = ${bookId}
        GROUP BY b.id
    `);
    if row is sql:NoRowsError {
        return ();
    }
    if row is sql:Error {
        return row;
    }
    return toBook(row);
}

function bookExists(string bookId) returns boolean|error {
    int count = check dbClient->queryRow(`SELECT COUNT(*) FROM book WHERE id = ${bookId}`);
    return count > 0;
}

function deleteBookById(string bookId) returns boolean|error {
    sql:ExecutionResult result = check dbClient->execute(`DELETE FROM book WHERE id = ${bookId}`);
    int? affectedRowCount = result.affectedRowCount;
    return affectedRowCount is int && affectedRowCount > 0;
}

function listBooks(string callerId, string? title, string? author, boolean? read, int? rating, int pageLimit, int pageOffset) returns [Book[], int]|error {
    sql:ParameterizedQuery filterClause = ``;
    if title is string {
        string titlePattern = "%" + title + "%";
        filterClause = sql:queryConcat(filterClause, ` AND b.title ILIKE ${titlePattern}`);
    }
    if author is string {
        string authorPattern = "%" + author + "%";
        filterClause = sql:queryConcat(filterClause, ` AND b.author ILIKE ${authorPattern}`);
    }
    if read is boolean {
        filterClause = sql:queryConcat(filterClause, ` AND EXISTS (SELECT 1 FROM member_book_status crf WHERE crf.book_id = b.id AND crf.member_id = ${callerId} AND crf.read = ${read})`);
    }
    if rating is int {
        filterClause = sql:queryConcat(filterClause, ` AND EXISTS (SELECT 1 FROM member_book_status crt WHERE crt.book_id = b.id AND crt.member_id = ${callerId} AND crt.rating = ${rating})`);
    }

    sql:ParameterizedQuery countQuery = sql:queryConcat(`SELECT COUNT(*) FROM book b WHERE 1 = 1`, filterClause);
    int totalCount = check dbClient->queryRow(countQuery);

    sql:ParameterizedQuery selectQuery = sql:queryConcat(`
        SELECT b.id, b.title, b.author, b.isbn, b.cover_url AS "coverUrl", b.source AS "source",
               b.added_by_member_id AS "addedByMemberId", b.created_at AS "createdAt",
               agg.avg_rating AS "averageRating", COALESCE(agg.read_count, 0) AS "readCount"
        FROM book b
        LEFT JOIN (
            SELECT book_id, AVG(rating) AS avg_rating, COUNT(*) FILTER (WHERE read = true) AS read_count
            FROM member_book_status
            GROUP BY book_id
        ) agg ON agg.book_id = b.id
        WHERE 1 = 1`, filterClause, ` ORDER BY b.created_at DESC LIMIT ${pageLimit} OFFSET ${pageOffset}`);

    stream<BookAggregateRow, sql:Error?> resultStream = dbClient->query(selectQuery);
    Book[] books = [];
    check from BookAggregateRow row in resultStream
        do {
            books.push(toBook(row));
        };
    check resultStream.close();
    return [books, totalCount];
}
