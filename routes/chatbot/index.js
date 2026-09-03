const app = require('express');
const devAuthMiddleware = require('../auth/devauthMiddleware');
const router = app.Router();
const {ChatbotRoom,ChatbotMessage, sequelize} = require('../../models');
const { GenerateResponse } = require('./chatbotSetting');
const authMiddleware = require('../auth/authMiddleware');


router.post('/',authMiddleware,async (req,res)=>{
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

router.get('/rooms/:id',authMiddleware,async(req,res)=>{
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
    let t;
    try {
        t = await sequelize.transaction();
        const {id} = req.params;
        const {user_id} = req.user;
        const {message} = req.body;
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
        const response = await GenerateResponse(message);
        if(!response){
            const error = new Error('답변이 생성되지 않았습니다.');
            error.status = 400;
            throw error
        }//답변 만들기 실패할 경우
        
        const [userMessage,modelMessage] = await Promise.all([
            ChatbotMessage.create({
                chatbotroom_id:id,
                user_id,
                message,
                role:'user'
            },{ transaction : t }),//유저 질문
            ChatbotMessage.create({
                chatbotroom_id:id,
                user_id,
                message:response,
                role:'model'
            },{ transaction : t})
        ])
        await t.commit();
        console.log(modelMessage);
        return res.status(200).json({message:response});
    } catch (error) {
        if(t && !t.finished){
            await t.rollback();
        }
        console.error('챗봇 라우터 오류:', error);
        return res.status(error.status||500).json({message:error.message || '챗봇 답변 가져오는 것에 실패하였습니다.'})
    }
})

module.exports = router;