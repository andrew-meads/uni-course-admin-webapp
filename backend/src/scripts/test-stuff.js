import { octokit } from "../external-apis/github.js";
import { GITHUB_ORG, GIT_TEMP_DIR, GITHUB_API_KEY } from "../env.js";

const REPO_NAME = "test-repo-thinger";

const createRepoResponse = await octokit.rest.repos.createUsingTemplate({
    template_owner: GITHUB_ORG,
    template_repo: "template-8.1-web-lab-full-stack",
    owner: GITHUB_ORG,
    name: REPO_NAME,
    private: true
});

console.log(`Create repo response code: ${createRepoResponse.status}`);

// Wait till we get repo?
// let getRepoResponse;
// do {
//     try {
//         getRepoResponse = await octokit.request(`/repos/${GITHUB_ORG}/${REPO_NAME}`);

//         console.log(getRepoResponse.status);
//     } catch (err) {
//         console.log(err.status);
//     }
// } while (getRepoResponse?.status !== 200);

let getBranchResponse;
do {
    try {
        getBranchResponse = await octokit.rest.repos.getBranch({
            owner: GITHUB_ORG,
            repo: REPO_NAME,
            branch: "main"
        });

        console.log(getBranchResponse.status);
    } catch (err) {
        console.log(err.status);
    }
} while (getBranchResponse?.status !== 200);

// Now do branch rules?
const createRuleResponse = await octokit.rest.repos.updateBranchProtection({
    owner: GITHUB_ORG,
    repo: REPO_NAME,
    branch: "main",
    required_status_checks: null,
    enforce_admins: null,
    required_pull_request_reviews: {
        required_approving_review_count: 1
    },
    restrictions: null
});

console.log(createRuleResponse);