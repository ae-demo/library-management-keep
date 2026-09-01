import type { ReactNode } from "react";
import { AppShell } from "@astryxdesign/core/AppShell";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import { Layout, LayoutContent } from "@astryxdesign/core/Layout";

// wireframes.dsl draws the same navbar on every screen:
//   navbar "Library | Catalog -> Catalog | Add Book -> AddBookSearch"
// "Library" is the brand (no target); Catalog and Add Book are the two
// destinations every screen can reach.
type PageShellProps = {
  active: "catalog" | "add-book";
  children: ReactNode;
};

export function PageShell({ active, children }: PageShellProps) {
  return (
    <AppShell
      topNav={
        <TopNav heading={<TopNavHeading heading="Library" />}>
          <TopNavItem label="Catalog" href="/" isSelected={active === "catalog"} />
          <TopNavItem
            label="Add Book"
            href="/add-book/search"
            isSelected={active === "add-book"}
          />
        </TopNav>
      }
    >
      <Layout content={<LayoutContent padding={4}>{children}</LayoutContent>} />
    </AppShell>
  );
}
