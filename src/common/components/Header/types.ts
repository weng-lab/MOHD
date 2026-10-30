export type PageLink = {
  pageName: string;
  link: string;
};

/** A link off this site, which opens in a new tab and wears the external link icon. */
export const isExternalLink = (link: string) => link.startsWith("http");

/** A header entry: a page, or a dropdown of pages with no page of its own. */
export type PageInfo = PageLink | { pageName: string; subPages: PageLink[] };
