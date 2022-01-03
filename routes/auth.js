const router = require("express").Router();
const User = require("../models/User")
//To prevent password to be stolen install crypto and use as down below
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken")

//var encrypted = CryptoJS.AES.encrypt("Message", "Secret Passphrase");

//var decrypted = CryptoJS.AES.decrypt(encrypted, "Secret Passphrase");

//REGISTER
router.post("/register", async (req, res) => {
    const newUser = new User({
        username : req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
        
    });

    try {
        const saveedUser = await newUser.save();
        res.status(201).json(saveedUser)
    } catch (error) {
        res.status(500).json(error)
    }

})

//LOGIN
router.post("/login", async (req, res) => {
    try{
        const user = await User.findOne({username: req.body.username})
        !user && res.status(401).json("Wrong crendentials!")

        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
        originalPassword !== req.body.password && res.status(401).json("Wrong crendentials!")

        const accessToken = jwt.sign(
            {
            id:  user._id,
            isAdmin: user.isAdmin
            }, 
            process.env.JWT_SEC, 
            { expiresIn: "3d"});

        const { password, ...others } = user._doc;

        res.status(200).json({ ...others, accessToken} );
    }catch(error){
        res.status(500).json(error)
    }
})


module.exports = router;