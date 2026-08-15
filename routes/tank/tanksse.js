const {Tank} = require('../../models');

const sensorState = new Map();
const clients = new Map();
const tankcache = new Map();
const alertState = new Map();

function addClients(device_id,res){
    console.log('들어옴');
    if(!clients.has(device_id)){
        clients.set(device_id,new Set());
    }

    clients.get(device_id).add(res);
    console.log('현재 연결 수:', clients.get(device_id).size);
}

function removeCLients(device_id,res){
    const userClient = clients.get(device_id);
    if(!userClient){
        return;
    }

    userClient.delete(res);

    if(userClient.size == 0){
        clients.delete(device_id);
    }

}


function sendToUser(device_id,data){
    const tank = tankcache.get(device_id);
    if (!tank) {
        console.log(`어항 설정 없음: ${device_id}`);
        return;
    }
    if(tank.min_temp > data.temperature){
        inspectTemp(device_id,'dangerous','low')
    }else if(tank.max_temp < data.temperature){
        inspectTemp(device_id,'dangerous','high');
    }else{
        inspectTemp(device_id,'normal',null);
    }
    sendSSE(device_id,{
        type:'sensor',
        data
    })
}

async function inspectTemp(device_id,current_state,tempLevel){
    const state = alertState.get(device_id);
    const current_state = state.temp_state;
    if(state == tempState){
        return;
    }
    else(
        if()
    )
}

function updateSensor(device_id,temperature,water_quality){
    let date = new Date();
    let state = sensorState.get(device_id);

    if(!state){
        state = {
            water_quality,
            temperature,

            max_temp:temperature,
            max_temp_at:date,

            min_temp:temperature,
            min_temp_at:date
        }
        sensorState.set(device_id,state);
        return state;
    }

    state.temperature = temperature;
    state.water_quality = water_quality;

    if(temperature > state.max_temp){
        state.max_temp = temperature;
        state.max_temp_at = date
    }

    if(temperature < state.min_temp){
        state.min_temp = temperature;
        state.min_temp_at = date;
    }

    return state;
    
}

function resetSensorState(device_id) {
    const state = sensorState.get(device_id);

    if (!state) {
        console.log('초기화할 센서가 없습니다.');
        return;
    }

    const now = new Date();

    state.max_temp = state.temperature;
    state.max_temp_at = now;

    state.min_temp = state.temperature;
    state.min_temp_at = now;

    return state;
}

async function loadTankCache(){
    try {
        const tanks = await Tank.findAll({raw:true});
        for(const tank of tanks){
            tankcache.set(tank.device_id,{
                min_temp:tank.min_temp,
                max_temp:tank.max_temp,
                normal_waterquality:tank.normal_waterquality,
                warning_waterquality:tank.warning_waterquality
            })
            alertState.set(tank.device_id,{
                temp_state:'normal',
                waterquality_state:'normal',
                feed_state:'normal',
                waterchange_state:'normal'
            })
        }
    } catch (error) {
        console.log(`어항 정보 캐시 오류 ${error}`);
    }
}


function addTank(tank_info){
    tankcache.set(tank_info.device_id,{
        min_temp:tank_info.min_temp,
        max_temp:tank_info.max_temp,
        normal_waterquality:tank_info.normal_waterquality,
        warning_waterquality:tank_info.warning_waterquality
    }),
    alertState.set(tank.device_id,{
        temp_state:'normal',
        waterquality_state:'normal',
        feed_state:'normal',
        waterchange_state:'normal'
    })
}

function updateTankcache(tank_info){
    tankcache.set(tank_info.device_id,{
        min_temp:tank_info.min_temp,
        max_temp:tank_info.max_temp,
        normal_waterquality:tank_info.normal_waterquality,
        warning_waterquality:tank_info.warning_waterquality
    })
}

function sendSSE(device_id, data) {
    const userClients = clients.get(device_id);

    if (!userClients) {
        return;
    }

    const message = `data: ${JSON.stringify(data)}\n\n`;

    userClients.forEach(client => {
        client.write(message);
    });
}


module.exports = {
    addClients,
    removeCLients,
    sendToUser,
    updateSensor,
    resetSensorState,
    sensorState
}