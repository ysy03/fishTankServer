const { Sequelize, Op } = require('sequelize');
const {Sensor, WaterQuality, Daily,Tank} = require('../../models');
const {sensorState, resetSensorState} = require('./tanksse');
const cron = require('node-cron');

module.exports = () =>{
    cron.schedule('*/3 * * * *' , async()=>{
        try {
            const sensorData = [];
            for(const [device_id,state] of sensorState){
                sensorData.push({
                    device_id,
                    temperature:state.temperature,
                    max_temperature:state.max_temp,
                    max_temperature_at:state.max_temp_at,
                    min_temperature:state.min_temp,
                    min_temperature_at:state.min_temp_at
                })
            }
            if (sensorData.length === 0) {
                return;
            }
            await Sensor.bulkCreate(sensorData);
            for(const [device_id] of sensorState){
                resetSensorState(device_id);
            }
        } catch (error) {
            console.log(`온도 저장 실패:${error}`);
        }
    })
    cron.schedule("* * * * *",async ()=>{
        try {
            const waterQualitys = []
            for(const [device_id,state] of sensorState){
                waterQualitys.push({
                    device_id,
                    water_quality:state.water_quality
                })
            }
            if (waterQualitys.length === 0) {
                return;
            }
            await WaterQuality.bulkCreate(waterQualitys)
        } catch (error) {
            console.log(`수질 저장 실페:${error}`)
        }
    }, {
        timezone: 'Asia/Seoul'
    })

    cron.schedule('5 0 * * *',async ()=>{
        try {
            const today = new Date();
            today.setHours(0,0,0,0);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate()-1);
            const tanks = await Tank.findAll({});
            const datas = await Promise.all(
                tanks.map(async (tank)=>{
                    const [temp_data,waterquality_data] = await Promise.all([
                        Sensor.findOne({
                            attributes:[
                                [Sequelize.fn('MAX',Sequelize.col('temperature')),'temp_max'],
                                [Sequelize.fn('MIN',Sequelize.col('temperature')),'temp_min'],
                                [Sequelize.fn('AVG',Sequelize.col('temperature')),'temp_avg']
                            ],
                            where:{
                                device_id:tank.device_id,
                                created_at:{
                                    [Op.gte]:yesterday,
                                    [Op.lt]:today
                                }
                            },
                            raw:true
                        }),
                        WaterQuality.findOne({
                            where:{
                                device_id:tank.device_id,
                                created_at:{
                                    [Op.gte]:yesterday,
                                    [Op.lt]:today
                                }
                            },
                            raw:true
                        }),
        
                    ])
                    if( (temp_data.temp_max == null ||
                        temp_data.temp_min == null||
                        temp_data.temp_avg == null
                    )  || !waterquality_data){
                        return null;
                    }else{
                        return {
                            device_id:tank.device_id,
                            temp_max:temp_data.temp_max,
                            temp_min:temp_data.temp_min,
                            temp_avg:temp_data.temp_avg,
                            water_quality:waterquality_data.water_quality,
                            created_at:yesterday
                        }
                    }
                })
            )
            await Daily.bulkCreate(datas.filter(Boolean))
        } catch (error) {
            console.error(error)
        }
        
    })

}