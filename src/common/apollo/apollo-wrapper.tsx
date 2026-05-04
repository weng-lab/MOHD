"use client";

import { ReactNode } from "react";
import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  InMemoryCache,
  SSRMultipartLink,
  ApolloClient,
} from "@apollo/client-integration-nextjs";
import Config from "../config.json";


// See https://www.apollographql.com/blog/using-apollo-client-with-next-js-13-releasing-an-official-library-to-support-the-app-router

export function makeClient() {
  const isServer = typeof window === "undefined";
  const httpLink = new HttpLink({
    uri: isServer ? Config.API.MOHDAPI : "/api/mohd-graphql",
    headers: isServer
      ? {
          "api-key": process.env.MOHD_API_KEY!,
        }
      : undefined,
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link:
      isServer
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : httpLink,
  });
}

export function ApolloWrapper({ children }: { children: ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
