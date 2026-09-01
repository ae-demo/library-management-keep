import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Badge } from "@astryxdesign/core/Badge";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Switch } from "@astryxdesign/core/Switch";
import { Selector } from "@astryxdesign/core/Selector";
import { Button } from "@astryxdesign/core/Button";
import { Divider } from "@astryxdesign/core/Divider";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Banner } from "@astryxdesign/core/Banner";
import { PageShell } from "../components/PageShell";
import {
  ApiError,
  deleteBook,
  getBook,
  getMyBookStatus,
  updateMyBookStatus,
  type Book,
} from "../api";

const RATING_OPTIONS = [
  { value: "", label: "No rating" },
  { value: "1", label: "1 star" },
  { value: "2", label: "2 stars" },
  { value: "3", label: "3 stars" },
  { value: "4", label: "4 stars" },
  { value: "5", label: "5 stars" },
];

export function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [isRead, setIsRead] = useState(false);
  const [rating, setRating] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;
    Promise.all([getBook(bookId), getMyBookStatus(bookId)])
      .then(([bookData, status]) => {
        if (cancelled) return;
        setBook(bookData);
        setIsRead(status.read);
        setRating(status.rating ? String(status.rating) : "");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError ? err.body.message : "Failed to load this book.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  async function handleSave() {
    if (!bookId) return;
    setSaveError(null);
    setSaveMessage(null);
    try {
      await updateMyBookStatus(bookId, {
        read: isRead,
        rating: rating ? Number(rating) : null,
      });
      setSaveMessage("Saved.");
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.body.message : "Failed to save your status.",
      );
    }
  }

  async function handleRemove() {
    if (!bookId) return;
    await deleteBook(bookId);
    navigate("/");
  }

  if (loadError) {
    return (
      <PageShell active="catalog">
        <Banner status="error" title="Couldn't load this book" description={loadError} />
      </PageShell>
    );
  }

  if (!book) {
    return (
      <PageShell active="catalog">
        <Spinner size="lg" label="Loading book…" />
      </PageShell>
    );
  }

  return (
    <PageShell active="catalog">
      <VStack gap={5}>
        <Card>
          <HStack gap={4} align="start" wrap="wrap">
            <VStack width={120}>
              <AspectRatio ratio={120 / 160} fit="cover">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={`Cover of ${book.title}`} />
                ) : (
                  <VStack
                    width="100%"
                    height="100%"
                    hAlign="center"
                    vAlign="center"
                  >
                    <Text type="supporting">No cover</Text>
                  </VStack>
                )}
              </AspectRatio>
            </VStack>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>{book.title}</Heading>
                {book.averageRating != null && (
                  <Badge
                    variant="success"
                    label={`Avg ${book.averageRating.toFixed(1)} stars`}
                  />
                )}
              </HStack>
              <Text type="supporting">by {book.author}</Text>
              <Text type="supporting">Added via {book.source}</Text>
            </VStack>
          </HStack>
        </Card>

        <HStack gap={4} wrap="wrap">
          <Card>
            <VStack gap={1}>
              <Text type="label">Group stats</Text>
              <Heading level={2}>
                {book.averageRating != null ? book.averageRating.toFixed(1) : "—"}
              </Heading>
              <Text type="supporting">average rating across all members</Text>
            </VStack>
          </Card>
          <Card>
            <VStack gap={1}>
              <Text type="label">Read by</Text>
              <Heading level={2}>{book.readCount ?? 0}</Heading>
              <Text type="supporting">of the group</Text>
            </VStack>
          </Card>
        </HStack>

        <Divider />

        <VStack gap={3}>
          <Heading level={2}>My Status</Heading>
          {saveError && (
            <Banner status="error" title="Couldn't save your status" description={saveError} />
          )}
          <HStack gap={4} vAlign="end" wrap="wrap">
            <Switch label="Read" value={isRead} onChange={setIsRead} />
            <Selector
              label="My rating"
              options={RATING_OPTIONS}
              value={rating}
              onChange={(value) => setRating(value ?? "")}
              width={160}
            />
            <Button label="Save" variant="primary" clickAction={handleSave} />
            {saveMessage && <Text type="supporting">{saveMessage}</Text>}
          </HStack>
        </VStack>

        <Button
          label="Remove from catalog"
          variant="destructive"
          clickAction={handleRemove}
        />
      </VStack>
    </PageShell>
  );
}
