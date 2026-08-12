const {Sensor, WaterQuality} = require('../../models');
const {sensorState, resetSensorState} = require('./tanksse');
const cron = require('node-cron');

module.exports = () =>{
    cron.schedule('*/30 * * * *' , async()=>{
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
    cron.schedule("0 12 * * *",async ()=>{
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
}