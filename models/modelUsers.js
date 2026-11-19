var mongoose=require("mongoose")
                   
let colDesign = {
    emailid: { type: String, required: true, index: true, unique: true },
    password: String,
    utype: String,
    status: {
        type :Boolean,
        default:true
    }
} 
var ver = {
    versionKey: false, // to avoid __v field in table come by default
};
let ScheemaClass = mongoose.Schema; //schema is a class
let collectionObj = new ScheemaClass(colDesign, ver);  //instanation of SchemaClass

let UsersColRef = mongoose.model("Users", collectionObj);
 module.exports=UsersColRef; 