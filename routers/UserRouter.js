// require modules
const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// require models
const UserModel = require('../models/UserModel')
const CategoryModel = require('../models/CategoryModel')

// check JWT login
const CheckLogin = require('../auth/CheckLogin')

// require validators
const addUserValidator = require('./validators/addUserValidator')
const loginValidator = require('./validators/loginValidator')
const changePasswordValidator = require('./validators/changePasswordValidator')
// user login
Router.post('/login', loginValidator,(req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0 ) {
        let {username, password} = req.body
        UserModel.findOne({username:username})
            .then(user => {
                if (!user) {
                    throw new Error("Username hoặc password không chính xác")
                }
                account = user
                return bcrypt.compare(password, account.password)
            })
            .then(passwordMatch => {
                if(!passwordMatch) {
                    return res.status(401).json({
                        code: 0,
                        message: "Username hoặc password không chính xác"
                    })
                }
                const {JWT_SECRET} = process.env
                jwt.sign({
                    username: account.email,
                    name: account.name
                },JWT_SECRET, {
                    expiresIn: "1h"
                }, (err, token) => {
                    if (err) throw err
                    return res.json({
                        code: 1,
                        message: "Đăng nhập thành công",
                        user: account,
                        token: token
                    })
                })
            })
            .catch(e => {
                return res.json({
                    code: 0,
                    message: e.message
                })
            })
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

// change password
Router.post('/change_password',CheckLogin, changePasswordValidator,(req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0 ) {
        let {userId, currentPassword, newPassword} = req.body
        UserModel.findById(userId)
            .then(user => {
                if (!user) {
                    throw new Error("User không tồn tại")
                }
                account = user
                return bcrypt.compare(currentPassword, account.password)
            })
            .then(passwordMatch => {
                if(!passwordMatch) {
                    return res.status(401).json({
                        code: 0,
                        message: "Current Password không chính xác"
                    })
                }
            })
            .then(() =>
                bcrypt.hash(newPassword, 10)
            )
            .then(hashed => {
                // update user
                UserModel.findByIdAndUpdate(userId, {"password": hashed}, {
                        new: true // tra ve data moi
                })
                    .then(user => {
                        if (user){
                            return res.json ({
                                code: 1,
                                message: "Thay đổi mật khẩu thành công",
                            })
                        }
                    })
            })
            .catch(e => {
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

// create user
Router.post('/create', CheckLogin, addUserValidator,(req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0 ) {
        let {username, password, name, role, avartar, category_id } = req.body
        UserModel.findOne({username:username})
            .then(user => {
                if (user) throw new Error("username này đã tồn tại")
            })
            .then(() =>{
                // check if category_id exist
                if (category_id){
                    // check if category_id exist in database
                    category_id.forEach(function (cat_id){
                        CategoryModel.count({_id: cat_id})
                            .then(count => {
                                if(count<1){
                                    //document not exists
                                    return res.json ({
                                        code: 0,
                                        message: "Category id không tồn tại",
                                    })
                                }
                            })
                            .catch(e => {
                                if (e.message.includes('Cast to ObjectId failed')) {
                                    return res.json ({
                                        code: 0,
                                        message: "Đây không phải là ID hợp lệ",
                                        id: cat_id,
                                        category_id: category_id,
                                    })
                                }
                                return res.json ({
                                    code: 0,
                                    message: e.message,
                                })
                            })
                        })
                    }
            })
            .then(() =>
                bcrypt.hash(password, 10)
            )
            .then(hashed => {
                let user = new UserModel({
                    username: username,
                    password: hashed,
                    role: role,
                    category_id: category_id,
                    name: name,
                    avatar: avartar
                })
                // return user.save()
            })
            .then(() =>{
                return res.json({
                    code: 1,
                    message: "Tạo tài khoản thành công",
                })
            })
            .catch(e => {
                return res.json({
                    code: 0,
                    message: e.message
                })
            })
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