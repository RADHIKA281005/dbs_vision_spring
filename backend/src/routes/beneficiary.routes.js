import { Router } from "express";
import {
  createBeneficiary,
  getAllBeneficiaries,
  getBeneficiaryById,
  updateBeneficiary,
  deleteBeneficiary,
  addVisionRecord,
} from "../controllers/beneficiary.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All beneficiary routes are protected
router.use(verifyJWT);

router.route("/").post(createBeneficiary).get(getAllBeneficiaries);

router
  .route("/:beneficiaryId")
  .get(getBeneficiaryById)
  .patch(updateBeneficiary)
  .delete(deleteBeneficiary);

// Route for adding vision records
router.route("/:beneficiaryId/vision-records").post(addVisionRecord);

export default router;