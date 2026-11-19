var UsersColRef = require("../models/modelUsers");
var argon2 = require("argon2")  // npm install argon2

async function doSignup(req, resp) {
    try {
        const { emailid, password, utype } = req.body;

        if (!emailid || !password || !utype)
            return resp.json({ status: false, msg: "All feild are required" })

        const existingUser = await UsersColRef.findOne({ emailid: emailid.trim() });

        if (existingUser) { // if user already exists
            return resp.json({ status: false, msg: "Email already Registered" })
        }

        const hashPassword = await argon2.hash(password); // hashing pass

        const userDoc = new UsersColRef({
            emailid: emailid.trim(),
            password: hashPassword,
            utype: utype,
            status: true
        });

        await userDoc.save().then(() => {
            resp.status(200).json({
                status: true,
                msg: "Sign Up successfully"
            })
        }).catch((error) => {
            resp.status(409).json({
                msg: "Conflcit during Signup",
                error: error,
                status: false
            })
        })
    }
    catch(error) {
        console.error("Signup error:", error);

        return resp.status(500).json({
            status: false,
            msg: "Server error during signup"
        });
    }
}

module.exports = { doSignup };