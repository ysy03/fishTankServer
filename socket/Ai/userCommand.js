const {Tank} = require('../../models/index');

async function speciesCommand(ws,ai) {
    try {
        console.log(ai);
        const tank = await Tank.findOne({
            where:{
                user_id:ws.user_id
            }
        })
        if(!tank){
            console.log('등록된 어항이 없습니다.');
            ws.send(JSON.stringify({
                type:'species_result',
                data:{
                    'message':'등록된 어항이 없습니다.'
                }
            }))
            return;
        }
        if (!ai || ai.readyState !== WebSocket.OPEN) {
            console.log('AI 서버 연결 없음');
            ws.send(JSON.stringify({
                type:'species_result',
                data:{
                    'message':'ai연결 실패하였습니다.'
                }
            }))
            return;
        }
        ai.send(JSON.stringify({
            type:'species',
            device_id:tank.device_id
        }))
    } catch (error) {
        console.error(error);
        ws.send(JSON.stringify({
            type:'species_result',
            data:{
                'message':'서버 오류가 발생하였습니다.'
            }
        }))
    }
}



module.exports = {
    speciesCommand
}