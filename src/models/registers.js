const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//schema creation
const employeeSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});

//generating tokens
//also a middleware
/*
note- jb bhi hm instance ke sath work krte hai tb hm .methods ka use krte hai
or agr hm directly collection ke sath use kr rhe hote toh hm use krte static
*/
employeeSchema.methods.generateAuthToken = async function(){
    try{ 
        console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        console.log(token);
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    }catch(err){
        res.send("the error part"+err);
        console.log("the error part"+err);
    }
}



//converting password into hash
//middleware for passwordhash
/*
pre("save") means save() ko call krne se phle
post("save") means save()ko call krne ke baad 
*/
employeeSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10); 
        this.confirmpassword=await bcrypt.hash(this.password,10);
    }
    next();
})

//collection creation
const Register = new mongoose.model("Register",employeeSchema);
module.exports=Register; 

