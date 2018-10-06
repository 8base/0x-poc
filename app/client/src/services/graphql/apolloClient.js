import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { setContext } from "apollo-link-context";
import { SubscriptionClientLink } from '@8base/sdk';

const setAuthorizationLink = setContext((request, previousContext) => ({
  headers: {
    authorization: "ddff9bbe-4027-43f4-884f-32e8d0115daf"
  }
}));

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    setAuthorizationLink,
    new SubscriptionClientLink(),
    new HttpLink({
      uri: 'https://prestaging-api.8basedev.com/5bb83be48d69ce9c5318f0a8',
      credentials: 'same-origin'
    })
  ]),
  cache: new InMemoryCache()
});

export default client;