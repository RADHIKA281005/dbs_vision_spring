import { Router } from "express";
import {
  addInventoryItem,
  getAllInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventory.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All inventory routes are protected
router.use(verifyJWT);

router.route("/").post(addInventoryItem).get(getAllInventoryItems);

router
  .route("/:id") // Can be mongo ID or SKU
  .get(getInventoryItem)
  .patch(updateInventoryItem)
  .delete(deleteInventoryItem);

export default router;