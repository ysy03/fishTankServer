const {Tank} = require('../../models/index');

async function ActivityResult(ws,data,users) {
    try {
        console.log('물고기 종과 개수 분석 완료');

        const { device_id } = data;

        const tank = await Tank.findOne({
            where: {
                device_id
            }
        });

        if (!tank) {
            console.log('해당 어항을 찾을 수 없습니다.');
            return;
        }

        const userWs = users.get(tank.user_id);

        if (!userWs || userWs.readyState !== WebSocket.OPEN) {
            console.log('Flutter 클라이언트가 연결되어 있지 않습니다.');
            return;
        }

        userWs.send(JSON.stringify({
            type: 'activity_result',
            data: data.data
        }));

        console.log('Flutter로 종 분석 결과 전송 완료');

    } catch (error) {
        console.error('종 분석 결과 처리 오류:', error);
    }
}

async function SpeciesResult(ws, data, users) {
    try {
        console.log('물고기 종과 개수 분석 완료');
        console.log(data);
        const { device_id } = data;

        const tank = await Tank.findOne({
            where: {
                device_id
            }
        });

        if (!tank) {
            console.log('해당 어항을 찾을 수 없습니다.');
            return;
        }

        const userWs = users.get(tank.user_id);

        if (!userWs || userWs.readyState !== WebSocket.OPEN) {
            console.log('Flutter 클라이언트가 연결되어 있지 않습니다.');
            return;
        }

        userWs.send(JSON.stringify({
            type: 'species_result',
            data: data.data
        }));

        console.log('Flutter로 종 분석 결과 전송 완료');

    } catch (error) {
        console.error('종 분석 결과 처리 오류:', error);
    }
}

module.exports = {
    SpeciesResult,
    ActivityResult
}