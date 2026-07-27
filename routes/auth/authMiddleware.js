const jwt = require('jsonwebtoken');
const {User} = require('../../models');


const authMiddleware = async(req,res,next)=>{
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).json({
            code: 'TOKEN_REQUIRED',
            message: '로그인이 필요합니다.'
        })
    }

    const [type,token] = authorization.split(" ");
    if(type !== 'Bearer'||!token){
        return res.status(401).json({
            message:'잘못된 인증이 들어왔습니다.'
        })
    }
    try {
        const user =  jwt.verify(token,process.env.JWT_SECRET)
        req.user = user;
        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                code: 'ACCESS_TOKEN_EXPIRED',
                message: '액세스 토큰이 만료되었습니다.'
            });
        }

        return res.status(401).json({
            code: 'INVALID_ACCESS_TOKEN',
            message: '유효하지 않은 액세스 토큰입니다.'
        });
    }
}

module.exports = authMiddleware;