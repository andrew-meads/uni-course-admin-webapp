import { DB_URL } from "../env.js";
import mongoose from "mongoose";

/**
 *
 * @param {() => Promise<any>} func
 */
export async function withDatabase(func) {
  await mongoose.connect(DB_URL);
  console.log("Connected to db");

  func().finally(async () => {
    await mongoose.disconnect();
    console.log("Disconnected from db.");
  });
}
