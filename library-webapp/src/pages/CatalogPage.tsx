import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as stylex from "@stylexjs/stylex";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Link } from "@astryxdesign/core/Link";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from "@astryxdesign/core/Table";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Banner } from "@astryxdesign/core/Banner";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { PageShell } from "../components/PageShell";
import {
  ApiError,
  getMyBookStatus,
  listBooks,
  type Book,
  type MemberBookStatus,
} from "../api";

const styles = stylex.create({
  clickableRow: {
    cursor: "pointer",
  },
});

type CatalogRow = Book & { myStatus?: MemberBookStatus };

const READ_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "read", label: "Read" },
  { value: "unread", label: "Unread" },
];

const RATING_OPTIONS = [
  { value: "all", label: "All ratings" },
  { value: "1", label: "1 star" },
  { value: "2", label: "2 stars" },
  { value: "3", label: "3 stars" },
  { value: "4", label: "4 stars" },
  { value: "5", label: "5 stars" },
];

async function fetchCatalog(
  search: string,
  readFilter: string,
  ratingFilter: string,
): Promise<CatalogRow[]> {
  const read =
    readFilter === "read" ? true : readFilter === "unread" ? false : undefined;
  const rating = ratingFilter === "all" ? undefined : Number(ratingFilter);

  const query = search.trim();
  const pages = query
    ? await Promise.all([
        listBooks({ title: query, read, rating, limit: 100 }),
        listBooks({ author: query, read, rating, limit: 100 }),
      ])
    : [await listBooks({ read, rating, limit: 100 })];

  const byId = new Map<string, Book>();
  for (const page of pages) {
    for (const book of page.data) byId.set(book.id, book);
  }
  const books = [...byId.values()];

  return Promise.all(
    books.map(async (book) => {
      try {
        const myStatus = await getMyBookStatus(book.id);
        return { ...book, myStatus };
      } catch {
        return { ...book };
      }
    }),
  );
}

function formatMyStatus(row: CatalogRow): string {
  if (!row.myStatus?.read) return "Unread";
  return row.myStatus.rating
    ? `Read, ${row.myStatus.rating} stars`
    : "Read";
}

export function CatalogPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [rows, setRows] = useState<CatalogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    const timeout = setTimeout(() => {
      fetchCatalog(search, readFilter, ratingFilter)
        .then((result) => {
          if (!cancelled) setRows(result);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setError(
            err instanceof ApiError ? err.body.message : "Failed to load the catalog.",
          );
          setRows([]);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, readFilter, ratingFilter]);

  return (
    <PageShell active="catalog">
      <VStack gap={4}>
        <HStack gap={3} wrap="wrap" hAlign="between" vAlign="center">
          <Heading level={1}>Shared Catalog</Heading>
          <HStack gap={2} wrap="wrap" vAlign="end">
            <TextInput
              label="Search by title or author"
              isLabelHidden
              placeholder="Search by title or author"
              value={search}
              onChange={setSearch}
              startIcon="search"
              hasClear
              width={260}
            />
            <Selector
              label="Read status"
              isLabelHidden
              options={READ_STATUS_OPTIONS}
              value={readFilter}
              onChange={(value) => setReadFilter(value ?? "all")}
              width={150}
            />
            <Selector
              label="My rating"
              isLabelHidden
              options={RATING_OPTIONS}
              value={ratingFilter}
              onChange={(value) => setRatingFilter(value ?? "all")}
              width={150}
            />
            <Button
              label="Add Book"
              variant="primary"
              href="/add-book/search"
            />
          </HStack>
        </HStack>

        {error && <Banner status="error" title="Couldn't load the catalog" description={error} />}

        {rows === null ? (
          <Spinner size="lg" label="Loading catalog…" />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No books match your filters"
            description="Try a different search, or add a new book to the catalog."
            actions={
              <Button label="Add Book" variant="primary" href="/add-book/search" />
            }
          />
        ) : (
          <Table hasHover dividers="rows">
            <TableHeader>
              <TableRow isHeaderRow>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Author</TableHeaderCell>
                <TableHeaderCell>Avg Rating</TableHeaderCell>
                <TableHeaderCell>Read Count</TableHeaderCell>
                <TableHeaderCell>My Status</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => navigate(`/books/${row.id}`)}
                  xstyle={[styles.clickableRow]}
                >
                  <TableCell>
                    <Link href={`/books/${row.id}`} isStandalone>
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell>{row.author}</TableCell>
                  <TableCell>
                    {row.averageRating != null ? row.averageRating.toFixed(1) : "—"}
                  </TableCell>
                  <TableCell>{row.readCount ?? 0}</TableCell>
                  <TableCell>
                    <Text type="inherit">{formatMyStatus(row)}</Text>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </VStack>
    </PageShell>
  );
}
