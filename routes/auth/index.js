const express = require('express');
const axios = require('axios');
const router = express.Router();
const {User,Fishinfo} = require('../../models');
const jwt = require('jsonwebtoken');
const authmiddleware = require('../auth/authMiddleware');

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
    const data = await User.findOne({
        include:[{
            model:Fishinfo,
            where:{
                user_id:2
            }
        }]
    });
    console.log(data.Fishinfos);
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


router.get('/kakao/callback',async(req,res)=>{
    try {
        const {code} = req.query;

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
                nickname:nickname,
                provider:'kakao',
                sns_id:email
            })
            exUser = NewUser
        }
        const {success,accesstoken,refreshtoken} = createToken(exUser.user_id,exUser.nickname);

        if(!success){
            return res.send("오류 발생");
        }
        await User.update({
            token:refreshtoken
        },{where:{user_id:exUser.user_id}})


        res.cookie("accessToken",accesstoken,{
            httpOnly:true,
        })
        res.cookie("refreshToken",refreshtoken,{
            httpOnly:true,
        })
        return res.redirect('/api/index'); 
    } catch (error) {
        res.render('error',{message:'카카오 로그인이 실패하였습니다.'}) 
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
        const {success,accesstoken,refreshtoken} = createToken(exUser.user_id,exUser.nickname);

        if(!success){
            return res.send("인증 실패");
        }

        await User.update({
            token:refreshtoken
        },{where:{user_id:exUser.user_id}})

        res.cookie("accessToken",accesstoken,{
            httpOnly:true,
        })
        res.cookie("refreshToken",refreshtoken,{
            httpOnly:true,
        })
        return res.redirect('/api/index');  
    } catch (error) {
        res.render('error',{message:'구글 로그인이 실패하였습니다.'})
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

router.get('/kakao/logout',(req,res)=>{
    res.send(`<script>
        alert('로그아웃 완료')
        window.location.href = '/api/users'
        </script>`)
})


router.get('/error',(req,res)=>{
    const {message} = req.query
    res.json(message);
})

const createToken = (id,nickname) => {
    
    const accesstoken = jwt.sign({
        user_id:id,
        nickname
    },process.env.JWT_SECRET,{
        expiresIn:'1m'
    })
    const refreshtoken = jwt.sign({
        user_id:id,
        nickname
    },process.env.JWT_REFRESH,{
        expiresIn:'7d'
    })
    return {
        success:true,
        accesstoken,
        refreshtoken
    }

}


module.exports = router;