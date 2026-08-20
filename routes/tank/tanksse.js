
const sensorState = new Map();
const clients = new Map();

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
    const userClients = clients.get(device_id);
    if(!userClients) {
        console.log('저장한 유저 없음')
        return;
    }
    console.log("전송 데이터:", data);
    const message = `data: ${JSON.stringify(data)}\n\n`

    userClients.forEach(client => {
        console.log('데이터 추가');
        client.write(message);
    });
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


module.exports = {
    addClients,
    removeCLients,
    sendToUser,
    updateSensor,
    resetSensorState,
    sensorState
}