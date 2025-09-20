const mongoose=require("mongoose");

async function connectdb(){
    try{
 await mongoose.connect(process.env.MONGO_URL);
 console.log("connected to db");
}catch(err){
    console.error("Error Connecting to MongoDB:",err);
}

}
module.exports=connectdb;