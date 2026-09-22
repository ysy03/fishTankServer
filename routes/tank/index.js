const app = require('express');
const authMiddleware = require('../auth/authMiddleware');
const router = app.Router();
const {Sensor,WaterQuality,Tank, Feederlog,Waterchangelog,Alert} = require('../../models');
const { fn, Op, col } = require('sequelize');
const devAuthMiddleware = require('../auth/devauthMiddleware');
const { sendToUser, addClients, removeCLients, updateSensor, updateTankcache, addTank, commandState,sendFeedResult,sendSSE, sendWqResult } = require('./tanksse');

router.get('/',devAuthMiddleware,async(req,res)=>{
    const tankData = await Tank.findAll({where:{user_id:req.user_id}});
    return res.json(tankData);
})

//온도,수질 지정
router.post('/setting',authMiddleware,async(req,res)=>{
    try {
        const {min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality,
            tank_name,
            device_id} = req.body;
        const {user_id} = req.user;
        const response = await Tank.create({
            user_id,
            tank_name,
            device_id,
            min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality
        })
        addTank(response);
        return res.sendStatus(204);
    } catch (error) {
        console.error(error.message);
        return res.status(error.status||500).json({message:'데이터 저장에 실패하였습니다.'})
    }
})

//설정 조회
router.get('/setting/:id',authMiddleware,async(req,res)=>{
    try {
        const{id:device_id} = req.params;
        const tank = await Tank.findOne({where:{device_id}});
        if(!tank){
            return res.status(400).json({message:'데이터를 가져오지 못했습니다.'})
        }
        return res.status(200).json(tank);
    } catch (error) {
        console.error(error.message);
        return res.status(error.status||500).json({message:error.message || '서버에 오류가 발생하였습니다.'});
    }
})

//설정 저장
router.post('/setting/:id',authMiddleware,async(req,res)=>{
    try {
        const {id:device_id} = req.params;
        const {min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality,
            tank_name,
            } = req.body;
            const tank = await Tank.findOne({where:{device_id}});
        if(!tank){
            return res.status(400).json({message:'데이터를 가져오지 못했습니다.'})
        }
        await tank.update({
            min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality,
            tank_name
        })
        updateTankcache({
            device_id,
            min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality
        })
        return res.sendStatus(204)
    } catch (error) {
        console.error(error.message);
        return res.status(error.status||500).json({message:error.message || '서버에 오류가 발생하였습니다.'});
    }
})

//IOT 센서 데이터 보냄
router.post('/Sensor',async(req,res)=>{
    try {
        const {device_id='SS501',temperature,water_quality,sendCommand} = req.body;
        if(temperature == null || water_quality == null){
            return res.status(400).json({message:'데이터 전달에 실패하였습니다.'})
        }

        const tank = await Tank.findOne({where:{device_id:device_id||'TEST'}})
        if(!tank){
            return res.status(400).json({message:'저장한 어항이 없습니다.'})
        }//원래 tank_id를 보내지 못하면 해당 if문이 발생하여 오류 전달 지금은 test아이디인 SS501을 사용 중
        const senseData = updateSensor(device_id,temperature,water_quality);
        sendToUser(device_id,senseData);
        const command = commandState.get(device_id);
        return res.status(200).json({
            command: command ?? null
        }); 
    } catch (error) {
        console.error(error);
        return res.status(error.status||500).json({message:error.message||'서버에 에러가 발생하였습니다.'})
    }

    
})

router.get('/logdata',authMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        const tank = await Tank.findOne({where:{user_id}});
        const today =new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate()+1);
        const [FeedData,waterChange]  = await Promise.all([
            Feederlog.findOne({where:{device_id:tank.device_id,feed_time:{[Op.gte]:today,[Op.lt]:tomorrow}}}),
            Waterchangelog.findOne({where:{device_id:tank.device_id,end_at:{
                [Op.gte] : today,
                [Op.lt]: tomorrow
            }}})
        ])

        const feed = FeedData?.status === true;
        const waterchange = waterChange?.status === true;

        
        return res.json({feed,waterchange});   
    } catch (error) {
        return res.status(error.status||500).json({message:error.message||'에러 메세지가 발생하였습니다.'})
    }
})

