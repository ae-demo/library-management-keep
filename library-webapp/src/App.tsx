import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { LinkProvider } from "@astryxdesign/core/Link";
import { RouterLink } from "./RouterLink";
import { AuthGate } from "./AuthGate";
import { CallbackPage } from "./pages/CallbackPage";
import { CatalogPage } from "./pages/CatalogPage";
import { BookDetailPage } from "./pages/BookDetailPage";
import { AddBookSearchPage } from "./pages/AddBookSearchPage";
import { AddBookConfirmPage } from "./pages/AddBookConfirmPage";
import { AddBookManualPage } from "./pages/AddBookManualPage";

function ProtectedLayout() {
  return (
    <AuthGate>
      <Outlet />
    </AuthGate>
  );
}

export default function App() {
  return (
    <LinkProvider component={RouterLink}>
      <Routes>
        {/* The platform's SSO hosts sign-in itself; this app only redirects
            to it (AuthGate) and receives the member back here. */}
        <Route path="/callback" element={<CallbackPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
          <Route path="/add-book/search" element={<AddBookSearchPage />} />
          <Route path="/add-book/confirm" element={<AddBookConfirmPage />} />
          <Route path="/add-book/manual" element={<AddBookManualPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </LinkProvider>
  );
}
