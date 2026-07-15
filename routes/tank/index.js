const app = require('express');
const authMiddleware = require('../auth/authMiddleware');
const router = app.Router();
const {Sensor,Tank, Feederlog} = require('../../models');
const { fn, Op, col } = require('sequelize');


router.get('/',authMiddleware,async(req,res)=>{
    const tank = await Tank.findOne({
        where:{
            user_id:req.user.user_id
        }
    })
    const FeedData = await Feederlog.findAll({
        where:{device_id:tank.device_id}
    })
    res.render('tank',{FeedData});
})


router.get('/lasts',authMiddleware,async (req,res) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate()+1);
    const last = await Sensor.findOne({
        where:{
            user_id:req.user.user_id,
            measured_at:{
                [Op.gte]:today,
                [Op.lt]:tomorrow
            }
        },
        order:[['measured_at','DESC']]
    })
    const Temstatus = await Sensor.findOne({
        attributes:[
            [fn('MAX',col('temperature')),'Maxtemperature'],
            [fn('MIN',col('temperature')),'Mintemperature']
        ],
        where:{
            user_id:req.user.user_id,
            measured_at:{
                [Op.gte]:today,
                [Op.lt]:tomorrow
            }
        },
        order:[['measured_at','DESC']]
    })
    res.json({last,Temstatus});
})


router.post('/feed',authMiddleware,async(req,res)=>{
    const tank = await Tank.findOne({
            where:{
                user_id:req.user.user_id
            }
        })
    try {

        if(!tank){
            return res.json('탱크가 저장되어있지 않습니다.')
        }

        await Feederlog.create({
            device_id:tank.device_id,
            status:true
        })
        res.json('먹이지급 성공')

    } catch (error) {
        console.error('error');
        await Feederlog.create({
            device_id:tank.device_id,
            status:false
        })
        res.json('먹이지급 실패')
    }
})

router.post('')

module.exports = router;