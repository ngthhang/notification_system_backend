const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let authorization = req.header("Authorization")
    if (!authorization) {
        return res.status(401)
            .json({
                code: 10,
                message: "Vui lòng cung cấp jwt token qua header"
            })
    }

    let token = authorization.split(" ")[1];
    if (!token) {
        return res.status(401)
            .json({
                code: 11,
                message: "Vui lòng cung cấp jwt token hợp lệ"
            })
    }

    const {JWT_SECRET} = process.env
    if (!token) {
        return res.status(401)
            .json({
                code: 12,
                message: "Vui lòng cung cấp jwt token"
            })
    }
    jwt.verify(token, JWT_SECRET, (err, data) => {
        if (err) {
            return res.status(401)
                .json({
                    code: 13,
                    message: "Token không hợp lệ hoặc đã hết hạn"
                })
        }
        res.locals.user = data
        next();
    })
}