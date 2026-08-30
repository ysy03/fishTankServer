const express = require('express');
const axios = require('axios');
const router = express.Router();
const {User,UserImage,Fishinfo} = require('../../models');
const jwt = require('jsonwebtoken');
const authmiddleware = require('../auth/authMiddleware');
const authMiddleware = require('../auth/authMiddleware');
const devAuthMiddleware = require('./devauthMiddleware');
const upload = require('../uploaded/userupload');
const fs = require('fs');
const path = require('path');

router.get('/',async(req,res)=>{
    //로그인 되어있는 상태인지 확인
    const token = req.cookies.accessToken
    if(token){
        return res.send(
            `<script>
                alert('이미 로그인이 되어있는 상태입니다.')
                window.location.href = '/api/index';
            </script>`
        )
    }
    res.render('index',{title:'hello'});
})


router.post('/login',async(req,res)=>{
    try {
        const {accesstoken:givenAccessToken,provider} = req.body;
        console.log(provider);
        console.log(givenAccessToken)
        let userData;
        let email;

        if (!givenAccessToken || !provider) {
            return res.status(400).json({
                success: false,
                message: 'accessToken 또는 provider가 없습니다.'
            });
        }

        if(provider == 'kakao'){
            userData = await axios.get(
                "https://kapi.kakao.com/v2/user/me",
                {
                    headers:{
                        Authorization: `Bearer ${givenAccessToken}`
                    }
                }
            )

            email = userData.data.kakao_account.email;
        }else if(provider == 'google'){
            console.log(givenAccessToken);
            userData = await axios.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                    headers:{
                        Authorization:`Bearer ${givenAccessToken}`
                    }
                }
            )
            email = userData.data.email;
        } else {
            return res.status(400).json({
                success: false,
                message: '지원하지 않는 로그인 방식입니다.'
            });
        }

        let exUser = await User.findOne({where:{sns_id:email,provider}});
        if(!exUser){
            const NewUser = await User.create({
                nickname:null,
                provider:provider,
                sns_id:email
            })
            exUser = NewUser
        }
        const {accesstoken,refreshtoken} = createToken(exUser.user_id);

        await User.update({
            token:refreshtoken
        },{where:{user_id:exUser.user_id}})

        const exNickname = exUser?.nickname != null;
        return res.status(200).json({exNickname,accesstoken,refreshtoken}); 
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({
            message: error.message
        })
    }
    
})

router.post('/refresh',async(req,res)=>{
    try {
        const {refreshtoken:sendrefreshtoken} = req.body
        if(!sendrefreshtoken){
            return res.status(401).json({
                message:"리프레쉬 토큰이 없습니다."
            })
        }
        let decode;
        try {
            decode = jwt.verify(sendrefreshtoken,process.env.JWT_REFRESH);
        } catch (error) {
            return res.status(401).json({
                code: 'INVALID_REFRESH_TOKEN',
                message: '유효하지 않은 리프레시 토큰입니다.'
            })
        }
        const user = await User.findByPk(decode.user_id)
        if(!user){
            return res.status(400).json({
                message:'유저가 존재하지 않습니다.'
            })
        }
        if(user.token !== sendrefreshtoken){
            return res.status(401).json({
                code: 'REFRESH_TOKEN_MISMATCH',
                message: '등록되지 않은 리프레시 토큰입니다.'
            });
        }

        const {accesstoken,refreshtoken} = createToken(user.user_id);
        await user.update({
            token:tokens.refreshtoken
        })
        return res.status(200).json({accesstoken,refreshtoken});

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            message:'토큰 발급 중에 오류가 발생하였습니다.'
        })
    }
})

router.post('/logout',authmiddleware,async(req,res)=>{
    try {
        const user = await User.findOne({where:{user_id:req.user.user_id}});
        await user.update({token:null});
        return res.sendStatus(204);
    } catch (error) {
        console.error(error);
        return res.status(error.status||500).json({message:error.message||'서버에 오류가 발생하였습니다.'})
    }
})

router.get('/myinfo',authMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        console.log(user_id);
        const user = await User.findOne({where:{user_id}});
        const image = await UserImage.findOne({where:{user_id}});
        const ImageUrl = image ? 
            `${req.protocol}://${req.get('host')}${image.Image_url}`:
            `${req.protocol}://${req.get('host')}/uploads/user/default.png`;
        console
        return res.status(200).json({user,image:ImageUrl});   
    } catch (error) {
        return res.status(500).json({
            message:'유저 정보를 불러오기 실패하였습니다.'
        })

    }
})

router.post('/profile',authMiddleware,upload.single('image'),async(req,res)=>{
    try {
        const {nickname} = req.body;
        const image = req.file;
        console.log(image);
        let imageurl = null;
        if(nickname && nickname.trim() !== ''){
            const newNickname = nickname.trim();
            console.log(newNickname);
            const exUser = await User.findOne({where:{nickname:newNickname}});
            if(exUser&&exUser.user_id !== req.user.user_id){
                const error = new Error('이미 존재하는 닉네임 입니다.');
                error.status = 409
                throw error
            }
            
            if(!exUser){
                await User.update({
                nickname:newNickname
                },{
                    where:{
                        user_id:req.user.user_id
                    }
                })
            }
        }
        
        if(image){
            imageurl = `/uploads/user/${image.filename}`
            const userImage = await UserImage.findOne({
                where:{
                    user_id:req.user.user_id
                }
            })
            if(userImage){
                await userImage.update({
                    Image_url:imageurl
                })
                fs.unlink(path.join(__dirname,'../..',userImage.Image_url),(err)=>{
                    if (err && err.code !== 'ENOENT') {
                        console.error(err);
                    }
                })
            }else{
                await UserImage.create({
                    user_id:req.user.user_id,
                    Image_url:imageurl
                })
            }
        }

       
        return res.status(200).json({success:true});
    } catch (error) {
        return res.status(error.status||500).json({message:error.message||'서버가 오류가 발생하였습니다.'})
    }
})



const createToken = (id) => {
    
    const accesstoken = jwt.sign({
        user_id:id
    },process.env.JWT_SECRET,{
        expiresIn:'30m'
    })
    const refreshtoken = jwt.sign({
        user_id:id
    },process.env.JWT_REFRESH,{
        expiresIn:'7d'
    })
    return {
        accesstoken,
        refreshtoken
    }

}


module.exports = router;