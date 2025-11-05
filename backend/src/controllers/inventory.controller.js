import { Inventory } from "../models/inventory.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add a new item to inventory
const addInventoryItem = asyncHandler(async (req, res) => {
  const { itemName, itemType, sku, quantity, location, notes } = req.body;

  if (!itemName || !itemType || !quantity || !location) {
    throw new ApiError(
      400,
      "Item Name, Type, Quantity, and Location are required"
    );
  }

  if (sku) {
    const existingItem = await Inventory.findOne({ sku });
    if (existingItem) {
      throw new ApiError(409, "Item with this SKU already exists");
    }
  }

  const item = await Inventory.create({
    itemName,
    itemType,
    sku,
    quantity,
    location,
    notes,
    lastUpdatedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, item, "Inventory item added successfully"));
});

// Get all inventory items
const getAllInventoryItems = asyncHandler(async (req, res) => {
  const items = await Inventory.find().populate(
    "lastUpdatedBy",
    "fullName username"
  );
  // Do not sort in query: .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, items, "Inventory items fetched successfully"));
});

// Get a single item by its ID or SKU
const getInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if id is a valid Mongo ID, otherwise search by SKU
  const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
  const query = isMongoId ? { _id: id } : { sku: id };

  const item = await Inventory.findOne(query).populate(
    "lastUpdatedBy",
    "fullName username"
  );

  if (!item) {
    throw new ApiError(404, "Inventory item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, "Inventory item fetched successfully"));
});

// Update an inventory item (e.g., change quantity or location)
const updateInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { itemName, itemType, quantity, location, notes } = req.body;

  const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
  const query = isMongoId ? { _id: id } : { sku: id };

  const item = await Inventory.findOneAndUpdate(
    query,
    {
      $set: {
        itemName,
        itemType,
        quantity,
        location,
        notes,
        lastUpdatedBy: req.user._id,
      },
    },
    { new: true }
  );

  if (!item) {
    throw new ApiError(404, "Inventory item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, "Inventory item updated successfully"));
});

// Delete an inventory item
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const isMongoId = id.match(/^[0-9a-fA-F]{24}$/);
  const query = isMongoId ? { _id: id } : { sku: id };

  const item = await Inventory.findOneAndDelete(query);

  if (!item) {
    throw new ApiError(404, "Inventory item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Inventory item deleted successfully"));
});

export {
  addInventoryItem,
  getAllInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};