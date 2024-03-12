import { withDatabase } from "./util.js";
import { ProjectGroup } from "../data/schema.js";

await withDatabase(async () => {
  const groups = await ProjectGroup.find({});
  console.log(`${groups.length} groups:\r\n`);
  const names = groups.map((g) => g.name);
  for (const name of names) {
    console.log(name);
  }
});
