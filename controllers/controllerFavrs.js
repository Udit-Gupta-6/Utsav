const FavsColRef = require("../models/modelFavs");
const VendorColRef = require("../models/modelVendor");

async function dofetchFavoriteVendors(req, resp) {  //-------------Fetching Vendors Wishlist--------------------
    try {
        const { citizenEmail } = req.body;
        if (!citizenEmail) {
            return resp.json({ status: false, msg: "citizenEmail is required" });
        }

        // Fetching vendor emails from Favrs collection
        const favDoc = await FavsColRef.findOne({ citizenEmail: citizenEmail.trim() });
        if (!favDoc || !favDoc.vendorEmails || favDoc.vendorEmails.length === 0) {
            return resp.json({ status: true, msg: [] });
        }

        // Fetch full vendor cards matching the saved vendor emails
        const vendorList = await VendorColRef.find({ emailid: { $in: favDoc.vendorEmails } });
        return resp.json({ status: true, msg: vendorList });
    } 
    catch (error) {
        return resp.json({ status: false, msg: error.message });
    }
}

async function doRemoveFavoriteVendor(req, resp) {  //---------------Removing Vendor from Wishlist--------------
    try {
        const { citizenEmail, vendorEmail } = req.body;

        // Quick validation check
        if (!citizenEmail || !vendorEmail) {
            return resp.json({ status: false, msg: "Both citizenEmail and vendorEmail are required" });
        }

        await FavsColRef.updateOne(
            { citizenEmail: citizenEmail.trim() },
            { $pull: { vendorEmails: vendorEmail.trim() } }
        );

        return resp.json({ status: true, msg: "Vendor removed successfully" });
    } 
    catch (error) {
        return resp.json({ status: false, msg: error.message });
    }
}

module.exports = { dofetchFavoriteVendors, doRemoveFavoriteVendor };