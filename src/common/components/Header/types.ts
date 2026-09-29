export type PageLink = {
  pageName: string;
  link: string;
};

/** A header entry: a page, or a dropdown of pages with no page of its own. */
export type PageInfo = PageLink | { pageName: string; subPages: PageLink[] };
