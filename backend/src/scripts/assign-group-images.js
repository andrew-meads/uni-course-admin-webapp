import { withDatabase } from "./util.js";
import { ProjectGroup } from "../data/schema.js";
import fs from "fs";

await withDatabase(async () => {
  const groups = await ProjectGroup.find({});
  console.log(`${groups.length} groups.\r\n`);
  // const names = groups.map((g) => g.name);
  // for (const name of names) {
  //   console.log(name);
  // }

  const dir = "images/Dall-E";
  const publicDir = `public/${dir}`;
  const files = fs.readdirSync(publicDir);

  for (const group of groups) {
    const file = files.find((f) => f.toLowerCase().includes(group.name.toLowerCase()));
    if (!file) {
      console.error(`${group.name} has no image!!`);
      continue;
    }

    group.imageUrl = `${dir}/${file.replace(" ", "%20")}`;
    await group.save();
    console.log(`${group.name} => ${group.imageUrl}`);
  }
});
