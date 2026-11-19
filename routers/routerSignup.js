var express = require("express");

const { doSignup } = require("../controllers/controllerSignup")
var router = express.Router();


router.post("/signupUser", doSignup);
module.exports = router;