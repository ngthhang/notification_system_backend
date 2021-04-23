const {check} = require('express-validator')

module.exports = [
    check('username')
        .exists().withMessage("Vui lòng cung cấp tên người dùng")
        .notEmpty().withMessage("Tên người dùng không được để trống")
        .isLength({min: 6}).withMessage("Tên người dùng phải có ít nhất 6 kí tự"),

    check('password')
        .exists().withMessage("Vui lòng cung cấp mật khẩu")
        .notEmpty().withMessage("Mật khẩu không được để trống")
        .isLength({min: 6}).withMessage("Mật khẩu phải có ít nhất 6 kí tự"),

    check('name')
        .exists().withMessage("Vui lòng cung cấp tên")
        .notEmpty().withMessage("Tên không được để trống")
        .isLength({min: 6}).withMessage("Tên phải có ít nhất 6 kí tự"),

    check('role')
        .exists().withMessage("Vui lòng cung cấp quyền")
        .notEmpty().withMessage("Quyền không được để trống")
        .equals("Faculty").withMessage("Quyền không hợp lệ"),

    check('avatar')
        .optional({nullable: true})
        .notEmpty().withMessage("Ảnh không được để trống"),

    check('category_id')
        .optional({nullable: true})
        .isArray({min: 1}).withMessage("Không có category_id")
]