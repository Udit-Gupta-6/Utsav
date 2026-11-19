const express = require("express");

const {validateToken} = require("../config/jwtValidation")
const {doExtractAadhaar,doSaveCitizen,doFetchCitizen,doUpdateCitizen} = require("../controllers/controllerCitizen");

const router = express.Router();

router.post("/ocr-aadhaar", doExtractAadhaar);
router.post("/save",validateToken, doSaveCitizen);
router.post("/fetch", doFetchCitizen);
router.post("/update", doUpdateCitizen);

module.exports = router;
