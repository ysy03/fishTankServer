const {Sensor} = require('../models');


function SensorSimulation(){
    let temperature = 24.0;
    let water_quality = 250;

    let randomPlus_tem = Math.random() > 0.5 ? + 1 : -1;
    setInterval(async()=>{
        temperature = 24.0;
        randomPlus_tem = Math.random() > 0.5 ? + 1 : -1;
        temperature = temperature + randomPlus_tem*Math.random();
        temperature = Number(temperature.toFixed(1))
        await Sensor.create({
            device_id:'TEST',
            user_id:'5',
            temperature,
            water_quality:Math.floor(water_quality + Math.random()*20)
        })
    },10000)

}

module.exports = SensorSimulation;