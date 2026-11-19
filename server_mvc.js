var express=require("express");
var cors=require("cors");

var {doMongooseConnection}=require("./config/mongooseConnect");

var routerVendor=require("./routers/routerVendor");
var routerCitizen=require("./routers/routerCitizen");
var routerEventServices=require("./routers/routerEventService");
var routerFavrs=require("./routers/routerFavrs")
var routerSignup=require("./routers/routerSignup")
var routerLogin=require("./routers/routerLogin")
var routerAdmin=require("./routers/routerAdmin")

let app=express();
var fileuploader=require("express-fileupload");
app.use(fileuploader());

app.use(express.json());

app.use(express.urlencoded(true)); //convert POST data to JSON object
app.use(cors());

require('dotenv').config();//reading .env file

doMongooseConnection();


app.listen(2004,function(req,resp){
    console.log("Server Started");
})


//---------------------------------------------
app.use("/vendor",routerVendor);
app.use("/citizen",routerCitizen)
app.use("/eventss",routerEventServices);
app.use("/favrs",routerFavrs)
app.use("/signup",routerSignup)
app.use("/login",routerLogin)
app.use("/admin",routerAdmin)

