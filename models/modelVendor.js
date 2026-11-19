var mongoose=require("mongoose");
            
let colDesign = {
    emailid: { type: String, required: true, index: true, unique: true },
    name:String,
    contact:String,
    business:String,
    area:String,
    address:String,
    city:String,
    estd: { type: String },
    selcate:String,
    website:String,
    insta:String,
    shoppicurl:String,
    certpicurl:String
    
}
var ver = {
    versionKey: false, // to avoid __v field in table come by default
};
let ScheemaClass = mongoose.Schema; //schema is a class
let collectionObj = new ScheemaClass(colDesign, ver);  //instanation of SchemaClass
let VendorColRef = mongoose.model("Vendors", collectionObj);
 module.exports=VendorColRef;