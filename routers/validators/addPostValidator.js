const {check} = require('express-validator')

module.exports = [
    check('content')
        .exists().withMessage("Vui lòng cung cấp content")
        .notEmpty().withMessage("content không được để trống"),

    check('poster')
        .exists().withMessage("Vui lòng cung cấp poster_id")
        .notEmpty().withMessage("poster_id không được để trống"),

    check('video')
        .optional()
        .notEmpty().withMessage("video URL không được để trống"),
]