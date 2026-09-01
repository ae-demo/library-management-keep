import ballerina/sql;
import ballerina/time;

type StatusRow record {|
    string bookId;
    string memberId;
    boolean read;
    int? rating;
    time:Utc updatedAt;
|};

function toMemberBookStatus(StatusRow row) returns MemberBookStatus => {
    bookId: row.bookId,
    memberId: row.memberId,
    read: row.read,
    rating: row.rating,
    updatedAt: time:utcToString(row.updatedAt)
};

function getMemberBookStatus(string bookId, string memberId) returns MemberBookStatus|error {
    StatusRow|sql:Error row = dbClient->queryRow(`
        SELECT member_id AS "memberId", book_id AS "bookId", read AS "read", rating, updated_at AS "updatedAt"
        FROM member_book_status
        WHERE book_id = ${bookId} AND member_id = ${memberId}
    `);
    if row is sql:NoRowsError {
        MemberBookStatus defaultStatus = {
            bookId: bookId,
            memberId: memberId,
            read: false,
            rating: ()
        };
        return defaultStatus;
    }
    if row is sql:Error {
        return row;
    }
    return toMemberBookStatus(row);
}

function upsertMemberBookStatus(string bookId, string memberId, MemberBookStatusUpdate payload) returns MemberBookStatus|error {
    MemberBookStatus current = check getMemberBookStatus(bookId, memberId);
    boolean? readUpdate = payload?.read;
    boolean newRead = readUpdate is boolean ? readUpdate : current.read;
    int? ratingUpdate = payload?.rating;
    int? currentRating = current?.rating;
    int? newRating = ratingUpdate is int ? ratingUpdate : currentRating;
    time:Utc updatedAt = time:utcNow();

    sql:ExecutionResult _ = check dbClient->execute(`
        INSERT INTO member_book_status (member_id, book_id, read, rating, updated_at)
        VALUES (${memberId}, ${bookId}, ${newRead}, ${newRating}, ${new sql:TimestampValue(updatedAt)})
        ON CONFLICT (member_id, book_id)
        DO UPDATE SET read = EXCLUDED.read, rating = EXCLUDED.rating, updated_at = EXCLUDED.updated_at
    `);

    MemberBookStatus updated = {
        bookId: bookId,
        memberId: memberId,
        read: newRead,
        rating: newRating,
        updatedAt: time:utcToString(updatedAt)
    };
    return updated;
}
