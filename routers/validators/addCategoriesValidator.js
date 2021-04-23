const {check} = require('express-validator')

module.exports = [
    check('userId')
        .exists().withMessage("Vui lòng cung cấp user id")
        .notEmpty().withMessage("User id không được để trống"),

    check('name')
        .exists().withMessage("Vui lòng cung cấp tên")
        .notEmpty().withMessage("Tên không được để trống")
        .isLength({min: 6}).withMessage("Tên phải có ít nhất 6 kí tự"),

    check('short_name')
        .optional({nullable: true})
        .notEmpty().withMessage("Tên ngắn không được để trống"),

    check('alias_key')
        .optional({nullable: true})
        .notEmpty().withMessage("Tên không được để trống"),
]