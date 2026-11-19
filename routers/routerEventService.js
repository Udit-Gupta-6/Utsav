var express=require("express");
var {validateToken} = require("../config/jwtValidation")
var {doGiveServices,doFetchCities,doGiveVendorDetails,saveFavoriteVendor}=require("../controllers/controllerEventService");
let router=express.Router();


router.post("/eventSerFetch",doGiveServices);
router.post("/eventCityFetch",doFetchCities);
router.post("/eventVendorDetails", validateToken,doGiveVendorDetails);
router.post("/eventFavVendor",saveFavoriteVendor);


module.exports=router;
