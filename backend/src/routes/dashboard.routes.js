import { Router } from "express";
import { getAdminDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Dashboard routes are protected and for admins only
router.use(verifyJWT, verifyAdmin);

router.route("/stats").get(getAdminDashboardStats);

export default router;