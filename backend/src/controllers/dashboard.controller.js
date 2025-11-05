import { Beneficiary } from "../models/beneficiary.model.js";
import { Inventory } from "../models/inventory.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAdminDashboardStats = asyncHandler(async (req, res) => {
  try {
    const totalBeneficiaries = await Beneficiary.countDocuments();
    const totalStaff = await User.countDocuments({ role: "staff" });
    const totalInventoryItems = await Inventory.countDocuments();

    // Aggregate inventory by location
    const inventoryByLocation = await Inventory.aggregate([
      {
        $group: {
          _id: "$location",
          totalQuantity: { $sum: "$quantity" },
          itemCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          location: "$_id",
          totalQuantity: 1,
          itemCount: 1,
        },
      },
    ]);
    
    // Aggregate beneficiaries by location
    const beneficiariesByLocation = await Beneficiary.aggregate([
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          location: "$_id",
          count: 1,
        },
      },
    ]);


    const stats = {
      totalBeneficiaries,
      totalStaff,
      totalInventoryItems,
      inventoryByLocation,
      beneficiariesByLocation,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching dashboard stats", [error.message]);
  }
});

export { getAdminDashboardStats };