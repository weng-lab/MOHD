import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support";
import Config from "../config.json";
/**
 * @returns an ApolloClient instance scoped for the current request
 */

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: Config.API.MOHDAPI,
      headers: {
        "mohd-api-key": process.env.MOHD_API_KEY!, //should remove this once api only checks api-key
        "api-key": process.env.MOHD_API_KEY!,
      },
    }),
  });
});
