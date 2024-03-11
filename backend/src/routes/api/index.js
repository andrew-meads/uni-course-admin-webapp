import express from "express";

const router = express.Router();

import authRoutes from "./api-auth.js";
router.use("/auth", authRoutes);

import usersRoutes from "./api-users.js";
router.use("/users", usersRoutes);

// import githubRoutes from "./api-github.js";
// router.use("/github", githubRoutes);

import uploadsRoutes from "./api-uploads.js";
router.use("/uploads", uploadsRoutes);

import groupsRoutes from "./api-groups.js";
router.use("/groups", groupsRoutes);

export default router;
