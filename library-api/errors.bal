function unauthorizedError(string description) returns ErrorUnauthorized => {
    body: {code: 401, message: "Unauthorized", description: description}
};

function badRequestError(string description) returns ErrorBadRequest => {
    body: {code: 400, message: "Bad Request", description: description}
};

function notFoundError(string description) returns ErrorNotFound => {
    body: {code: 404, message: "Not Found", description: description}
};

// Every protected resource calls this first: the gateway injects X-User-Id after
// validating the caller's token, so a missing/blank header means the caller
// reached this service without going through the gateway (or the gateway found
// no valid session) — reject with 401, never attempt our own token validation.
function requireUserId(string? userIdHeader) returns string|ErrorUnauthorized {
    if userIdHeader is string && userIdHeader.trim() != "" {
        return userIdHeader;
    }
    return unauthorizedError("X-User-Id header is required");
}
