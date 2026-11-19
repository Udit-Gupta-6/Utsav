
// let jwt = require("jsonwebtoken");

// function validateToken(req, resp, next) {
//     // alert("noo");
//     let fulltoken = req.headers["authorization"];
//     let ary = fulltoken.split(" ");

//     try {
//         let TokenValidObj = jwt.verify(ary[1], process.env.SEC_KEY);
//         console.log("********" + JSON.stringify(TokenValidObj));
//         if (TokenValidObj != null) {
//             const payload = jwt.decode(ary[1]);
//             // console.log("*****"+payload+"******");

//             next();//send to controller
//             //resp.json({status:true,msg:"**Aauthorized",item:payload});
//         }
//         else
//             resp.json({ status: false, msg: "**Invalid Token" });
//     }
//     catch (err) {
//         resp.json({ status: false, msg: err.message });
//         return;
//     }

// }
// module.exports = { validateToken };





let jwt = require("jsonwebtoken");

function validateToken(req, resp, next) {
    let fulltoken = req.headers["authorization"];

    // Added this condition to prevent undefined.split() error
    if (fulltoken == null) {
        return resp.json({ status: false, msg: "Token not received" });
    }

    let ary = fulltoken.split(" ");

    try {
        let TokenValidObj = jwt.verify(ary[1], process.env.SEC_KEY);

        console.log("********" + JSON.stringify(TokenValidObj));

        if (TokenValidObj != null) {
            // const payload = jwt.decode(ary[1]);
            // console.log("*****"+payload+"******");
            next();
        }
        else {
            resp.json({ status: false, msg: "**Invalid Token" });
        }
    }
    catch (err) {
        resp.json({ status: false, msg: err.message });
        return;
    }
}

module.exports = { validateToken };
