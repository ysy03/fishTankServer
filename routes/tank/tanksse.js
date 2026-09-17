const {Tank,Alert} = require('../../models');

const sensorState = new Map();//최고온도,최저온도 저장
const clients = new Map();//탱크 연결
const tankcache = new Map();//탱크 정보
const TempalertState = new Map();//알림 지정
const WqalertState = new Map();
const commandState = new Map();

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


async function sendToUser(device_id,data){
    let tank = tankcache.get(device_id);
    if(!clients.has(device_id)){
        return;
    }
    if (!tank) {
        console.log(`어항 설정 없음: ${device_id}`);
        const exTank = await Tank.findOne({where:{device_id}});
        if(!exTank){
            console.log('해당 어항이 저장되어있지 않습니다.');
            return;
        }  
        addTank({
            device_id,
            min_temp:23,
            max_temp:25,
            normal_waterquality:250,
            warning_waterquality:700
        })
        tank = tankcache.get(device_id);
    }
    if(tank.min_temp > data.temperature){
        inspectTemp(device_id,'temp','dangerous','low')
    }else if(tank.max_temp < data.temperature){
        inspectTemp(device_id,'temp','dangerous','high');
    }else{
        inspectTemp(device_id,'temp','normal',null);
    }
    if(tank.warning_waterquality < data.water_quality ){
        inspectWQ(device_id,'waterquality','dangerous');
    }else {
        inspectWQ(device_id,'waterquality','normal');
    }
    sendSSE(device_id,{
        type:'sensor',
        data
    })
}



async function inspectTemp(device_id, type, current_state, tempLevel) {
    let state = TempalertState.get(device_id);

    const alert_at = new Date().now;
    const oneHour = 60 * 60 * 1000;
    if (current_state === 'dangerous') {
        if(state.temp_state == 'normal'){
            await Alert.create({
            device_id,
            type:type,                                                                                                                                                                                                                                                                                                                              
            status:tempLevel,
            detail:{
                'started_at':alert_at
            }
        })
        state.temp_state = 'dangerous';
        state.temp_time = alert_at
        sendSSE(device_id,{
            type:type,
            data: tempLevel == 'low' ? 'low' : 'high'
        })}
        else{
            if(alert_at - state.temp_time > oneHour){
                sendSSE(device_id,{
                    type:type,
                    data: tempLevel == 'low' ? 'low' : 'high'
                })
            }
        }
        return;
        
    }

    // 정상 상태
    else{

        // 이미 정상이면 할 거 없음
        if (state.temp_state === 'normal') {
            state.temp_pending_count = 0;
            return;
        }

        // 정상 상태가 연속으로 들어오는지 확인
        state.temp_pending_count++;

        if (state.temp_pending_count < 10) {
            return;
        }

        // 10번 연속 정상 → 기존 알림 종료 처리
        const alertTemp = await Alert.findOne({
            where: {
                device_id,
                type: 'temp',
            },
            order: [['created_at', 'DESC']]
        });

        if (alertTemp) {
            state.temp_state = 'normal';
            const ended_at= new Date().now;
            await alertTemp.update({
                detail: {
                    ...alertTemp.detail,
                    'ended_at':ended_at
                }
            });
        }
    }
}
    


async function inspectWQ(device_id,type,current_state) {
    const state = WqalertState.get(device_id);
    if(current_state === 'dangerous'){
        if(state.waterquality_state === 'dangerous'){
            state.wq_pending_count = 0;
            return;
        }
        await Alert.create({
            device_id,
            type: 'waterquality',
            status: current_state,
            detail: {
                
            }
        });
        sendSSE(device_id,{
            type:'waterquality',
            data:'수질이 이상해요'
        })
        state.waterquality_state = 'dangerous'
    }else if(current_state == 'normal'){
        if(state.waterquality_state == 'normal'){
            state.wq_pending_count = 0;
            return;
        }
        state.wq_pending_count++;
        if(state.wq_pending_count > 10){
            const alertWq = await Alert.findOne({
                where:{
                    device_id,
                    type:'waterquality',
                },
                order: [['created_at', 'DESC']]
            })
            if(alertWq){
                const durationSeconds = Math.floor(
                    (Date.now() - new Date(alertWq.created_at).getTime()) / 1000
                );
                await alertWq.update({
                    detail:{
                        duration:durationSeconds
                    }
                })
            }
            state.waterquality_state = 'normal'
            state.wq_pending_count = 0
        }
    }
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
            TempalertState.set(tank.device_id,{
                temp_state:'normal',
                temp_time:null,
                temp_pending_count:0,
            });
            WqalertState.set(tank.device_id,{
                wq_state:'normal',
                wq_pending_count:0
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
    TempalertState.set(tank_info.device_id,{
        temp_state:'normal',
        temp_pending_count:0,
    }),
    WqalertState.set(tank_info.device_id,{
        wq_state:'normal',
        wq_pending_count:0
    })
}

function updateTankcache(tank_info){
    console.log(tank_info);
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
    updateTankcache,
    resetSensorState,
    sendSSE,
    addTank,
    sensorState,
    commandState
}