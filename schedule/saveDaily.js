const cron = require('node-cron');
const {Sensor,Daily} = require('../models');
const {fn,col,Op } = require('sequelize');
function savedaily(){
    cron.schedule("0 0 * * *",async ()=>{
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        const start = new Date(yesterday);
        start.setHours(0,0,0,0);
        const end = new Date(yesterday.getDate()+1);
        end.setHours(0,0,0,0);
        try {
            const results = await Sensor.findAll({
                attributes:[
                    'user_id',
                    'device_id',
                    [fn('AVG',col('temperature')),'avgTemp'],
                    [fn('MAX',col('temperature')),'maxTemp'],
                    [fn('MIN',col('temperature')),'minTemp'],
                    [fn('AVG',col('water_quality')),'avgWaterQuality']
                ],
                where:{
                    measured_at:{
                        [Op.gte]:start,
                        [Op.lt]:end
                    }
                },
                group:['user_id','device_id'],
                raw:true
            })
            if(results.length === 0){
                console.log('어제 기록한 내용이 없습니다.');
                return;
            }
            const resultDatas = results.map(result=>({
                user_id:result.user_id,
                min_temperature:result.minTemp,
                max_temperature:result.maxTemp,
                avg_temperature:result.avgTemp,
                water_quality:result.avgWaterQuality,
                daily:start
            }))
            
            await Daily.bulkCreate(resultDatas);

        } catch (error) {
           console.error('일일 기록 저장 실패',error); 
        }
    },{timezone:'Asia/Seoul'})
}

module.exports = savedaily;