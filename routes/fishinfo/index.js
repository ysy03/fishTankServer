const app = require('express');
const router = app.Router();
const authMiddleware = require('../auth/authMiddleware');
const {User,Fishinfo} = require('../../models');
const devAuthMiddleware = require('../auth/devauthMiddleware');

//물고기 정보 전달
router.get('/data',devAuthMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        const data = await User.findOne({where:{user_id},include:[{model:Fishinfo}]});
        const fishInfo = data.Fishinfos;
        return res.json({fishInfo,nickname})
    } catch (error) {
        res.json({message:'데이터를 불러오는 과정에서 실패하였습니다.'})
    }
})

//새로운 물고기 등록
router.post('/new',devAuthMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        const {fish_count,fish_type} = req.body.newFish;
        console.log(req.body);
        const Data = await Fishinfo.findAll({
            where:{
                user_id:user_id,
                fish_type:fish_type
            }
        });
        if(Data.length > 0){
            const error = new Error('이미 등록한 물고기 종류 입니다.');
            error.status(409);
            throw error;
        }
        else{
            await Fishinfo.create({
                user_id,
                fish_type,
                fish_count
            })
        }
        return res.status(200).send();
    } catch (error) {
        return res.status(error.status||500).json({
            message: error.message || '서버에 장애가 발생하였습니다.'
        })
    }
})

//지정한 물고기 종류의 갯수 변경
router.post('/:id',devAuthMiddleware,async (req,res) => {
    try {
        const {id} = req.params;
        const {fish_type,fish_count} = req.body;
        const result = await Fishinfo.update({fish_type,fish_count},{where:{user_id:req.user.user_id,fish_id:id}});
        return res.status(200).send({result});   
    } catch (error) {
        return res.status(error.status||500).json({
            message:error.message||'서버에 문제가 발생하였습니다.'
        })
    }
})


//물고기 종류 삭제
router.delete('/:id',devAuthMiddleware,async (req,res) => {
    try {
    const Fishid = req.params.id;
    const {user_id} = req.user;
    const fishinfo = await fishInfo.findOne({where:{fish_id:Fishid}});
    if(!fishinfo){
        const error = new Error('서버에 오류가 발생하였습니다.');
        error.status = 404;
        throw error;
    }
    if(fishinfo.user_id !== user_id){
        const error = new Error('데이터를 변경할 권한이 없습니다.');
        error.status = 403;
        throw error;
    }
    await fishInfo.destroy({where:{fish_id:Fishid}});
    return res.status(204).send();
    } catch (error) {
        return res.status(error.status || 500).json({
            message:error.message || '서버에 문제가 발생하였습니다.'
        })
    }
})

module.exports = router;