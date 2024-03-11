import express from "express";
import requiresAuth from "../../middleware/auth.js";
import { verifyGitHubUsername } from "../../external-apis/github.js";
import { User, ProjectGroup } from "../../data/schema.js";
import bcrypt from "bcrypt";
import yup from "yup";

const router = express.Router();

// /**
//  * The "create multiple accounts" function below requires an array of matching user objects.
//  */
// const createStudentListSchema = yup
//   .array(
//     yup.object({
//       uniId: yup.number().integer().required(),
//       firstName: yup.string().required(),
//       lastName: yup.string().required(),
//       emailAddress: yup.string().email().required()
//     })
//   )
//   .required();

// /**
//  * Creates multiple student accounts at once. Requires admin rights.
//  */
// router.post("/list", requiresAuth("admin"), async (req, res) => {
//   try {
//     const validatedBody = await createStudentListSchema.validate(req.body, {
//       abortEarly: true,
//       stripUnknown: true
//     });

//     // Remove users who are already in DB.
//     for (let i = 0; i < validatedBody.length; i++) {
//       if (await User.findOne({ emailAddress: validatedBody[i].emailAddress })) {
//         validatedBody.splice(i, 1);
//         i--;
//       }
//     }

//     // If none to create, get outta here
//     if (validatedBody.length === 0) return res.sendStatus(204);

//     // Create users
//     const users = validatedBody.map(
//       (u) =>
//         new User({
//           ...u,
//           roles: ["student"],
//           loginUuid: null,
//           githubUsername: null,
//           passHash: bcrypt.hashSync("password", 10) // TODO Fix this
//         })
//     );

//     // Batch save
//     await User.bulkSave(users);

//     // Done
//     return res.sendStatus(201);
//   } catch {
//     return res.sendStatus(422);
//   }
// });

/**
 * GETs info about many users. The exact info returned and queries allowed depend on the role.
 */
router.get("/", requiresAuth(), async (req, res) => {
  // Get query from req.query if any.
  const { role } = req.query;
  const query = role ? { roles: role } : {};

  // If the user's role is a student, they can only query for other students, or "blank".
  if (req.user.roles.includes("student")) {
    if (role && role !== "student") return res.json([]);
    query.roles = "student";
  }

  // Get matching users from DB
  const users = await User.find(query);

  // Return (stripping fields)
  return res.json(users.map((u) => returnUser(u, req.user.roles.includes("admin"))));
});

/**
 * GETs info about the currently authenticated user.
 */
router.get("/me", requiresAuth(), (req, res) => {
  // Create a copy of the DB user
  const user = returnUser(req.user);

  // Return as JSON
  return res.json(user);
});

/**
 * Updates currently authenticated user's GitHub username.
 */
router.patch("/me/github-username", requiresAuth(), async (req, res) => {
  const { githubUsername } = req.body;
  if (!githubUsername) return res.sendStatus(422);

  try {
    // Verify (throws if invalid)
    const verified = await verifyGitHubUsername(githubUsername);

    // Save and return
    await User.findByIdAndUpdate(req.user._id, { githubUsername: verified });
    return res.json({ githubUsername: verified });
  } catch {
    // Provided GitHub username not found, or not provided at all.
    return res.sendStatus(404);
  }
});

/**
 * Updates currently authenticated user's password.
 */
router.patch("/me/password", requiresAuth(), async (req, res) => {
  const { password } = req.body;

  if (!password) return res.sendStatus(422);

  // TODO Check password is legit

  // Create new hash and update DB
  const passHash = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(req.user._id, { passHash });

  return res.sendStatus(204);
});

/**
 * Move a student to a group
 */
router.put("/:id/group", requiresAuth("admin"), async (req, res) => {
  // Must supply groupId
  const { groupId } = req.body;
  if (!groupId) return res.sendStatus(422);

  // Must be an existing student
  const user = await User.findById(req.params.id);
  if (!user) return res.sendStatus(404);
  if (!user.roles.includes("student")) return res.sendStatus(422);

  // Find student's new group
  const newGroup = await ProjectGroup.findById(groupId);
  if (!newGroup) return res.sendStatus(404);
  // console.log(`New group: ${newGroup.name}`);

  // Find student's existing group, if any
  const existingGroup = await ProjectGroup.findOne({ "members.student": user._id });
  let memberRecord = existingGroup?.members.find((r) => r.student.equals(user._id));
  // console.log(`Existing group: ${existingGroup?.name}`);
  // console.log(memberRecord);

  // Delete student from existing group if required
  if (existingGroup) {
    existingGroup.members = existingGroup.members.filter((m) => !m.student.equals(user._id));
    await existingGroup.save();
  }

  // Add student to new group
  if (!memberRecord) memberRecord = { student: user._id, isGithubInviteSent: false };
  newGroup.members.push(memberRecord);
  await newGroup.save();

  return res.sendStatus(204);
});

/**
 * Creates a copy of the given user, removes unneccessary fields from it, and returns it.
 */
function returnUser(user, isAdmin = false) {
  const response = { ...user.toObject() };
  delete response.loginUuid;
  if (!isAdmin) delete response._id;
  delete response.passHash;
  return response;
}

export default router;
