import { Beneficiary } from "../models/beneficiary.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new beneficiary
const createBeneficiary = asyncHandler(async (req, res) => {
  const { beneficiaryId, fullName, age, gender, location, contactNumber } =
    req.body;

  if (!beneficiaryId || !fullName || !age || !location) {
    throw new ApiError(
      400,
      "Beneficiary ID, Full Name, Age, and Location are required"
    );
  }

  const existingBeneficiary = await Beneficiary.findOne({ beneficiaryId });
  if (existingBeneficiary) {
    throw new ApiError(409, "Beneficiary with this ID already exists");
  }

  const beneficiary = await Beneficiary.create({
    beneficiaryId,
    fullName,
    age,
    gender,
    location,
    contactNumber,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, beneficiary, "Beneficiary created successfully")
    );
});

// Get all beneficiaries
const getAllBeneficiaries = asyncHandler(async (req, res) => {
  // Add pagination or filtering here later if needed
  const beneficiaries = await Beneficiary.find().populate(
    "createdBy",
    "fullName username"
  );
  // Do not sort in query: .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        beneficiaries,
        "Beneficiaries fetched successfully"
      )
    );
});

// Get a single beneficiary by their Beneficiary ID
const getBeneficiaryById = asyncHandler(async (req, res) => {
  const { beneficiaryId } = req.params;
  const beneficiary = await Beneficiary.findOne({ beneficiaryId }).populate(
    "createdBy",
    "fullName username"
  );

  if (!beneficiary) {
    throw new ApiError(404, "Beneficiary not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, beneficiary, "Beneficiary fetched successfully"));
});

// Update a beneficiary's details
const updateBeneficiary = asyncHandler(async (req, res) => {
  const { beneficiaryId } = req.params;
  const { fullName, age, gender, location, contactNumber } = req.body;

  const beneficiary = await Beneficiary.findOneAndUpdate(
    { beneficiaryId },
    {
      $set: {
        fullName,
        age,
        gender,
        location,
        contactNumber,
      },
    },
    { new: true } // Return the updated document
  );

  if (!beneficiary) {
    throw new ApiError(404, "Beneficiary not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, beneficiary, "Beneficiary updated successfully"));
});

// Delete a beneficiary
const deleteBeneficiary = asyncHandler(async (req, res) => {
  const { beneficiaryId } = req.params;

  const beneficiary = await Beneficiary.findOneAndDelete({ beneficiaryId });

  if (!beneficiary) {
    throw new ApiError(404, "Beneficiary not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Beneficiary deleted successfully"));
});

// --- Vision Record Management ---

// Add a new vision record to a beneficiary
const addVisionRecord = asyncHandler(async (req, res) => {
  const { beneficiaryId } = req.params;
  const { rightEye, leftEye, notes, prescribedGlasses } = req.body;

  const newRecord = {
    rightEye,
    leftEye,
    notes,
    prescribedGlasses,
    recordedBy: req.user._id,
  };

  const beneficiary = await Beneficiary.findOneAndUpdate(
    { beneficiaryId },
    {
      $push: { visionRecords: newRecord },
    },
    { new: true }
  );

  if (!beneficiary) {
    throw new ApiError(404, "Beneficiary not found");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, beneficiary, "Vision record added successfully")
    );
});

export {
  createBeneficiary,
  getAllBeneficiaries,
  getBeneficiaryById,
  updateBeneficiary,
  deleteBeneficiary,
  addVisionRecord,
};