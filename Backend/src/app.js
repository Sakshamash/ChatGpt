const express=require('express');
const cookieparser=require('cookie-parser');
const cors =require('cors');
//Routes
const authRoutes=require("./routes/auth.routes")
const chatRoutes=require("../src/routes/chat.routes")

const app=express();

//using middlewares
app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))



//using routes
app.use("/auth",authRoutes)
app.use("/chat",chatRoutes);

module.exports=app