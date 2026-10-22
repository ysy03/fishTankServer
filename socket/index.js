const webSocket = require('ws');
const { feedresult, feed } = require('./feed');
const { waterChangeResult, waterChange } = require('./waterChange');
const { SpeciesResult, ActivityResult } = require('./Ai/AiResult');
const { speciesCommand, activityCommand } = require('./Ai/userCommand');

const devices = new Map();
const users = new Map();

function connectWs(server){
    const wss = new webSocket.Server({server});
    let ai = null;
    wss.on('connection',(ws)=>{
        ws.on('message',async(message)=>{
            try {
                const data = JSON.parse(message.toString());
                console.log(data);
                if (data.type === 'registerDevice') {

                    // ★ 연결된 ws를 Map에 저장
                    devices.set(data.device_id, ws);
                    ws.clientType = 'device';
                    ws.device_id = data.device_id;

                    console.log(`${data.device_id} 등록`);
                    return;
                }
                if (data.type === 'registerUser') {

                    const oldWs = users.get(data.user_id);
                    console.log(oldWs);
                    if (oldWs && oldWs !== ws) {
                        oldWs.close();
                    }

                    users.set(data.user_id, ws);
                    ws.clientType = 'user';
                    ws.user_id = data.user_id;

                    console.log(`사용자 등록: ${data.user_id}`);
                }
                else if(data.type === 'Ai'){
                    ai = ws;
                    ws.clientType = 'Ai';
                    console.log('ai서버 연결 성공');
                }
                if(ws.clientType == 'device'){
                    switch (data.type){
                        case 'feedResult':
                            feedresult(ws,data,users);
                            break;
                        case 'waterChangeResult':
                            waterChangeResult(ws,data,users);
                            break;
                        default:
                            console.log(
                                `알 수 없는 IoT 메시지: ${data.type}`
                            );
                    }
                    return;

                }
                else if(ws.clientType == 'user'){
                    switch (data.type){
                        case 'feed':
                            feed(ws,devices);
                            break;
                        case 'waterChange':
                            waterChange(ws,devices);
                            break;
                        case 'species':
                            speciesCommand(ws,ai);
                            break;
                        default:
                            console.log(
                                `알 수 없는 Flutter 메시지: ${data.type}`
                            );
                    }
                    return;
                }else if(ws.clientType == 'Ai'){
                    switch (data.type){
                        case 'species_result':
                            SpeciesResult(ws,data,users);
                            break;
                        case 'activity_result':
                            ActivityResult(ws,data,users);
                            break;
                        default:
                            console.log(
                                `알 수 없는 Flutter 메시지: ${data.type}`
                            );
                    }
                }
            } catch (error) {
                console.error(error);
            }
            
        }) 
        ws.on('close', () => {

            // IoT가 끊김
            if (ws.clientType === 'device') {

                devices.delete(
                    ws.device_id
                );

                console.log(
                    `${ws.device_id} IoT 연결 종료`
                );
            }


            // Flutter가 끊김
            else if (ws.clientType === 'user') {

                users.delete(
                    ws.user_id
                );

                console.log(
                    `${ws.user_id} Flutter 연결 종료`
                );
            }
            else if (ai === ws) {
                ai = null;
            }

        });


        // =========================
        // WebSocket 오류
        // =========================
        ws.on('error', (error) => {

            console.error(
                'WebSocket 오류:',
                error
            );

        });   
    })
}

function sendToDevice(deviceId, data) {

    // ★ 위에서 저장한 ws를 가져옴
    const ws = devices.get(deviceId);

    if (!ws) {
        return false;
    }

    if (ws.readyState !== WebSocket.OPEN) {
        return false;
    }

    // ★ 실제 전송
    ws.send(JSON.stringify(data));
    console.log(data);
    return true;
}

module.exports = {
    connectWs,
    sendToDevice
}