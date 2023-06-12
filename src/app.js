require('dotenv').config();
const express = require("express");
const app = express();
const port  = process.env.PORT | 3000;
require("./db/conn");
const hbs = require("hbs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Register = require("./models/registers");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));//for form data fetching

//to set view engine
app.set("view engine","hbs");
app.set("views",path.join(__dirname,"../templates/views"));

//register path to partials
hbs.registerPartials(path.join(__dirname,"../templates/partials"));

console.log(process.env.SECRET_KEY);

app.get("/",(req,res)=>{
    res.render("index");
})
app.get("/secret",auth,(req,res)=>{
    //console.log(`This is the cookie ${req.cookies.jwt}`);
    res.render("secret");
})
app.get("/logout",auth,async(req,res)=>{
    try{
        //console.log(req.user);
        //console.log(req.token);

        //for single logout
        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token !== req.token
        }) 

        //logout from all device
        //req.user.tokens=[];


        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.render("login");
    }catch(err){
        res.status(500).send(err);
    }
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/register",(req,res)=>{
    res.render("register");
})

//create a new user in our database
app.post("/register",async(req,res)=>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if(password===cpassword){
            const registerEmployee = new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                age:req.body.age,
                phone:req.body.phone,
                password:password,
                confirmpassword:cpassword
            });
            console.log("the success part "+registerEmployee);

            const token = await registerEmployee.generateAuthToken();
            console.log("token part "+token);

            //The res.cookie() function is used to set the cookie name to value
            //The value parameter may be a string or object converted into JSON
            res.cookie("jwt",token,{
                expires:new Date(Date.now()+600000),
                httpOnly:true
            });
            console.log("cookie created");

            const registered = await registerEmployee.save();
            console.log("the page part "+registered);

            res.status(201).render("index"); 
        }else{
            res.send("Password are not matching")
        }
    }catch(err){
        res.status(400).send(err);
        console.log("error part page");
    }
})

//login validation
app.post("/login",async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const useremail =await Register.findOne({email:email});
        console.log(useremail);

        const isMatch = await bcrypt.compare(password,useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("token part "+token);
        res.cookie("jwt",token,{
            expires:new Date(Date.now()+600000),
            httpOnly:true,
            //secure:true
        });  

        if(isMatch)
        {
            res.status(201).render("index");
        }
        else
        {
            res.send("Invalid password details");
        }
    }catch(err){
        res.status(400).send("Invalid login details")
    }
})




app.listen(port,()=>{
    console.log(`app listening at port ${port}`);
})