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

router.get('/kakao',(req,res)=>{
    console.log(process.env.KAKAO_LOGIN_REDIRECT_URI)
    const kakaoURI = `https://kauth.kakao.com/oauth/authorize?`+
    `client_id=${process.env.KAKAO_LOGIN_API_KEY}`+
    `&redirect_uri=${encodeURIComponent(process.env.KAKAO_LOGIN_REDIRECT_URI)}` +
    `&response_type=code`;
    console.log(process.env.KAKAO_LOGIN_REDIRECT_URI)
    res.redirect(kakaoURI);
})


router.post('/kakao/callback',async(req,res)=>{
    try {
        const {code} = req.body;

        const token = await axios.post(
            "https://kauth.kakao.com/oauth/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                client_id: process.env.KAKAO_LOGIN_API_KEY,
                redirect_uri: process.env.KAKAO_LOGIN_REDIRECT_URI,
                code,
            }),
            {
                headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                },
            }
        )

        const accessToken = token.data.access_token;

        const userData = await axios.get(
            "https://kapi.kakao.com/v2/user/me",
            {
                headers:{
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )

        const nickname = userData.data.properties.nickname;
        const email = userData.data.kakao_account.email;
        
        let exUser = await User.findOne({where:{sns_id:email,provider:'kakao'}});
        if(!exUser){
            const NewUser = await User.create({
                nickname:null,
                provider:'kakao',
                sns_id:email
            })
            exUser = NewUser
        }
        const {accesstoken,refreshtoken} = createToken(exUser.user_id);

        await User.update({
            token:refreshtoken
        },{where:{user_id:exUser.user_id}})


        return res.json({accessToken,refreshtoken,userId,nickname}); 
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({
            success:false,
            message: error.message
        })
    }
    
})

router.get('/google',(req,res)=>{
    const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_LOGIN_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_LOGIN_REDIRECT_URI,
        response_type: "code",
        scope: "email profile",
    });

    res.redirect(`${googleAuthUrl}?${params.toString()}`);
})

router.get('/google/callback',async(req,res)=>{
    try {
        const {code} = req.query;
        const token = await axios.post(
            "https://oauth2.googleapis.com/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                client_secret:process.env.GOOGLE_CLIENT_SECRET,
                client_id: process.env.GOOGLE_LOGIN_CLIENT_ID,
                redirect_uri: process.env.GOOGLE_LOGIN_REDIRECT_URI,
                code,
            }),
            {
                headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                },
            }
        )
        const accessToken = token.data.access_token
        const userData = await axios.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers:{
                    Authorization:`Bearer ${accessToken}`
                }
            }
        )
        const {name,email} = userData.data;
        let exUser = await User.findOne({where:{sns_id:email,provider:'google'}});
        if(!exUser){
            const newUser = await User.create(
                {
                    nickname:name,
                    provider:'google',
                    sns_id:email
                }
            )
            exUser = newUser
            
        }
        const {accesstoken,refreshtoken} = createToken(exUser.user_id);


        await User.update({
            token:refreshtoken
        },{where:{user_id:exUser.user_id}})

        return res.json({accessToken,refreshtoken,nickname:name});  
    } catch (error) {
        res.render('error',{message:'구글 로그인이 실패하였습니다.'})
    }
})


router.post('/refresh',async(req,res)=>{
    try {
        const refreshCookies = req.cookies.refreshtoken;
        if(!refreshCookies){
            return res.status(401).json({
                message:"리프레쉬 토큰이 없습니다."
            })
        }
        let decode;
        try {
            decode = jwt.verify(refreshCookies,process.env.JWT_REFRESH);
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
        if(user.token !== refreshCookies){
            return res.status(401).json({
                code: 'REFRESH_TOKEN_MISMATCH',
                message: '등록되지 않은 리프레시 토큰입니다.'
            });
        }

        const {accesstoken,refreshtoken} = createToken(user.user_id);
        await user.update({
            token:refreshtoken
        })
        res.cookie('refreshtoken',refreshtoken,{
            httpOnly:true,
            maxAge: 7 * 24 * 60* 60 * 1000
        })
        return res.status(200).json({
            accesstoken
        })

    } catch (error) {
        return res.status(500).json({
            message:'토큰 발급 중에 오류가 발생하였습니다.'
        })
    }
})

router.post('/logout',authmiddleware,async(req,res)=>{
    console.log(req.user);
    const user = await User.findOne({where:{user_id:req.user.user_id}});
    const data = await User.update({token:null},{where:{user_id:req.user.user_id}});
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    if(user.provider === 'kakao'){
        const kakaoLogoutUri = 'https://kauth.kakao.com/oauth/logout'
                                +`?client_id=${process.env.KAKAO_LOGIN_API_KEY}`
                                +`&logout_redirect_uri=${encodeURIComponent(process.env.KAKAO_LOGOUT_REDIRECT_URI)}`
        return res.redirect(kakaoLogoutUri);
    }
    res.send(`<script>
        alert('로그아웃 완료')
        window.location.href = '/api/users'
        </script>`)
})

router.get('/me',devAuthMiddleware,async(req,res)=>{
    try {
        const {user_id} = req.user;
        console.log(user_id);
        const user = await User.findOne({where:{user_id}});
        const image = await UserImage.findOne({where:{user_id}});
        return res.status(200).json({user,image:image??{
            Image_url:'/uploads/user/default.png'
        }});   
    } catch (error) {
        return res.status(500).json({
            message:'유저 정보를 불러오기 실패하였습니다.'
        })

    }
})

router.post('/profile',devAuthMiddleware,upload.single('image'),async(req,res)=>{
    try {
        const {nickname} = req.body;
        const image = req.file;
        console.log(image);
        let imageurl = null;
        if(image){
            imageurl = `/uploads/user/${image.filename}`
            const userImage = await UserImage.findOne({
                where:{
                    user_id:req.user.user_id
                }
            })
            if(userImage){
                fs.unlink(path.join(__dirname,'../..',userImage.Image_url),(err)=>{
                    if (err && err.code !== 'ENOENT') {
                        console.error(err);
                    }
                })
                await userImage.update({
                    Image_url:imageurl
                })
            }else{
                await UserImage.create({
                    user_id:req.user.user_id,
                    Image_url:imageurl
                })
            }
        }

        if(nickname && nickname !== ''){
            const newNickname = nickname.trim();
            console.log(newNickname);
            const exUser = await User.findOne({where:{nickname:newNickname}});
            if(exUser&&exUser.user_id !== req.user.user_id){
                const error = new Error('이미 존재하는 닉네임 입니다.');
                error.status = 409
                throw error
            }
            
            await User.update({
                nickname:newNickname
            },{
                where:{
                    user_id:req.user.user_id
                }
            })
        }
        
       
        return res.status(200).json({image:imageurl || '/uploads/user//default.png'});
    } catch (error) {
        return res.status(error.status||500).json({message:error.message||'서버가 오류가 발생하였습니다.'})
    }
})



const createToken = (id) => {
    
    const accesstoken = jwt.sign({
        user_id:id
    },process.env.JWT_SECRET,{
        expiresIn:'1m'
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