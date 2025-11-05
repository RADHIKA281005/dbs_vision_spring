import mongoose, { Schema } from "mongoose";

const inventorySchema = new Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["Glasses", "Medicine", "Equipment", "Other"],
      required: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    // The staff member who last updated this item
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Inventory = mongoose.model("Inventory", inventorySchema);