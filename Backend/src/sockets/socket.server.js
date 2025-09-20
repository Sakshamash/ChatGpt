const { Server} =require("socket.io");
const cookie=require("cookie")
const jwt=require("jsonwebtoken");
const userModel=require("../models/user.model")
const aiService=require("../services/ai.service");
const messageModel=require("../models/message.model")
const {createMemory,queryMemory}=require("../services/vector.service")

 function initSocketServer(httpserver){

    const io= new Server(httpserver,{})

    io.use(async(socket,next)=>{
        const cookies=cookie.parse(socket.handshake.headers?.cookie);
        if(!cookies.token){
            next(new Error("Authentication Error:No token provided"));
        }

        try {
            const decoded=jwt.verify(cookies.token,process.env.JWT_SECRET);
            const user=await userModel.findById(decoded.id);
            socket.user=user;

            next();
            
        } catch (err) {
            next(new Error("Authenticatiopn error:Invalid TOken"));
        }

    })

    io.on("connection",(socket)=>{
        socket.on("ai-message",async (messagePayload)=>{
            console.log(messagePayload);

            /*
            messagePayload={
            chat:chatid
            content:message text content
            }
            */

                /*BASIC CODE IN START */
    //  const message=await messageModel.create({
    //             chat:messagePayload.chat,
    //             user:socket.user._id,
    //             content:messagePayload.content,
    //             role:"user"
    //         })

    //         const vectors=await aiService.generateVector(messagePayload.content)
  
            //CODE FOR OPTIMIZATION SO CODE RUN FASTER 
            const [message,vectors]=await Promise.all([
                messageModel.create({
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    content:messagePayload.content,
                    role:"user"
                }),
                aiService.generateVector(messagePayload.content),
            ])

          await createMemory({
                vectors,
                messageId:message._id,
                metadata:{
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    text:messagePayload.content
                }
            })
// again it goes to line 91 for optimization
            // const memory=await queryMemory({
            //    queryVector:vectors,
            //     limit:3,
            //     metadata:{ }
            // })
// again it goes to line 62 for optimization
            // await createMemory({
            //     vectors,
            //     messageId:message._id,
            //     metadata:{
            //         chat:messagePayload.chat,
            //         user:socket.user._id,
            //         text:messagePayload.content
            //     }
            // })

            // const chatHistory=(await messageModel.find({chat:messagePayload.chat}).sort({createdAt:-1}).limit(20).lean()).reverse();

            const [memory,chatHistory]=await Promise.all([
                queryMemory({
                   queryVector:vectors,
                   limit:3,
                   metadata:{user:socket.user._id }
               }),
               messageModel.find({chat:messagePayload.chat}).sort({createdAt:-1}).limit(20).lean().then(message=>message.reverse())
            ])

            const stm=chatHistory.map(item=>{
                return{
                    role:item.role,
                    parts:[{text:item.content}]
                }})

                const ltm=[
                    {
                        role:"user",
                        parts:[{text:`
                            these are some previous messages from chats,use them to generate a response
                            
                            ${memory.map(item=>item.metadata.text).join("\n")}`}]
                    }
                ]


            const response=await aiService.generateResponse([...ltm,...stm])
// again it goes to line 130 for optimization
 /*
       const responseMessage=await messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content:response,
                role:"model"
            })

            const responseVectors=await aiService.generateVector(response);

            */

            socket.emit('ai-response',{
                content:response,
                chat:messagePayload.chat
            })

        const [responseMessage,responseVectors]=await Promise.all([
                messageModel.create({
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    content:response,
                    role:"model"
                }),
                aiService.generateVector(response)
            ])

            await createMemory({
                vectors:responseVectors,
                messageId:responseMessage._id,
                metadata:{
                    chat:messagePayload.chat,
                    user:socket.user._id,
                    text:response
                }
            })

        })
    });
}


module.exports=initSocketServer;