var VendorColRef = require("../models/modelVendor");
var { getCloudinaryObject } = require("../config/configCloud");

let cloudinary = getCloudinaryObject();

var path = require("path");

async function doRegVendor(req, resp) { //----------------------Registration------------------
    let url1 = "nopic.jpg";
    if (req.files != null && req.files.shoppic) {
        let shoppicFile = req.files.shoppic.name;
        let fullPathofShop = path.join(__dirname, "..", "uploads", shoppicFile);
        // console.log(fullPath);
        await req.files.shoppic.mv(fullPathofShop);

        await cloudinary.uploader.upload(fullPathofShop).then(function (picUrlResult) {
            url1 = picUrlResult.url; //will give u the url of ur pic on cloudinary server
            // console.log(url1);
        });
    }

    req.body.shoppicurl = url1; //new Propert added at runtime


    let url2 = "nopic.jpg";
    if (req.files != null && req.files.certpic) {  // && bcoz if files not came and particaular also dont came
        let certpicFile = req.files.certpic.name;
        let fullPathofCert = path.join(__dirname, "..", "uploads", certpicFile);
        // console.log(fullPath);
        await req.files.certpic.mv(fullPathofCert);

        await cloudinary.uploader.upload(fullPathofCert).then(function (picUrlResult) {
            url2 = picUrlResult.url; //will give u the url of ur pic on cloudinary server
            // console.log(url2);
        });
    }

    req.body.certpicurl = url2; //new Propert added at runtime


    let doc = new VendorColRef(req.body);
    doc
        .save()
        .then((res) => {
            console.log(res);

            resp.json({ status: true, msg: "Record Saved Successfullyyy" });
        })
        .catch((err) => {
            console.log(err);

            resp.json({ status: false, msg: err });
        });
}


function doFetchVendor(req, resp) { //------------------------------fetcthing--------------

    let eid = req.body.emailid;
    VendorColRef.findOne({ emailid: eid })
        .then((result) => {
            if (result != null) 
                resp.json({ status: true, msg: result });
            else 
                resp.json({ status: true, msg: "Invalid Emailid" });
        })
        .catch((err) => {
            resp.json({ status: false, msg: err });
        });
}

async function doUpdateVendorDetails(req, resp) {  //--------------------Update----------------
    try {
        // Agar nayi photo aayi hai to Cloudinary par upload hogi
        if (req.files) {
            if (req.files.shoppic) {
                let shoppicFile = req.files.shoppic.name;
                let fullPathofShop = path.join(__dirname, "..", "uploads", shoppicFile);
                await req.files.shoppic.mv(fullPathofShop);

                const result1 = await cloudinary.uploader.upload(fullPathofShop);
                req.body.shoppicurl = result1.url; // Nayi photo ka url set ho gaya
            }

            if (req.files.certpic) {
                let fileNameofCert = req.files.certpic.name;
                let fullPathofCert = path.join(__dirname, "..", "uploads", fileNameofCert);
                await req.files.certpic.mv(fullPathofCert);

                const result2 = await cloudinary.uploader.upload(fullPathofCert);
                req.body.certpicurl = result2.url; // Naye cert ka url set ho gaya
            }
        }

        console.log(req.body);


        VendorColRef.updateOne({ emailid: req.body.emailid }, { $set: req.body })
            .then((res) => resp.json({ status: true, msg: "Vendor Updated Successfully" }))
            .catch((err) => resp.json({ status: false, msg: err.message }));

    } catch (err) {
        console.log(err);
        resp.json({ status: false, msg: err.message });
    }
}



module.exports = { doRegVendor, doFetchVendor, doUpdateVendorDetails };
