const {check} = require('express-validator')

module.exports = [
    check('student_id')
        .exists().withMessage("Vui lòng cung cấp Mã Sinh viên")
        .notEmpty().withMessage("Mã Sinh viên không được để trống")
        .isLength({min: 6}).withMessage("Mã Sinh viên phải có ít nhất 6 kí tự"),

    check('last_name')
        .optional({nullable: true})
        .isLength({min: 2}).withMessage("Tên phải có ít nhất 2 kí tự"),

    check('first_name')
        .optional({nullable: true})
        .isLength({min: 2}).withMessage("Họ viên phải có ít nhất 2 kí tự"),

    check('class_name')
        .optional({nullable: true})
        .isLength({min: 2}).withMessage("Mã Lớp viên phải có ít nhất 2 kí tự"),

    check('faculty_name')
        .optional({nullable: true})
        .isLength({min: 2}).withMessage("Tên Khoa phải có ít nhất 2 kí tự"),

]