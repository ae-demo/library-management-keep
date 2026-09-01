import createClient, { type Middleware } from "openapi-fetch";
import type { components, paths } from "./generated/library-api";
import { getAccessToken, signIn } from "./auth";

// Same-origin: nginx proxies /api to the library-api sibling through the
// gateway, which validates the bearer token and injects the X-User-*
// identity headers library-api authorizes on. Never the gateway's public
// URL, never a window._env_ key.
export const libraryApi = createClient<paths>({ baseUrl: "/api" });

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      // Token expired/invalid beyond silent renewal — restart sign-in.
      await signIn();
    }
    return response;
  },
};

libraryApi.use(authMiddleware);

// openapi.yaml documents X-User-Id as the header library-api reads — the
// identity the GATEWAY injects from the validated token. The browser never
// asserts its own identity: nginx clears any X-User-* the client sets before
// proxying upstream (react-webapp's 15-aep-api-proxy.sh), so this value only
// satisfies openapi-fetch's generated (required) header type and never
// reaches library-api.
const GATEWAY_INJECTED_HEADER = { "X-User-Id": "" };

export type Book = components["schemas"]["Book"];
export type BookLookupResult = components["schemas"]["BookLookupResult"];
export type MemberBookStatus = components["schemas"]["MemberBookStatus"];
export type NewBook = components["schemas"]["NewBook"];
export type MemberBookStatusUpdate =
  components["schemas"]["MemberBookStatusUpdate"];
export type ApiErrorBody = components["schemas"]["Error"];

export class ApiError extends Error {
  readonly body: ApiErrorBody;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.body = body;
  }
}

export async function searchBookLookup(
  q: string,
): Promise<BookLookupResult[]> {
  const { data, error } = await libraryApi.GET("/book-lookup", {
    params: { query: { q }, header: GATEWAY_INJECTED_HEADER },
  });
  if (error) throw new ApiError(error);
  return data;
}

export type BookListFilters = {
  title?: string;
  author?: string;
  read?: boolean;
  rating?: number;
  limit?: number;
  offset?: number;
};

export type BookListPage = {
  count: number;
  data: Book[];
};

export async function listBooks(
  filters: BookListFilters = {},
): Promise<BookListPage> {
  const { data, error } = await libraryApi.GET("/books", {
    params: { query: filters, header: GATEWAY_INJECTED_HEADER },
  });
  if (error) throw new ApiError(error);
  return data;
}

export async function createBook(book: NewBook): Promise<Book> {
  const { data, error } = await libraryApi.POST("/books", {
    params: { header: GATEWAY_INJECTED_HEADER },
    body: book,
  });
  if (error) throw new ApiError(error);
  return data;
}

export async function getBook(bookId: string): Promise<Book> {
  const { data, error } = await libraryApi.GET("/books/{bookId}", {
    params: { path: { bookId }, header: GATEWAY_INJECTED_HEADER },
  });
  if (error) throw new ApiError(error);
  return data;
}

export async function deleteBook(bookId: string): Promise<void> {
  const { error } = await libraryApi.DELETE("/books/{bookId}", {
    params: { path: { bookId }, header: GATEWAY_INJECTED_HEADER },
  });
  if (error) throw new ApiError(error);
}

export async function getMyBookStatus(
  bookId: string,
): Promise<MemberBookStatus> {
  const { data, error } = await libraryApi.GET("/books/{bookId}/status", {
    params: { path: { bookId }, header: GATEWAY_INJECTED_HEADER },
  });
  if (error) throw new ApiError(error);
  return data;
}

export async function updateMyBookStatus(
  bookId: string,
  update: MemberBookStatusUpdate,
): Promise<MemberBookStatus> {
  const { data, error } = await libraryApi.PUT("/books/{bookId}/status", {
    params: { path: { bookId }, header: GATEWAY_INJECTED_HEADER },
    body: update,
  });
  if (error) throw new ApiError(error);
  return data;
}