//실시간 수온/수질 데이터 받기
router.get('/data',authMiddleware,async (req,res) => {
    try {
        const {user_id} = req.user;
        const tank = await Tank.findOne({where:{
            user_id
        }})
        if(!tank){
            return res.status(400).json({message:'저장한 기기를 발견하지 못했습니다.'})
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        res.flushHeaders();
        addClients(tank.device_id,res);

        req.on('close',()=>{
            removeCLients(tank.device_id,res);
        })
    } catch (error) {
        console.error(error.message)
        return res.status(error.status||500).json({message:error.message||'서버에 오류가 발생하였습니다.'});
    }
    
})

//급여
router.post('/feed',authMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tank = await Tank.findOne({
            where:{
                user_id
            }
        })
        if(!tank){
            return res.status(404).json({message:'탱크를 찾아내지 못했습니다.'})
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
        console.log(`${feedlog}`)
        if(feedlog&&feedlog.status){
            return res.status(409).json({
                message: '오늘 먹이지급을 완료하였습니다.'
            });
        }
        if (commandState.has(tank.device_id)) {
            return res.status(409).json({
                message: '이미 실행 중인 명령이 있습니다.'
            });
        }

        // IoT가 가져갈 명령 저장
        commandState.set(tank.device_id, {
            type: 'feed',
            status: 'pending'
        });
        return res.status(202).json({
            message: '먹이 지급 명령이 등록되었습니다.'
        });

    } catch (error) {
        console.error(error);
        return res.status(error.status||500).json({message:'에러가 발생하였습니다.'});
    }
})

router.get('/event', authMiddleware, async (req, res) => {
    try {
        const { user_id } = req.user;
        const { event } = req.query;
        const tank = await Tank.findOne({
            where: { user_id }
        });

        if (!tank) {
            return res.status(404).json({
                message: '탱크를 찾을 수 없습니다.'
            });
        }

        // SSE 헤더
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        res.flushHeaders();

        // 연결 저장
        addClients(tank.device_id, res);

        console.log('환수 결과 SSE 연결');

        // Flutter가 화면을 나가서 연결이 끊어지면
        
        req.on('close',()=>{
            removeCLients(tank.device_id,res);
            console.log('먹이 지급 결과 SSE 연결 종료');
        });

    } catch (error) {
        console.log(error.message);

        if (!res.headersSent) {
            return res.status(error.status || 500).json({
                message: error.message || '서버에 에러가 발생하였습니다.'
            });
        }
    }
});
router.post('/feed/result', async (req, res) => {
    const { device_id, success = true } = req.body;
    sendFeedResult(device_id, success)
    commandState.delete(device_id);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const feedlog = await Feederlog.findOne({
        where:{
                device_id,
                feed_time:{
                    [Op.gte]:today,
                    [Op.lt]:tomorrow
                }
            }
    })
    console.log(feedlog);
    if(feedlog){
        await feedlog.update({
            status:success,
            feed_time:now
        })
    }else{
        await Feederlog.create({
            device_id,
            status:success
        })
    }
    return res.status(200).json({
        message: '결과 수신 완료'
    });
});

//환수
router.post('/waterchange',authMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tank = await Tank.findOne({
            where:{
                user_id
            }
        })
        if(!tank){
            return res.status(404).json({message:'탱크를 찾아내지 못했습니다.'})
        }

        if (commandState.has(tank.device_id)) {
            return res.status(409).json({
                message: '이미 실행 중인 명령이 있습니다.'
            });
        }
        const tanklog = await Waterchangelog.findOne({where:{
            device_id:tank.device_id,
            end_at:{
                [Op.gte]:today,
                [Op.lt]:tomorrow
            }
        }})
        if(tanklog&&tanklog.status){
            return res.status(409).json({
                message: '오늘 이미 환수를 완료했습니다.'
            });
        } 
        // IoT가 가져갈 명령 저장
        commandState.set(tank.device_id, {
            type: 'waterChange',
            status: 'pending'
        });
        if(!tanklog){
            await Waterchangelog.create({
            device_id:tank.device_id,
            started_at:now,
            status: null
        })}
        else{
            tanklog.update({
                started_at:now,
                status: null
            })
        }
        return res.status(202).json({
            message: '환수 명령이 등록되었습니다.'
        });
    } catch (error) {
        console.log(error);
        return res.status(error.status||500).json({
            message:'에러 메세지가 발생하였습니다.'
        })
    }
})

router.post('/waterchange/result',async(req,res)=>{
    const { device_id, success } = req.body;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    sendWqResult(device_id, success)
    commandState.delete(device_id);
    const tanklog = await Waterchangelog.findOne({
        where:{
            device_id,
            started_at:{
                [Op.gte]:today,
                [Op.lt]:tomorrow
            }
        }
    })
    await tanklog.update({
        end_at:now,
        status:success
    })
    return res.status(200).json({
        message: '결과 수신 완료'
    });
})


module.exports = router;