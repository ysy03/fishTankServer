const app = require('express');
const devAuthMiddleware = require('../auth/devauthMiddleware');
const {Tank,Daily,Sensor,Feederlog,Waterchangelog} = require('../../models');
const { Op, col,fn } = require('sequelize');
const router = app.Router();

router.get('/',devAuthMiddleware, async(req,res)=>{
    try{
        const {daily} = req.query;
        const start = new Date(daily);
        start.setHours(0,0,0,0);
        const end = new Date(start);
        end.setDate(end.getDate()+1);
        end.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (!daily) {
            return res.status(400).json({
                message: '날짜를 입력해주세요.'
            });
        }
        if(today.getTime() <= start.getTime()){
            
            return res.status(404).json({message:'데이터가 존재하지 않습니다.'})
        }
        const tank = await Tank.findOne({
            where:{
                user_id:req.user.user_id
            }
        })
        if(!tank){
            return res.status(400).json({
                message:'저장한 어항이 존재하지 않습니다.'
            })
        }
        let day;
        day = await Daily.findOne({
            where:{
                user_id:req.user.user_id,
                daily:{
                    [Op.gte]:start,
                    [Op.lt]:end
                }
            }
        })
        if(!day)
        if(!day&&today.getTime() < start.getTime()){
            let message;
            const result = await Sensor.findOne({
                attributes:[
                    'user_id',
                    'device_id',
                    [fn('AVG',col('temperature')),'avgTemp'],
                    [fn('MAX',col('temperature')),'maxTemp'],
                    [fn('MIN',col('temperature')),'minTemp'],
                    [fn('AVG',col('water_quality')),'avgWaterQuailty']
                ],
                where:{
                    user_id:req.user.user_id,
                    measured_at:{
                        [Op.gte]:start,
                        [Op.lt]:end
                    }
                },
                group:['user_id','device_id'],
                raw:true
            })
            if(!result){
                console.log('어제 기록한 내용이 없습니다.');
                return res.status(400).json({message:'데이터를 불러오는 것이 실패하였습니다.'});
            }
            const resultData = await Daily.create({
                user_id:result.user_id,
                min_temperature:result.minTemp,
                max_temperature:result.maxTemp,
                avg_temperature:result.avgTemp,
                water_quality:result.avgWaterQuailty,
                daily:start
            })
            day = resultData;
        }
        const Feed = await Feederlog.findAll({
            where:{
                device_id:tank.device_id,
                feed_time:{
                    [Op.gte]:start,
                    [Op.lt]:end
                }
            }
        })
        const waterChange = await Waterchangelog.findAll({
            where:{
                device_id:tank.device_id,
                started_At:{
                    [Op.gte]:start,
                    [Op.lt]:end
                }
            }
        })
        return res.status(200).json({Feed,waterChange,day});
    }catch(error){
        console.error('일일 기록 조회 실패:', error);
        return res.status(error.status||500).json({message:error.message||'에러 메세지가 발생하였습니다.'});
    }
})

module.exports = router;