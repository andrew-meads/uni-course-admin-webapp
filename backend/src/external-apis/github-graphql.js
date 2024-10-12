import { graphql } from "@octokit/graphql";
import { GITHUB_API_KEY } from "../env.js";

export const graphqlWithAuth = graphql.defaults({
    headers: {
        authorization: `token ${GITHUB_API_KEY}`
    }
});