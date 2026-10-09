function devAuthMiddleware(req, res, next) {
    req.user = {
        user_id: 6//실험시 user에서 있는 아이디로 실험해보기
    };

    next();
}

module.exports = devAuthMiddleware;