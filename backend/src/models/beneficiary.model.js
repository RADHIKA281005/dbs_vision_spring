import mongoose, { Schema } from "mongoose";

const visionRecordSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  rightEye: {
    type: String,
    trim: true,
  },
  leftEye: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  prescribedGlasses: {
    type: String,
    trim: true,
  },
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const beneficiarySchema = new Schema(
  {
    beneficiaryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      default: "Prefer not to say",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    visionRecords: [visionRecordSchema],
    // The staff member who created this record
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Beneficiary = mongoose.model("Beneficiary", beneficiarySchema);