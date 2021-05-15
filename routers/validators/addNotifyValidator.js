const {check} = require('express-validator')

module.exports = [
    check('header')
        .exists().withMessage("Vui lòng cung cấp header")
        .notEmpty().withMessage("Header không được để trống"),

    check('content')
        .optional({nullable: true}),

    check('poster')
        .exists().withMessage("Vui lòng cung cấp poster_id")
        .notEmpty().withMessage("poster_id không được để trống"),

    check('category')
        .exists().withMessage("Vui lòng cung cấp category")
        .notEmpty().withMessage("category không được để trống"),

]