const {check} = require('express-validator')

module.exports = [
    check('userId')
        .exists().withMessage("Vui lòng cung cấp user id")
        .notEmpty().withMessage("User id không được để trống"),

    check('currentPassword')
        .exists().withMessage("Vui lòng cung cấp mật khẩu hiện tại")
        .notEmpty().withMessage("Mật khẩu hiện tại không được để trống")
        .isLength({min: 6}).withMessage("Mật khẩu phải có ít nhất 6 kí tự"),

    check('newPassword')
        .exists().withMessage("Vui lòng cung cấp mật khẩu mới")
        .notEmpty().withMessage("Mật khẩu mới không được để trống")
        .isLength({min: 6}).withMessage("Mật khẩu phải có ít nhất 6 kí tự"),
]