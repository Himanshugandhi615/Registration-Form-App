const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_NAME,{useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    console.log("connected successfully");
}).catch((err)=>{
    console.log("No connection");
});