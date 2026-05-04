import { HttpLink } from "@apollo/client";
import {
  ApolloClient,
  InMemoryCache,
  registerApolloClient,
} from "@apollo/client-integration-nextjs";
import Config from "../config.json";
/**
 * @returns an ApolloClient instance scoped for the current request
 */

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: Config.API.MOHDAPI,
      headers: {        
        "api-key": process.env.MOHD_API_KEY!,
      },
    }),
  });
});
