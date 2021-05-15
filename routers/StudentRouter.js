// require modules
const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

// require models
const UserModel = require('../models/UserModel')
const StudentModel = require('../models/StudentModel')

// middlewares
const FileHandler = require('../routers/middlewares/FileHandler')
const upload = FileHandler.upload
// check login
const CheckLogin = require('../auth/CheckLogin')
const StudentLogin = require('../auth/StudentLogin')

// require validator
const updateStudentValidator = require('../routers/validators/updateStudentValidator')

// create student
Router.post('/google_login',StudentLogin, (req, res) => {
    if (!res.locals.payload) {
        return res.json({
            code: 0,
            message: "Thiếu payload",
        })
    }
    let {sub, name, email, given_name, family_name, picture} = res.locals.payload
    res.locals.payload = null
    StudentModel.findOne({sub: sub})
        .then (student => {
            if (!student) {
                // tao user moi
                let user = new UserModel({
                    role: "Student",
                })
                user.save()
                    .then(() => {
                    })
                    .catch(e => {
                    return res.json({
                        code: 0,
                        message: e.message
                    })
                })
                let student_new = new StudentModel({
                    sub: sub,
                    display_name: name,
                    user_id: user._id,
                    student_id: email.split("@")[0],
                    email: email,
                    last_name: family_name,
                    first_name: given_name,
                    avatar: picture,
                    class_name: null,
                    faculty_name: null,
                })
                return student_new.save();
            }
            return student
        })
        .then(student => {
            // user exist
            const {JWT_SECRET} = process.env
            jwt.sign({
                user_id: student.user_id,
            },JWT_SECRET, {
                expiresIn: "24h"
            }, (err, token) => {
                if (err) throw err
                return res.json({
                    code: 1,
                    message: "Đăng nhập thành công",
                    user: student,
                    token: token,
                })
            })
        })
        .catch(e => {
            return res.json({
                code: 0,
                message: e.message
            })
        })
})

// get student by user_id
Router.get('/user_id/:user_id', CheckLogin, (req, res) =>{
    let {user_id} = req.params
    if (!user_id) {
        return res.json ({
            code: 0,
            message: "Không có thông tin user id",
        })
    }

    StudentModel.findOne({user_id : user_id})
        .then(student => {
            if (!student) {
                throw new Error("Không tìm thấy Sinh viên")
            }
            return res.json({
                code: 1,
                message: "Lấy thông tin sinh viên thành công",
                student: student,
            })
        })
        .catch(e => {
            return res.json({
                code: 0,
                message: e.message
            })
        })
})

// get student by id
Router.get('/:student_id', CheckLogin, (req, res) =>{
    let {student_id} = req.params
    if (!student_id) {
        return res.json ({
            code: 0,
            message: "Không có thông tin mã sinh viên",
        })
    }

    StudentModel.findOne({student_id: student_id})
        .then(student => {
            if (!student) {
                throw new Error("Không tìm thấy Sinh viên")
            }
            return res.json({
                code: 1,
                message: "Lấy thông tin sinh viên thành công",
                student: student,
            })
        })
        .catch(e => {
            return res.json({
                code: 0,
                message: e.message
            })
        })
})


// update student by id
Router.put('/:student_id', CheckLogin, updateStudentValidator,upload.single('attachment'),(req, res) =>{
    let result = validationResult(req.body)
    if (result.errors.length === 0 ) {
        try{
            let newVars = {last_name, first_name, class_name, faculty_name, display_name} = req.body
            let newPath = undefined
            if (req.file){
                newPath = req.file.destination + "/" + req.file.filename;
            }
            if (!res.locals.user){
                FileHandler.deleteFile(newPath)
                throw new Error("Lỗi JWT")
            }
            user_id = res.locals.user.user_id
            StudentModel.findOne({user_id: user_id}).select('avatar')
                .then(student => {
                    if (!student) {
                        throw new Error("Không tìm thấy student")
                    }
                    if(newPath) {
                        let result = JSON.parse(FileHandler.deleteFile(student.avatar))
                        if (result.code !== 0){
                            console.log(result)
                        }
                    }
                })
                .catch (e => {
                    if (e.message.includes('Cast to ObjectId failed')) {
                        return res.json ({
                            code: 0,
                            message: "Đây không phải là ID hợp lệ",
                        })
                    }
                    return res.json ({
                        code: 0,
                        message: e.message,
                    })
                })

            let updateFields = {}
            let supportedFields = ['last_name', 'first_name', 'class_name', 'faculty_name', "display_name"]
            for (field in newVars) {
                if (field && supportedFields.includes(field)){
                    updateFields[field] = newVars[field]
                }
            }
            if(newPath){
                updateFields['avatar'] = newPath
            }
            StudentModel.findOneAndUpdate(
                {user_id: user_id},
                updateFields,
                {new: true}
            )
                .then(student => {
                    if (!student) {
                        throw new Error("Không tìm thấy student")
                    }
                    return res.json ({
                        code: 1,
                        message: "Thay đổi thông tin thành công",
                        student: student,
                    })
                })
                .catch (e => {
                    if (e.message.includes('Cast to ObjectId failed')) {
                        return res.json ({
                            code: 0,
                            message: "Đây không phải là ID hợp lệ",
                        })
                    }
                    return res.json ({
                        code: 0,
                        message: e.message,
                    })
                })
        }catch (e) {
            return res.json ({
                code: 0,
                message: e.message,
            })
        }

    }
    else {
        let messages = result.mapped()
        let message = ""
        for (m in messages){
            message = messages[m].msg
            break
        }
        return res.json({
            code: 0,
            message: message
        })
    }
})

module.exports = Router