import express from "express";
import requireAuth from "../../middleware/auth.js";
import { User, ProjectGroup } from "../../data/schema.js";

const router = express.Router();

/**
 * GETs all groups
 */
router.get("/", requireAuth("admin"), async (req, res) => {
  return res.json(await ProjectGroup.find({}));
});

/**
 * DELETE a group
 */
router.delete("/:id", requireAuth("admin"), async (req, res) => {
  await ProjectGroup.findByIdAndDelete(req.params.id);
  return res.sendStatus(204);
});

/**
 * Create (POST) a group
 */
router.post("/", requireAuth("admin"), async (req, res) => {
  // TODO Check that everything is valid!
  const newGroup = { ...req.body };
  delete newGroup._id;
  const dbGroup = new ProjectGroup(newGroup);
  await dbGroup.save();
  return res.status(201).location(`/api/groups/${dbGroup._id}`).json(dbGroup);
});

/**
 * Merge groups
 */
router.patch("/:id/members", requireAuth("admin"), async (req, res) => {
  const { sourceGroupId } = req.body;
  if (!sourceGroupId) return res.sendStatus(422);

  const sourceGroup = await ProjectGroup.findById(sourceGroupId);
  const targetGroup = await ProjectGroup.findById(req.params.id);

  if (!sourceGroup || !targetGroup) return res.sendStatus(404);

  targetGroup.members = [...targetGroup.members, ...sourceGroup.members];
  await targetGroup.save();
  await ProjectGroup.findByIdAndDelete(sourceGroup._id);
  return res.sendStatus(204);
});

export default router;
