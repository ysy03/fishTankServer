const WebSocket = require('ws');
const { Op } = require('sequelize');
const {Tank,Waterchangelog} = require('../models/index');
const {commandState} = require('../routes/tank/tanksse')
function makeTime(){
    const now = new Date();
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {today,tomorrow,now};

}

async function waterChange(ws,devices)  {

    try {
        const{today,tomorrow,now} = makeTime();
        // 1. Flutter 사용자의 어항 찾기
        const tank = await Tank.findOne({
            where: {
                user_id: ws.user_id
            }
        });

        //저장된 어항이 없을 때
        if (!tank) {

            ws.send(JSON.stringify({
                type: 'waterChangeResult',
                success: false,
                message: '어항을 찾을 수 없습니다.'
            }));

            return;
        }
        //해당 어항에 명령이 수행 중일때
        if (commandState.has(tank.device_id)) {
            ws.send(JSON.stringify({
                type: 'waterChangeResult',
                success: false,
                message: '다른 명령 진행 중입니다.'
            }))
            return;
        }
        //이미 당일 환수 기록이 있을 때
         const waterChangelog = await Waterchangelog.findOne({
            where:{
                device_id:tank.device_id,
                started_at:{
                    [Op.gte]:today,
                    [Op.lt]:tomorrow
                }
            }
        })
        if( waterChangelog&& waterChangelog.status == true){
            ws.send(JSON.stringify({
                type: 'waterChangeResult',
                success: false,
                message: '먹이 지급이 이미 완료되어있습니다.'
            }));

            return;
        }

        // 2. 해당 어항의 IoT WebSocket 찾기
        const deviceWs = devices.get(
            tank.device_id
        );


        // IoT 연결 확인
        if (
            !deviceWs ||
            deviceWs.readyState !== WebSocket.OPEN
        ) {

            ws.send(JSON.stringify({
                type: 'waterChangeResult',
                success: false,
                message: 'IoT가 연결되어 있지 않습니다.'
            }));

            return;
        }
        commandState.set(tank.device_id, {
            type: 'waterChange',
            status: 'pending'
        });

        // 3. IoT에게 먹이 지급 명령
        deviceWs.send(
            JSON.stringify({
                type: 'waterChange'
            })
        );
        if(waterChangelog){
            await Waterchangelog.update({status:null,started_at:now},{
                where:{
                    device_id:tank.device_id,
                    started_at:{
                        [Op.gte]:today,
                        [Op.lt]:tomorrow
                    }
                }
            })
        }else{
            await Waterchangelog.create({
                device_id:tank.device_id,
                started_at:now
            })
        }

        console.log(
            `${tank.device_id} 먹이 지급 명령 전송`
        );


    } catch (error) {

        console.error(
            '먹이 지급 명령 오류:',
            error
        );


        // Flutter 연결이 살아있으면 오류 전달
        if (ws.readyState === WebSocket.OPEN) {

            ws.send(JSON.stringify({
                type: 'waterChangeResult',
                success: false,
                message: '먹이 지급 요청 처리 중 오류가 발생했습니다.'
            }));

        }

    }
}

async function waterChangeResult(ws, data, users) {
    try {
        const device_id = ws.device_id;
        const success = data.success;

        console.log(`${device_id} 환수 결과: ${success}`);

        if (!device_id) {
            console.log('device_id가 없습니다.');
            return;
        }

        if (typeof success !== 'boolean') {
            console.log('잘못된 success 값:', success);
            return;
        }

        // 진행 중인 명령 확인
        const command = commandState.get(device_id);
        console.log(`${command}/${device_id}`);
        if (!command) {
            console.log('진행 중인 명령이 없습니다.');
            return;
        }

        if (command.type !== 'waterChange') {
            console.log('현재 명령이 waterChange가 아닙니다.');
            return;
        }

        // 진행 중인 환수 로그 조회
        const waterLog = await Waterchangelog.findOne({
            where: {
                device_id,
            },
            order: [
                ['started_at', 'DESC']
            ]
        });

        if (!waterLog || waterLog.status !== null) {
            console.log('진행 중인 환수 로그가 없습니다.');

            commandState.delete(device_id);
            return;
        }

        // 결과 저장
        await waterLog.update({
            end_at: new Date(),
            status: success
        });

        // IoT에서 결과가 왔으므로 명령 종료
        commandState.delete(device_id);

        console.log(`${device_id} 환수 명령 종료`);

        // device_id에 해당하는 사용자 찾기
        const tank = await Tank.findOne({
            where: {
                device_id
            }
        });

        if (!tank) {
            console.log('해당 device의 어항이 없습니다.');
            return;
        }

        console.log('결과 전송 대상 user_id:', tank.user_id);
        console.log('현재 연결된 users:', [...users.keys()]);

        const userWs = users.get(tank.user_id);

        if (!userWs) {
            console.log(
                `user_id=${tank.user_id} Flutter 연결 없음`
            );
            return;
        }

        if (userWs.readyState !== WebSocket.OPEN) {
            console.log(
                `user_id=${tank.user_id} WebSocket 연결 상태가 OPEN이 아님`
            );
            return;
        }

        // 해당 사용자에게만 결과 전송
        userWs.send(JSON.stringify({
            type: 'waterChangeResult',
            success,
            message: success
                ? '환수가 완료되었습니다.'
                : '환수에 실패했습니다.'
        }));

        console.log(
            `user_id=${tank.user_id}에게 환수 결과 전송`
        );

    } catch (error) {
        console.error(
            '환수 결과 처리 오류:',
            error
        );
    }
}
module.exports = {
    waterChange,
    waterChangeResult
}