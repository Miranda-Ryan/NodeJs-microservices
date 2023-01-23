import express from "express";
import { currentUser, requireAuth } from "@rjmtix/common";

const router = express.Router();

router.get(
  "/api/users/currentuser",
  currentUser,
  requireAuth,
  async (req, res) => {
    return res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
