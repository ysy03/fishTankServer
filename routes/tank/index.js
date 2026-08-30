const app = require('express');
const authMiddleware = require('../auth/authMiddleware');
const router = app.Router();
const {Sensor,WaterQuality,Tank, Feederlog,Waterchangelog,Alert} = require('../../models');
const { fn, Op, col } = require('sequelize');
const devAuthMiddleware = require('../auth/devauthMiddleware');
const { sendToUser, addClients, removeCLients, updateSensor } = require('./tanksse');

router.get('/',devAuthMiddleware,async(req,res)=>{
    const tankData = await Tank.findAll({where:{user_id:req.user_id}});
    return res.json(tankData);
})

//온도,수질 지정
router.post('/setting',devAuthMiddleware,async(req,res)=>{
    try {
        const {min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality,
            tank_name,
            device_id} = req.body;
        const {user_id} = req.user;
        const tank = await Tank.findOne({where:{user_id,device_id:device_id||'TEST'}});
        if(!tank){
            return res.status(404).json({message:'어항이 저장되어 있지 않습니다.'})
        }
        await tank.update({
            user_id,
            tank_name,
            device_id,
            min_temp,
            max_temp,
            normal_waterquality,
            warning_waterquality
        })
        return res.status(200).json({tank_id});
    } catch (error) {
        console.error(error.message);
        return res.status(error.status||500).json({message:'데이터 저장에 실패하였습니다.'})
    }
})

//설정 조회
router.get('/setting/:id',devAuthMiddleware,async(req,res)=>{
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
router.post('/setting/:id',devAuthMiddleware,async(req,res)=>{
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
        return res.sendStatus(204)
    } catch (error) {
        console.error(error.message);
        return res.status(error.status||500).json({message:error.message || '서버에 오류가 발생하였습니다.'});
    }
})

//IOT 센서 데이터 보냄
router.post('/Sensor',async(req,res)=>{
    try {
        const {device_id='SS501',temperature,water_quality} = req.body;
        if(temperature == null || water_quality == null){
            return res.status(400).json({message:'데이터 전달에 실패하였습니다.'})
        }

        const tank = await Tank.findOne({where:{device_id:device_id||'TEST'}})
        if(!tank){
            return res.status(400).json({message:'저장한 어항이 없습니다.'})
        }//원래 tank_id를 보내지 못하면 해당 if문이 발생하여 오류 전달 지금은 test아이디인 SS501을 사용 중
        const senseData = updateSensor(device_id,temperature,water_quality);
        sendToUser(device_id,senseData);
        return res.sendStatus(204);  
    } catch (error) {
        console.error(error);
        return res.status(error.status||500).json({message:error.message||'서버에 에러가 발생하였습니다.'})
    }

    
})

//기록 조회
router.get('/logdata',devAuthMiddleware,async(req,res)=>{
    try {
        const {device_id} = req.query;
        const today =new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate()+1);
        const [FeedData,waterchange]  = await Promise.all([
            FeedData.findAll({where:{device_id:device_id,feed_time:{[Op.gte]:today,[Op.lt]:tomorrow}}}),
            Waterchangelog.findAll({where:{device_id:device_id,started_at:{
                [Op.gte] : today,
                [Op.lt]:tomorrow
            }}})
        ])
        
        return res.json({waterchange,FeedData});   
    } catch (error) {
        return res.status(error.status||500).json({message:error.message||'에러 메세지가 발생하였습니다.'})
    }
})

//실시간 수온/수질 데이터 받기
router.get('/data',devAuthMiddleware,async (req,res) => {
    try {
        const {device_id='TEST'} = req.query;
        const tank = await Tank.findOne({where:{
            device_id
        }})
        if(!tank){
            return res.status(400).json({message:'저장한 기기를 발견하지 못했습니다.'})
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        res.flushHeaders();
        addClients(device_id,res);

        req.on('close',()=>{
            removeCLients(device_id,res);
        })
    } catch (error) {
        console.error(error.message)
        return res.status(error.status||500).json({message:error.message||'서버에 오류가 발생하였습니다.'});
    }
    
})

//급여
router.post('/feed',async(req,res)=>{
    const data = req.body;
    const status = Math.random() > 0.3;
    try {
        const tank = await Tank.findOne({
            where:{
                device_id:data.deviceId||"TEST"//SS501은 더미데이터이므로 무시 가능
            }
        })
        if(!tank){
            return res.status(404).json({message:'탱크를 찾아내지 못했습니다.'})
        }

        const Data = await Feederlog.create({
            device_id:tank.device_id,
            status
        })
        return res.status(201).json({Data})

    } catch (error) {
        console.error('error');
        return res.status(error.status||500).json({message:'에러가 발생하였습니다.'});
    }
})

//환수
router.post('/waterchange',devAuthMiddleware,async(req,res)=>{
    try {
        const data = req.body;
        const StartDate = new Date();
        await new Promise(resolve => setTimeout(resolve, 5000));

        const status = Math.random() > 0.7 ? true : false;
        const date = await Waterchangelog.create({
            device_id:data.device_Id||'TEST',
            status,
            started_at: StartDate,
            ended_at:new Date()
        })
        return res.json(date);   
    } catch (error) {
        console.log(error);
        return res.status(error.status||500).json({
            message:'에러 메세지가 발생하였습니다.'
        })
    }
})


module.exports = router;