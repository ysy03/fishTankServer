const app = require('express');
const devAuthMiddleware = require('../auth/devauthMiddleware');
const router = app.Router();
const {ChatbotRoom,ChatbotMessage} = require('../../models');
const { GenerateResponse } = require('./chatbotSetting');


router.post('/',devAuthMiddleware,async (req,res)=>{
    try {
        const {user_id} = req.user;
        let chatroom = await ChatbotRoom.findOne({where:{user_id}});
        if(!chatroom){
            chatroom = await ChatbotRoom.create({user_id});
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
        const chatbotroom = await ChatbotRoom.findOne({
            where:{
                chatbotroom_id:id,
                user_id
            }
        })
        if(!chatbotroom){
            return res.status(403).json({message:'채팅방 주인이 아닙니다.'})
        }
        const message = await ChatbotMessage.findAll({
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
        console.log(message);
        const chatbotroom = await ChatbotRoom.findOne({
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
        const userMessage = await ChatbotMessage.create({
            chatbotroom_id:id,
            user_id,
            message,
            role:'user'
        })
        //제미나이 나 chatgpt에서 답글 가져온 후
        const response = await GenerateResponse(message);
        const modelMessage = await ChatbotMessage.create({
            chatbotroom_id:id,
            user_id,
            message:response,
            role:'model'
        })
        console.log(modelMessage);
        return res.status(200).json({response,modelMessage,userMessage});
    } catch (error) {
        console.error('챗봇 라우터 오류:', error);
        return res.status(error.status||500).json({message:error.message&&'챗봇 답변 가져오는 것에 실패하였습니다.'})
    }
})

module.exports = router;