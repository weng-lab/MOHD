"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import type { ReactNode } from "react";

const screenApolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: "/api/screen-graphql",
  }),
});

export default function ScreenApolloProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ApolloProvider client={screenApolloClient}>{children}</ApolloProvider>;
}
