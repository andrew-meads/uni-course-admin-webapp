import fs from "fs";
import { parse } from "csv-parse";

/**
 * Parses the given CSV file and returns an array of its lines.
 *
 * @param {*} csvFile the file to parse
 * @returns an array of records - each one will be an array of strings.
 */
export function parseCsv(csvFile) {
  const data = fs.readFileSync(csvFile, { encoding: "utf-8" });
  //   const lines = data.split("\n").map((l) => l.trim());

  const myPromise = new Promise((resolve, reject) => {
    const records = [];
    const parser = parse();
    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });
    parser.on("error", reject);
    parser.on("end", () => resolve(records));
    parser.write(data);
    parser.end();
  });

  return myPromise;
}
