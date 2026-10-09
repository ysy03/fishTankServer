const WebSocket = require('ws');
const { Op } = require('sequelize');
const {Tank,Feederlog} = require('../models/index');
const {commandState} = require('../routes/tank/tanksse')
function makeTime(){
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {today,tomorrow};

}

async function feed(ws, devices) {

    try {
        console.log('들어감');
        const{today,tomorrow} = makeTime();
        // 1. Flutter 사용자의 어항 찾기
        const tank = await Tank.findOne({
            where: {
                user_id: ws.user_id
            }
        });


        if (!tank) {

            ws.send(JSON.stringify({
                type: 'feedResult',
                success: false,
                message: '어항을 찾을 수 없습니다.'
            }));

            return;
        }
        if (commandState.has(tank.device_id)) {
            ws.send(JSON.stringify({
                type: 'feedResult',
                success: false,
                message: '다른 명령 진행 중입니다.'
            }))
            return;
        }

         const feedlog = await Feederlog.findOne({
            where:{
                device_id:tank.device_id,
                feed_time:{
                    [Op.gte]:today,
                    [Op.lt]:tomorrow
                }
            }
        })
        console.log(feedlog);
        if(feedlog&&feedlog.status == true){
            console.log('이미 지급 완료');
            ws.send(JSON.stringify({
                type: 'feedResult',
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
                type: 'feedResult',
                success: false,
                message: 'IoT가 연결되어 있지 않습니다.'
            }));

            return;
        }
        commandState.set(tank.device_id, {
            type: 'feed',
            status: 'pending'
        });

        // 3. IoT에게 먹이 지급 명령
        deviceWs.send(
            JSON.stringify({
                type: 'feed'
            })
        );


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
                type: 'feedResult',
                success: false,
                message: '먹이 지급 요청 처리 중 오류가 발생했습니다.'
            }));

        }

    }
}



async function feedresult(ws, data, users) {

    try {

        // registerDevice에서 저장했던 값
        const device_id = ws.device_id;

        const success = data.success;


        console.log(
            `${device_id} 먹이 지급 결과: ${success}`
        );


        // ==============================
        // 오늘 먹이 지급 로그 처리
        // ==============================

        const now = new Date();
        const {today,tomorrow} = makeTime();


        const feedlog =
            await Feederlog.findOne({

                where: {

                    device_id: device_id,

                    feed_time: {
                        [Op.gte]: today,
                        [Op.lt]: tomorrow
                    }

                }

            });


        if (feedlog) {
            if(feedlog.status == false){
                await feedlog.update({

                    status: success,

                    feed_time: now

                });
            }

        } else {

            // 오늘 로그가 없으면 생성
            await Feederlog.create({

                device_id: device_id,

                status: success,

                feed_time: now

            });

        }


        // ==============================
        // 이 IoT의 사용자 찾기
        // ==============================

        const tank = await Tank.findOne({

            where: {
                device_id: device_id
            }

        });


        if (!tank) {

            console.log(
                `${device_id}에 해당하는 어항 없음`
            );

            return;
        }


        // ==============================
        // Flutter WebSocket 찾기
        // ==============================

        const userWs = users.get(
            tank.user_id
        );
        console.log(users);

        if (
            !userWs ||
            userWs.readyState !== WebSocket.OPEN
        ) {

            console.log(
                `${tank.user_id} Flutter 연결 없음`
            );

            return;
        }
        commandState.delete(tank.device_id);

        // ==============================
        // Flutter에게 최종 결과 전송
        // ==============================
        userWs.send(
            JSON.stringify({

                type: 'feedResult',

                success: success,
                message:'먹이 지급 성공하였습니다.'

            })
        );


        console.log(
            `${tank.user_id}에게 먹이 지급 결과 전송`
        );


    } catch (error) {

        console.error(
            '먹이 지급 결과 처리 오류:',
            error
        );

    }

}


module.exports = {
    feed,
    feedresult
}