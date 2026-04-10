import { CodegenConfig } from "@graphql-codegen/cli";
import Config from "./src/common/config.json";

const config: CodegenConfig = {
  schema: [
    {
      [Config.API.MOHDAPI]: {
        headers: {
          "mohd-api-key": process.env.MOHD_API_KEY!, //should remove this once api only checks api-key
          "api-key": process.env.MOHD_API_KEY!,
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
