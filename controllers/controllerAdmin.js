const UsersColRef = require("../models/modelUsers");

// ============================================================================
// 1. FETCH ALL USERS (Excluding passwords for security)
// ============================================================================
async function doFetchAllUsers(req, resp) {
  try {
    // Find all users and hide password field
    const usersList = await UsersColRef.find({}, { password: 0 }).sort({ _id: -1 });

    return resp.json({
      status: true,
      data: usersList,
      msg: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Fetch All Users Error:", error);
    return resp.json({
      status: false,
      msg: error.message || "Failed to fetch users",
    });
  }
}

// ============================================================================
// 2. UPDATE USER STATUS (BLOCK / RESUME)
// ============================================================================
async function doUpdateStatus(req, resp) {
  try {
    const { emailid, status } = req.body;

    if (!emailid || typeof status === "undefined") {
      return resp.json({
        status: false,
        msg: "Email ID and status are required.",
      });
    }

    // Convert to boolean (true = active, false = blocked)
    const booleanStatus = Boolean(status);

    const updateResult = await UsersColRef.updateOne(
      { emailid: emailid.trim().toLowerCase() },
      { $set: { status: booleanStatus } }
    );

    if (updateResult.matchedCount === 0) {
      return resp.json({
        status: false,
        msg: "User not found in collection.",
      });
    }

    const actionText = booleanStatus ? "Resumed (Active)" : "Blocked";

    return resp.json({
      status: true,
      msg: `User ${emailid} has been ${actionText} successfully.`,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    return resp.json({
      status: false,
      msg: error.message || "Failed to update status",
    });
  }
}

// ============================================================================
// 3. DELETE USER PERMANENTLY
// ============================================================================
async function doDeleteUser(req, resp) {
  try {
    const { emailid } = req.body;

    if (!emailid) {
      return resp.json({
        status: false,
        msg: "Email ID is required to delete a user.",
      });
    }

    const deleteResult = await UsersColRef.deleteOne({
      emailid: emailid.trim().toLowerCase(),
    });

    if (deleteResult.deletedCount === 0) {
      return resp.json({
        status: false,
        msg: "User not found or already deleted.",
      });
    }

    return resp.json({
      status: true,
      msg: `User ${emailid} was permanently deleted.`,
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return resp.json({
      status: false,
      msg: error.message || "Failed to delete user",
    });
  }
}

module.exports = {
  doFetchAllUsers,
  doUpdateStatus,
  doDeleteUser,
};