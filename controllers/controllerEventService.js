var EventSevColRef = require("../models/modelEventServices");
const FavsColRef = require("../models/modelFavs");
var VendorColRef = require("../models/modelVendor");

function doGiveServices(req, resp) {    //---------------Fetching Services---------------
    let events = req.body.eventOptions;
    // console.log(events)

    if (!events) {
        return resp.json({ status: false, msg: "Event name is required" });
    }

    EventSevColRef.findOne({ event: events })
        .then((result) => {
            if (result != null) {
                resp.json({ status: true, msg: result.services });
            } else {
                resp.json({ status: false, msg: "Invalid Event" });
            }
        })
        .catch((err) => {
            resp.json({ status: false, msg: err.message });
        });
}

function doFetchCities(req, resp) { //-----------------Fetching Cities------------- 

    VendorColRef.distinct("city")
        .then((cities) => {
            if (cities && cities.length > 0) {
                resp.json({ status: true, msg: cities });
            } else {
                resp.json({ status: false, msg: "No cities found" });
            }
        })
        .catch((err) => {
            resp.json({ status: false, msg: err.message });
        });
}

function doGiveVendorDetails(req, resp) {   //-----------Fetching Vendors----------------   

    // let city=req.body.city;
    // let services=req.bodu.services;
    const { city, services } = req.body || {};

    if (!city || !services || (Array.isArray(services) && services.length === 0)) {
        return resp.json({ status: false, msg: "City and Services are required" });
    }

    const servicesList = Array.isArray(services) ? services : [services];

    // Regex special characters escape karo (e.g. "DJ (Music)" ya "Tent + Decor")
    const escapeRegex = (str) => str.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchPattern = servicesList.map(escapeRegex).join("|");

    VendorColRef.find({
        city: city,
        selcate: { $regex: searchPattern, $options: "i" },
    })
        .then((result) => {
            resp.json({ status: true, msg: result || [] });
        })
        .catch((err) => {
            resp.json({ status: false, msg: err.message });
        });
}

 async function saveFavoriteVendor(req, resp) { //---------------Heart whishlist--------------------
    try {
        const { citizenEmail, vendorEmail } = req.body;
        // 1. Basic validation
        if (!citizenEmail || !vendorEmail) {
            return resp.status(400).json({
                status: false,
                msg: "Both citizenEmail and vendorEmail are required.",
            });
        }
        // 2. Check if the vendor is already saved by this citizen
        const existing = await FavsColRef.findOne({
            citizenEmail: citizenEmail.trim(),
            vendorEmails: vendorEmail.trim(),
        });
        if (existing) {
            // Vendor already exists -> REMOVE IT ($pull)
            await FavsColRef.updateOne(
                { citizenEmail: citizenEmail.trim() },
                { $pull: { vendorEmails: vendorEmail.trim() } }
            );
            return resp.json({
                status: true,
                action: "removed",
                msg: "Vendor removed from favorites successfully.",
            });
        } else {
            await FavsColRef.updateOne(
                { citizenEmail: citizenEmail.trim() },
                { $addToSet: { vendorEmails: vendorEmail.trim() } },    // addToSet - set the value to particular feild
                { upsert: true }        // upset- if wishlist of citz present then upd it else insert new one
            );
            return resp.json({
                status: true,
                action: "saved",
                msg: "Vendor saved to favorites successfully.",
            });
        }
    } catch (error) {
        console.error("Error in saveFavoriteVendor:", error);
        return resp.status(500).json({
            status: false,
            msg: "Internal server error: " + error.message,
        });
    }
}

module.exports = { doGiveServices, doFetchCities, doGiveVendorDetails, saveFavoriteVendor };