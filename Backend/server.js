require('dotenv').config();
const  app=require("./src/app");
const initSocketServer=require("./src/sockets/socket.server")
const httpServer=require("http").createServer(app);
const connectdb=require("./src/db/db")

connectdb()
initSocketServer(httpServer);

httpServer.listen(3000,(req,res)=>{
    console.log("Server is listening on port 3000");
})