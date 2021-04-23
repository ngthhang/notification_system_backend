const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    let authorization = req.header("Authorization")
    if (!authorization) {
        return res.status(401)
            .json({
                code: 1,
                message: "Vui lòng cung cấp jwt token qua header"
            })
    }

    let token = authorization.split(" ")[1];
    if (!token) {
        return res.status(401)
            .json({
                code: 2,
                message: "Vui lòng cung cấp jwt token hợp lệ"
            })
    }

    const {JWT_SECRET} = process.env
    if (!token) {
        return res.status(401)
            .json({
                code: 3,
                message: "Vui lòng cung cấp jwt token"
            })
    }
    jwt.verify(token, JWT_SECRET, (err, data) => {
        if (err) {
            return res.status(401)
                .json({
                    code: 4,
                    message: "Token không hợp lệ hoặc đã hết hạn"
                })
        }
        req.user = data
        next();
    })
}