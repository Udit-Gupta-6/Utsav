const express = require("express");
const router = express.Router();

const {
  doFetchAllUsers,
  doUpdateStatus,
  doDeleteUser,
} = require("../controllers/controllerAdmin");

// 1. GET: Fetch all users
router.post("/fetchallusers", doFetchAllUsers);

// 2. POST: Update status (Block or Resume)
router.post("/updatestatus", doUpdateStatus);

// 3. POST: Delete user permanently
router.post("/deleteuser", doDeleteUser);

module.exports = router;