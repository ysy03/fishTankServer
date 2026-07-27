function devAuthMiddleware(req, res, next) {
    req.user = {
        user_id: 3
    };

    next();
}

module.exports = devAuthMiddleware;