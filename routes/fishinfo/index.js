const app = require('express');
const router = app.Router();
const authMiddleware = require('../auth/authMiddleware');
const {User,Fishinfo} = require('../../models');

router.get('/',authMiddleware,async(req,res)=>{
    try {
        const {user_id,nickname} = req.user;
        const data = await User.findOne({where:{user_id},include:[{model:Fishinfo}]});
        const fishInfo = data.Fishinfos;
        return res.render('Fishinfo',{nickname,fishinfos:fishInfo});   
    } catch (error) {
        console.error(error);
        return res.redirect('/api/users')
    }
})

router.post('/new',authMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        const {fish_count,fish_type} = req.body;
        const Data = await Fishinfo.findAll({
            where:{
                user_id:user_id,
                fish_type:fish_type
            }
        });
        if(Data.length > 0){
            return res.render('Nopage',{message:'입력이 잘 못 되었습니다.'})
        }
        else{
            await Fishinfo.create({
                user_id,
                fish_type,
                fish_count
            })
        }
        return res.redirect("/api/fishinfo");
    } catch (error) {
        console.log(error);
        return res.send(`
            <script>
                const error = alert('에러가 발생하였습니다.')
                window.location.href = '/api/index';
            </script>
            `)
    }
})

router.post('/:id',authMiddleware,async (req,res) => {
    try {
        const {id} = req.params;
        const {fish_type,fish_count} = req.body;
        const result = await Fishinfo.update({fish_type,fish_count},{where:{user_id:req.user.user_id,fish_id:id}});
        console.log('성공');
        res.redirect('/api/fishinfo');   
    } catch (error) {
        res.send(`
            <script>
                let error = alert("오류가 발생하였습니다.")
                if(error){
                    history.go(-1);
                }
            </script>
            `)
    }
})

router.delete('/:id',authMiddleware,async (req,res) => {
    const Fishid = req.params.id;
    await Fishinfo.destroy({
        where:{
            fish_id:Fishid
        }
    })
    res.sendStatus(200);
})

module.exports = router;