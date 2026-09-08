const app = require('express');
const router = app.Router();
const authMiddleware = require('../auth/authMiddleware');
const {Tank,Fishinfo, sequelize} = require('../../models');
const devAuthMiddleware = require('../auth/devauthMiddleware');

//물고기 정보 전달
router.get('/',authMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        const tankdata = await Tank.findOne({where:{user_id}});
        const data = await Fishinfo.findAll({where:{device_id:tankdata.device_id}});
        return res.json({fishInfo:data})
    } catch (error) {
        console.error(error);
        res.status(error.status||500).json({message:'데이터를 불러오는 과정에서 실패하였습니다.'})
    }
})

//새로운 물고기 등록
router.post('/',authMiddleware,async(req,res)=>{
    const transaction = await sequelize.transaction();
    try {
        const {user_id} = req.user;
        const {fishes:fish_info} = req.body;
        const tank = await Tank.findOne({where:{user_id}});
        console.log(tank.device_id);
        if(!Array.isArray(fish_info)){
            return res.status(400).json({
                success:false,
                message:'물고기 정보가 올바르지 않습니다.'
            })
        }
        await Fishinfo.destroy({
            where:{
                device_id:tank.device_id
            },
            transaction
        })
        if(fish_info.length > 0){
            const fishDatas = fish_info.map((fish)=>({
                device_id:tank.device_id,
                fish_type:fish.fish_type,
                fish_count:fish.fish_count
            }))
            console.log(fishDatas);
            await Fishinfo.bulkCreate(fishDatas,{transaction});
        }
        await transaction.commit();
        return res.status(200).json({success:true,message:'물고기 정보 저장에 성공하셨습니다.'})
    } catch (error) {
        console.log(error);
        await transaction.rollback();
        return res.status(error.status||500).json({
            message: error.message || '서버에 장애가 발생하였습니다.'
        })
    }
})


module.exports = router;