import express from "express";
import requireAuth, { createToken } from "../../middleware/auth.js";
import { User } from "../../data/schema.js";
import bcrypt from "bcrypt";

const router = express.Router();

/**
 * Logs a user in.
 */
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.sendStatus(422);

  // User must exist
  const user = await User.findOne({ emailAddress: email });
  if (!user) return res.sendStatus(401);

  // Password must be correct
  const isPasswordOk = bcrypt.compareSync(password, user.passHash);
  if (!isPasswordOk) return res.sendStatus(401);

  // Create and sign a JWT
  const [token, uuid] = createToken({
    uniId: user.uniId,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    roles: user.roles
  });

  // Write uuid value to user in database
  await User.findByIdAndUpdate(user._id, { loginUuid: uuid });

  // Return success with the token in the response
  return res.json({ token });
});

/**
 * Logs out a user by deleting their loginUuid from the database.
 */
router.delete("/", requireAuth(), async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { loginUuid: null });
  // console.log("Logging Out!");
  return res.sendStatus(204);
});

export default router;
