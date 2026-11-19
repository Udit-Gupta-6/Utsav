var mongoose=require("mongoose")
                   
let colDesign = {
    emailid: { type: String, required: true, index: true, unique: true },
    acardno: String,
    name: String,
    dob: String,
    gender: String,
    address: String,
    city:String,
    contact:String
}
var ver = {
    versionKey: false, // to avoid __v field in table come by default
};
let ScheemaClass = mongoose.Schema; //schema is a class
let collectionObj = new ScheemaClass(colDesign, ver);  //instanation of SchemaClass

let CitizensColRef = mongoose.model("Citizens", collectionObj);
 module.exports=CitizensColRef;