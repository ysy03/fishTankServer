const app = require('express');
const devAuthMiddleware = require('../auth/devauthMiddleware');
const router = app.Router();
const {chatbotRoom,chatbotMessage} = require('../../models');

router.post('/',devAuthMiddleware,async (req,res)=>{
    try {
        const {user_id} = req.user;
        let chatroom = await chatbotRoom.findOne({where:{user_id}});
        if(!chatroom){
            chatroom = await chatbotRoom.create({user_id});
        }
        return res.status(200).json({chatid:chatroom.chatbotroom_id})
    } catch (error) {
        return res.status(error.status||500).json({message:'챗봇 생성에 실패하였습니다.'});
    }
})

router.get('/rooms/:id',devAuthMiddleware,async(req,res)=>{
    try {
        const {id} = req.params;
        const {user_id} = req.user;
        const chatbotroom = await chatbotRoom.findOne({
            where:{
                chatbotroom_id:id,
                user_id
            }
        })
        if(!chatbotroom){
            return res.status(403).json({message:'채팅방 주인이 아닙니다.'})
        }
        const message = await chatbotMessage.findAll({
            where:{
                chatbotroom_id:id,
            },
            order:[
                ['created_at','DESC']
            ],
            limit:20
        })
        return res.status(200).json(message.reverse());
    } catch (error) {
        return res.status(error.status||500).json({message:'가져오는 것에 실패하였습니다.'})
    }
})

router.post('/rooms/:id/message',devAuthMiddleware,async(req,res)=>{
    try {
        const {id} = req.params;
        const {user_id} = req.user;
        const {message} = req.body;
        const chatbotroom = await chatbotRoom.findOne({
            where:{
                chatbotroom_id:id,
                user_id
            }
        })
        if(!chatbotroom){
            return res.status(403).json({message:'채팅방 주인이 아닙니다.'})
        }
        if(!message || !message.trim()){
            return res.status(400).json({message:'답변을 제출해 주세요'});
        }
        const userMessage = await chatbotMessage.create({
            chatbotroom_id:id,
            user_id,
            message,
            role:'user'
        })
        //제미나이 나 chatgpt에서 답글 가져온 후
        const response = 'apple'
        const modelMessage = await chatbotMessage.create({
            chatbotroom_id:id,
            user_id,
            message:response,
            role:'model'
        })

        return res.status(200).json({response,modelMessage,userMessage});
    } catch (error) {
        return res.status(error.status||500).json({message:'챗봇 답변 가져오는 것에 실패하였습니다.'})
    }
})
