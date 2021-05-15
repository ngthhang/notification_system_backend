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
const addCategoriesValidator = require('../routers/validators/addCategoriesValidator')

Router.get('/', (req, res) => {
    CategoryModel.find()
        .then(categories => {
            res.json ({
                code: 0,
                message: "Đọc hết danh mục thành công",
                data: categories
            })
        })
})

Router.get('/:alias_key', (req, res) => {
    let {alias_key} = req.params
    CategoryModel.findOne({alias_key: alias_key}).select('name short_name alias_key')
        .then(categories => {
            res.json ({
                code: 0,
                message: "Đọc danh mục thành công",
                data: categories
            })
        })
})
// create category
Router.post('/', CheckLogin, addCategoriesValidator, (req, res) => {
    let result = validationResult(req)
    if (result.errors.length === 0 ) {
        let {userId, name, short_name, alias_key} = req.body
        UserModel.findById(userId)
            .then(user => {
                if (!user) {
                    throw new Error("User không tồn tại")
                }
                if (user['role'] !== "Admin"){
                    return res.json ({
                        code: 0,
                        message: "Bạn không đủ quyền để tạo category",
                    })
                }
            })
            .then(() => {
                let cat = new CategoryModel({
                    name: name,
                    short_name: short_name,
                    alias_key: alias_key,
                })
                return cat.save()
            })
            .then(() =>{
                return res.json({
                    code: 1,
                    message: "Tạo category thành công",
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

module.exports = Router