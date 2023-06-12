const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async(req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
        console.log(verifyUser);
        const user = await Register.findOne({_id:verifyUser._id});
        req.token = token;
        req.user = user;
        console.log(user.firstname);
        next();//interview question what is next?
    }catch(err){
        console.log("To access this page please login first");
        res.status(401).send(err);
    }
}
module.exports = auth;