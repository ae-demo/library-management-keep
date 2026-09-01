import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Heading } from "@astryxdesign/core/Heading";
import { TextInput } from "@astryxdesign/core/TextInput";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { Button } from "@astryxdesign/core/Button";
import { Banner } from "@astryxdesign/core/Banner";
import { PageShell } from "../components/PageShell";
import { ApiError, createBook } from "../api";

export function AddBookManualPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canSubmit = title.trim().length > 0 && author.trim().length > 0;

  async function handleAdd() {
    if (!canSubmit) {
      setError("Title and author are required.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await createBook({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim() || null,
        coverUrl: coverUrl.trim() || null,
        source: "manual",
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
        <Heading level={1}>Add Book Manually</Heading>

        {error && <Banner status="error" title="Couldn't add this book" description={error} />}

        <FormLayout>
          <TextInput label="Title" value={title} onChange={setTitle} isRequired />
          <TextInput label="Author" value={author} onChange={setAuthor} isRequired />
          <TextInput
            label="ISBN (optional)"
            value={isbn}
            onChange={setIsbn}
            isOptional
          />
          <TextInput
            label="Cover URL (optional)"
            value={coverUrl}
            onChange={setCoverUrl}
            isOptional
          />
        </FormLayout>

        <HStack gap={2} hAlign="between">
          <Button label="Cancel" href="/" />
          <Button
            label="Add to Catalog"
            variant="primary"
            clickAction={handleAdd}
            isLoading={isSaving}
            isDisabled={!canSubmit}
          />
        </HStack>
      </VStack>
    </PageShell>
  );
}
