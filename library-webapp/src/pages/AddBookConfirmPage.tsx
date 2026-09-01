import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Button } from "@astryxdesign/core/Button";
import { Banner } from "@astryxdesign/core/Banner";
import { PageShell } from "../components/PageShell";
import { ApiError, createBook, type BookLookupResult } from "../api";

export type AddBookConfirmState = { match: BookLookupResult };

export function AddBookConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as AddBookConfirmState | null;
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // The match arrives as route state from AddBookSearch (per wireframes.dsl:
  // AddBookSearch's list -> AddBookConfirm carries the picked match). A
  // direct hit on this route with no state has nothing to confirm.
  if (!state) {
    return (
      <PageShell active="add-book">
        <VStack gap={4}>
          <Heading level={1}>Confirm Book</Heading>
          <Banner
            status="warning"
            title="No book selected"
            description="Go back and pick a match from your search results."
          />
          <Button label="Back to search" href="/add-book/search" />
        </VStack>
      </PageShell>
    );
  }

  const { match } = state;

  async function handleAdd() {
    setError(null);
    setIsSaving(true);
    try {
      await createBook({
        title: match.title,
        author: match.author,
        isbn: match.isbn ?? null,
        coverUrl: match.coverUrl ?? null,
        source: "lookup",
      });
      navigate("/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.body.message : "Failed to add this book.",
      );
      setIsSaving(false);
    }
  }

  return (
    <PageShell active="add-book">
      <VStack gap={4}>
        <Heading level={1}>Confirm Book</Heading>

        {error && <Banner status="error" title="Couldn't add this book" description={error} />}

        <Card>
          <HStack gap={4} align="start" wrap="wrap">
            <VStack width={120}>
              <AspectRatio ratio={120 / 160} fit="cover">
                {match.coverUrl ? (
                  <img src={match.coverUrl} alt={`Cover of ${match.title}`} />
                ) : (
                  <VStack width="100%" height="100%" hAlign="center" vAlign="center">
                    <Text type="supporting">No cover</Text>
                  </VStack>
                )}
              </AspectRatio>
            </VStack>
            <VStack gap={2}>
              <Heading level={2}>{match.title}</Heading>
              <Text type="supporting">by {match.author}</Text>
              {match.isbn && <Text type="supporting">ISBN {match.isbn}</Text>}
            </VStack>
          </HStack>
        </Card>

        <HStack gap={2} hAlign="between">
          <Button label="Back" href="/add-book/search" />
          <Button
            label="Add to Catalog"
            variant="primary"
            clickAction={handleAdd}
            isLoading={isSaving}
          />
        </HStack>
      </VStack>
    </PageShell>
  );
}
