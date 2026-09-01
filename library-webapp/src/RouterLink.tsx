import { forwardRef } from "react";
import { Link, type LinkProps } from "react-router-dom";

// Astryx's LinkComponentType only requires href/className/style/children, so
// every Astryx nav item, table row, and list item that carries an `href`
// routes through react-router client-side navigation instead of a full page
// load, via the app-wide <LinkProvider component={RouterLink}>.
type RouterLinkProps = Omit<LinkProps, "to"> & { href?: string };

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function RouterLink({ href, ...rest }, ref) {
    return <Link ref={ref} to={href ?? "#"} {...rest} />;
  },
);
