const app = require('express')
const router = app.Router();
const authMiddleware = require('../auth/authMiddleware');
const {User,Fishinfo} = require('../../models');


router.get('/',authMiddleware,async(req,res)=>{
    const data = await User.findOne({where:{user_id:req.user.user_id},include:[{model:Fishinfo}]});
    console.log(data.Fishinfos);
    res.render('mainHome')
})

module.exports = router