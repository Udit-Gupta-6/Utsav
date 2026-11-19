var express=require("express");
var {dofetchFavoriteVendors,doRemoveFavoriteVendor}=require("../controllers/controllerFavrs");
let router=express.Router();

router.post("/fetchWishlist",dofetchFavoriteVendors);
router.post("/removeFavs",doRemoveFavoriteVendor);
module.exports=router;
