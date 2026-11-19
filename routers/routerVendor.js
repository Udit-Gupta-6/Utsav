var express=require("express");

var {validateToken} = require("../config/jwtValidation")
var { doRegVendor, doFetchVendor, doUpdateVendorDetails}=require("../controllers/controllerVendor");

let router=express.Router();

router.post("/reg-vendor",validateToken,doRegVendor)
router.post("/fetch-vendor",doFetchVendor)
router.post("/update-vendor",doUpdateVendorDetails)

module.exports=router;
