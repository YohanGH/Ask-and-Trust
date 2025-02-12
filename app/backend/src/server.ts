import dotenv from "dotenv";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import dataSource from "./database/config/datasource";
import { GraphQLFormattedError } from "graphql";
import Cookies from "cookies";

dotenv.config(); // Load environment variables from .env file

// Check that COOKIE_SECRET is defined
if (!process.env.COOKIE_SECRET) {
  throw new Error("COOKIE_SECRET is not defined in environment variables.");
}

// Check that APP_PORT is defined
if (!process.env.APP_PORT) {
  throw new Error("APP_PORT is not defined in environment variables.");
}

(async () => {
  try {
    // Initialize the data source (e.g., connect to a database)
    await dataSource.initialize();

    // Constructing the GraphQL schema with TypeGraphQL
    // Replace the resolvers array with your actual resolvers
    const schema = await buildSchema({
      resolvers: [
        /* your resolvers here */
      ],
    });

    //Create instance of ApolloServer with the schema
    const server = new ApolloServer({
      schema,
      formatError: (error: GraphQLFormattedError) => {
        // You can customize the error format here if needed
        return error;
      },
    });

    // Start the server
    const { url } = await startStandaloneServer(server, {
      listen: { port: Number(process.env.APP_PORT) || 4000 },
      context: async ({ req, res }) => {
        // Properties to the context here, like the authenticated user
        const cookies = new Cookies(req, res, {
          keys: [process.env.COOKIE_SECRET || "default-secret"],
        });

        return { cookies };
      },
    });

    console.log(`🚀  Server ready at: ${url}`);
  } catch (error) {
    console.error("🚨 Error during initialization:", error);
  }
})();
