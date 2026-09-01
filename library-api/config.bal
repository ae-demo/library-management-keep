import ballerina/os;

// library-db (postgres-cnpg platform-resource) — envBindings from workload.yaml.
configurable string libraryDbHost = os:getEnv("LIBRARY_DB_HOST");
configurable string libraryDbPort = os:getEnv("LIBRARY_DB_PORT");
configurable string libraryDbUser = os:getEnv("LIBRARY_DB_USER");
configurable string libraryDbPassword = os:getEnv("LIBRARY_DB_PASSWORD");
configurable string libraryDbName = os:getEnv("LIBRARY_DB_DBNAME");

// book-lookup (external, Open Library) — envBindings from workload.yaml.
configurable string openLibraryBaseUrl = os:getEnv("OPENLIBRARY_BASE_URL");

// Sensible localhost-ish fallbacks so the service starts with no env vars set.
// Real values are injected by the platform at deploy time; until then these
// defaults let the module load without a required environment variable.
function resolvedDbHost() returns string => libraryDbHost != "" ? libraryDbHost : "localhost";

function resolvedDbPort() returns int {
    if libraryDbPort == "" {
        return 5432;
    }
    int|error port = int:fromString(libraryDbPort);
    if port is int {
        return port;
    }
    return 5432;
}

function resolvedDbUser() returns string => libraryDbUser != "" ? libraryDbUser : "postgres";

function resolvedDbPassword() returns string => libraryDbPassword != "" ? libraryDbPassword : "postgres";

function resolvedDbName() returns string => libraryDbName != "" ? libraryDbName : "library";

function resolvedOpenLibraryBaseUrl() returns string {
    string baseUrl = openLibraryBaseUrl != "" ? openLibraryBaseUrl : "https://openlibrary.org";
    if baseUrl.endsWith("/") {
        return baseUrl.substring(0, baseUrl.length() - 1);
    }
    return baseUrl;
}
