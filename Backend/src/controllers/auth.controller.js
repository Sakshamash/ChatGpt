const userModel=require("../models/user.model");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

async function register(req,res) {
    const {FullName:{firstName,lastName},email,password}=req.body;

    const isuserAlreadyExists=await userModel.findOne({email});
    if(isuserAlreadyExists){
        res.status(400).json({message:"User already exists"})
    } 

    const hashedPassword=await bcrypt.hash(password,10)
    const user=await userModel.create({
        FullName:{
            firstName,
            lastName
        },
        email,
        password:hashedPassword
    })


    const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
    
    res.cookie("token",token);

    res.status(201).json({
        message:"User registered successful",
        user:{
            email:user.email,
            _id:user._id,
            FullName:user.FullName
        }
    })
} 

async function loginUser(req,res) {
    
    const {email,password}=req.body

    const user=await userModel.findOne({
        email
    })

    if(!user){
      return res.status(400).json({message:"Invalid Email or password"});
    }

      
        const isPasswordValid=await bcrypt.compare(password,user.password)    

        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid email or Password"})
        }

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET);
    
        res.cookie("token",token);
        

        res.status(200).json({
            message:"Login Successful",
            user:{
                email:user.email,
                _id:user._id,
                FullName:user.FullName
            }
        })
            }

module.exports={
    register,
    loginUser
}