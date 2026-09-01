import ballerina/sql;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

final postgresql:Client dbClient = check new (
    host = resolvedDbHost(),
    username = resolvedDbUser(),
    password = resolvedDbPassword(),
    database = resolvedDbName(),
    port = resolvedDbPort()
);

final () dbSchemaReady = check initSchema();

function initSchema() returns error? {
    sql:ExecutionResult _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS book (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            isbn TEXT,
            cover_url TEXT,
            source TEXT NOT NULL,
            added_by_member_id TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL
        )
    `);
    sql:ExecutionResult _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS member_book_status (
            member_id TEXT NOT NULL,
            book_id TEXT NOT NULL REFERENCES book(id) ON DELETE CASCADE,
            read BOOLEAN NOT NULL DEFAULT FALSE,
            rating INT,
            updated_at TIMESTAMPTZ NOT NULL,
            PRIMARY KEY (member_id, book_id)
        )
    `);
}
