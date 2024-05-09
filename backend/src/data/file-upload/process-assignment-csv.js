import { parseCsv } from "./parse-csv.js";
import { verifyGitHubUsername } from "../../external-apis/github.js";
import { User } from "../schema.js";

const NUM_HEADER_ROWS = 1;
const COL_EMAIL = 1;
const COL_USERNAME = 5;

