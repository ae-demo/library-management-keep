import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Button } from "@astryxdesign/core/Button";
import { List, ListItem } from "@astryxdesign/core/List";
import { Divider } from "@astryxdesign/core/Divider";
import { Banner } from "@astryxdesign/core/Banner";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { PageShell } from "../components/PageShell";
import { ApiError, searchBookLookup, type BookLookupResult } from "../api";
import type { AddBookConfirmState } from "./AddBookConfirmPage";

export function AddBookSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookLookupResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setIsSearching(true);
    setError(null);
    try {
      const matches = await searchBookLookup(q);
      setResults(matches);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.body.message : "Search failed. Try again.",
      );
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handlePickMatch(match: BookLookupResult) {
    const state: AddBookConfirmState = { match };
    navigate("/add-book/confirm", { state });
  }

  return (
    <PageShell active="add-book">
      <VStack gap={4}>
        <Heading level={1}>Add a Book</Heading>

        <HStack gap={2} vAlign="end" wrap="wrap">
          <TextInput
            label="Search by title or ISBN"
            placeholder="Search by title or ISBN"
            value={query}
            onChange={setQuery}
            onEnter={handleSearch}
            startIcon="search"
            width={320}
          />
          <Button
            label="Search"
            variant="primary"
            clickAction={handleSearch}
            isLoading={isSearching}
          />
        </HStack>

        {error && <Banner status="error" title="Search failed" description={error} />}

        {results !== null &&
          (results.length === 0 ? (
            <EmptyState
              title="No matches found"
              description="Enter the book's details manually instead."
              isCompact
            />
          ) : (
            <List header={<Text type="label">Matches</Text>} hasDividers>
              {results.map((match) => (
                <ListItem
                  key={`${match.title}-${match.isbn ?? match.author}`}
                  label={match.title}
                  description={match.author}
                  onClick={() => handlePickMatch(match)}
                />
              ))}
            </List>
          ))}

        <Divider />

        <Text>Can't find it?</Text>
        <Button label="Enter details manually" href="/add-book/manual" />
      </VStack>
    </PageShell>
  );
}
