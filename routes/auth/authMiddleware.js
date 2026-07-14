const jwt = require('jsonwebtoken');
const {User} = require('../../models');


const authMiddleware = async(req,res,next)=>{
    const token = req.cookies.accessToken;
    let errormessage;
    try {
        const user =  jwt.verify(token,process.env.JWT_SECRET)
        req.user = user;
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError'){
            try {
                const refreshtoken = req.cookies.refreshToken;
                const refresh = jwt.verify(refreshtoken,process.env.JWT_REFRESH)
                const user = await User.findOne({where:{user_id:refresh.user_id}})
                //로그인한 유저가 존재하지 않는다.
                if(!user){
                    errormessage = '로그인한 유저가 없습니다';
                    return res.redirect(`/api/users/error?message=${errormessage}`)
                }
                //refreshtoken이 존재하지 않는다.
                if(user.token !== refreshtoken){
                    errormessage = '잘못된 refresh토큰';
                    return res.redirect(`/api/users/error?message=${errormessage}`)
                }
                //새로운 토큰 생성
                const NewAccesstoken = jwt.sign({
                    user_id:user.user_id,
                    nickname:user.nickname
                },process.env.JWT_SECRET,{
                    expiresIn:'1m'
                })
                //새로운 리프레쉬 토큰 생성
                const NewRrefreshtoken = jwt.sign({
                    user_id:user.user_id,
                    nickname:user.nickname
                },process.env.JWT_REFRESH,{
                    expiresIn:'7d'
                })
                
                res.cookie("accessToken",NewAccesstoken,{
                    httpOnly:true,
                })
                res.cookie("refreshToken",NewRrefreshtoken,{
                    httpOnly:true,
                })
                await User.update({token:NewRrefreshtoken},{where:{user_id:user.user_id}})
                req.user = jwt.decode(NewAccesstoken);
                return next();
            } catch (error) {
                errormessage = 'refresh토큰 만료';
                return res.redirect(`/api/users/error?message=${errormessage}`)
            }
            
        }
        console.error(error);
        errormessage = '유효하지 않은 토큰';
        return res.redirect(`/api/users/error?message=${errormessage}`)
    }
}

module.exports = authMiddleware;