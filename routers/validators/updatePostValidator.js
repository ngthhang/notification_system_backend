const {check} = require('express-validator')

module.exports = [
    check('content')
        .exists().withMessage("Vui lòng cung cấp content")
        .notEmpty().withMessage("content không được để trống"),

    check('post_id')
        .exists().withMessage("Vui lòng cung cấp post_id")
        .notEmpty().withMessage("post_id không được để trống"),

    check('video')
        .optional()
        .notEmpty().withMessage("video URL không được để trống"),
]