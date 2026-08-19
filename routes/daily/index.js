const app = require('express');
const devAuthMiddleware = require('../auth/devauthMiddleware');
const {Tank,Daily,Feederlog,Waterchangelog} = require('../../models');
const { Op, col,fn } = require('sequelize');
const authMiddleware = require('../auth/authMiddleware');
const router = app.Router();

router.get('/',authMiddleware, async(req,res)=>{
    try {
        const {day,device_id = 'SS501'} = req.query;
        const selected_day = new Date(day);
        selected_day.setHours(0,0,0,0);
        const {user_id} = req.user;//유저 정보 가져옴
        if(!day){
            return res.status(400).json({message:'날짜를 입력해주세요'})
        }
        const today = new Date();
        today.setHours(0,0,0,0);
        if(selected_day >= today){
            return res.status(200).json({exist:false,message:'아직 기록한 적이 없는 날짜입니다.'})
        }
        const tank = await Tank.findOne({
            where:{
                user_id,
                device_id
            }
        })
        if(!tank){
            return res.status(403).json({message:'유저가 등록한 어항이 아닙니다.'})
        }
        const next_day = new Date(selected_day);
        next_day.setDate(next_day.getDate()+1);
        next_day.setHours(0,0,0,0);//날짜 지정
        const[daily,Feeding,waterChange] = await Promise.all([
            Daily.findOne({
                where:{
                    device_id,
                    created_at:{
                        [Op.gte]:selected_day,
                        [Op.lt]:next_day
                    }
                }
            })
            ,//수질
            Feederlog.findAll({
                where:{
                    device_id,
                    feed_time:{
                        [Op.gte]:selected_day,
                        [Op.lt]:next_day
                    }
                },
                order:[
                    ['feed_time','ASC'],
                ]
            }),//먹이
            Waterchangelog.findAll({
                where:{
                    device_id,
                    started_at:{
                        [Op.gte]:selected_day,
                        [Op.lt]:next_day
                    }
                }
            })
        ])

        if(!daily){
            return res.status(200).json({exist:false,message:'기록된 정보가 없습니다.'})
        }

        return res.status(200).json({exist:true,daily,waterChange,Feeding})
        /**
         1번 일지 정보가 들어온다.
         2번 일지에 맞는 정보(온도/물상태/먹이지급 상태/물갈이 정보)를 가져온다
         3번 제출한다.
         */
    } catch (error) {
        console.error(error.message);
        return res.status(error.status||500).json({message:error.message||'서버에 오류가 발생하였습니다.'})
    }
})

module.exports = router;