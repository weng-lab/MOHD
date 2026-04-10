import { CodegenConfig } from "@graphql-codegen/cli";
import Config from "./src/common/config.json";

const config: CodegenConfig = {
  schema: [
    {
      [Config.API.MOHDAPI]: {
        headers: {
          "MOHD-API-Key": process.env.MOHD_API_KEY!,
        },
      },
    },
  ],
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/common/types/generated/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
