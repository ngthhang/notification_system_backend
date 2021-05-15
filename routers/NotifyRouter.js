// require modules
const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

// require models
const UserModel = require('../models/UserModel')
const CategoryModel = require('../models/CategoryModel')
const NotifyModel = require('../models/NotifyModel')

// check JWT login
const CheckLogin = require('../auth/CheckLogin')

// middlewares
const FileHandler = require('../routers/middlewares/FileHandler')
const upload = FileHandler.upload

// require validators
const addNotifyValidator = require('../routers/validators/addNotifyValidator')

// create Notify
Router.post('/',CheckLogin, addNotifyValidator, upload.array('attachment',10), (req, res) => {
    let result = validationResult(req.body)
    if (result.errors.length === 0 ) {
        let {header, content, poster, category} = req.body
        // check files
        let newPaths = []
        for (file of req.files){
            newPaths.push(file.path)
        }

        UserModel.countDocuments({_id: poster})
            .then(count => {
                if(count < 1){
                    throw new Error("Người dùng không tồn tại")
                }
            })
            .then(() => {
                return CategoryModel.findById(category)
            })
            .then(function (cat) {
                if(!cat){
                    throw new Error("Catergory không tồn tại")
                }
                return cat
                // other error are handler by .catch
            })
            .then(cat => {
                let notify = new NotifyModel({
                    header: header,
                    content: content,
                    create_at: Date.now(),
                    poster: poster,
                    category: cat,
                    files_url: newPaths,
                })
                return notify.save();
            })
            .then(notify =>{
                return res.json({
                    code: 1,
                    message: "Tạo thông báo thành công",
                    notify: notify,
                })
            })
            .catch(e => MongooseErrorHandler(e, req, res))
    }else {
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


// update notify
Router.put('/',CheckLogin, addNotifyValidator, upload.array('attachment',10), (req, res) => {
    let result = validationResult(req.body)
    if (result.errors.length !== 0 ) {
        // below are error
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
    // below valid when pass validator

    try {
        let {header, content, category, noti_id, previous_files} = req.body
        // check files
        let newPaths = previous_files
        for (file of req.files) {
            newPaths.push(file.destination + "/" + file.filename)
        }
        if (!noti_id) throw new Error("Không có dữ liệu noti id")
        if (!res.locals.user.user_id) throw new Error("Thông tin JWT token sai ")

        CategoryModel.findById(category)
            .then(function (cat) {
                if(!cat){
                    throw new Error("Catergory không tồn tại")
                }
                return cat
                // other error are handler by .catch
            })
            .then(cat => {
                let updateFields = {
                    header: header,
                    content: content,
                    create_at: Date.now(),
                    category: cat,
                    files_url: newPaths
                }
                return updateFields
            })
            .then (updateFields => {
                return NotifyModel.findOneAndUpdate(
                    {
                        _id: noti_id,
                        poster: res.locals.user.user_id
                    },
                    updateFields,
                    {new: true}
                )
            })
            .then(notify => {
                if (!notify) {
                    throw new Error("Lỗi khi update thông báo, có thể do sai noti_id hoặc không đủ quyền")
                }
                return notify
            })
            .then(notify => {
                return res.json({
                    code: 1,
                    message: "update thông báo thành công",
                    notify: notify,
                })
            })
            .catch(e => MongooseErrorHandler(e, req, res))
    }
    catch (e) {
        if (req.file){
            FileHandler.deleteFile(req.file.path)
        }
        MongooseErrorHandler(e, req, res)
    }
})


// delete notify
Router.post('/delete',CheckLogin, (req, res) => {
    try {
        let {poster, noti_id} = req.body
        // check files
        if (!noti_id) throw new Error("Không có dữ liệu noti id")
        if (!poster) throw new Error("Không có dữ liệu poster")
        if (!res.locals.user.user_id ) throw new Error("Thông tin JWT token sai ")
        if (res.locals.user.user_id !== poster) throw new Error("Bạn không đủ quyền để xóa")

        NotifyModel.findOneAndDelete(
            {
                _id: noti_id,
                poster: poster
            })
            .then(notify => {
                if (!notify) {
                    throw new Error("Lỗi khi delete thông báo, có thể do sai noti_id hoặc không đủ quyền")
                }
                return notify
            })
            .then(notify => {
                return res.json({
                    code: 1,
                    message: "delete thông báo thành công",
                })
            })
            .catch(e => MongooseErrorHandler(e, req, res))
    }
    catch (e) {
        if (req.file){
            FileHandler.deleteFile(req.file.path)
        }
        MongooseErrorHandler(e, req, res)
    }
})
// get info of a noti  by noti_id
Router.get("/new/:page",CheckLogin, (req, res) => {
    let currPage = parseInt(req.params.page) - 1
    if (currPage<0) currPage = 1

    NotifyModel.find()
        .sort({"create_at" : -1})
        .limit(10)
        .skip(currPage*10)
        .then(notifies => {
            if (!notifies) throw new Error("Không tìm thấy category_id")
            return res.json({
                code: 1,
                message: "Lấy thông báo theo trang thành công",
                notify: notifies,
            })
        })
        .catch(e => MongooseErrorHandler(e,req,res))
})

// get info of a noti  by noti_id
Router.get("/noti/:noti_id",CheckLogin, (req, res) => {
    let {noti_id} = req.params
    if (!noti_id) {
        return res.json({
            code: 1,
            message: "Không có thông tin noti_id",
        })
    }
    NotifyModel.findById(noti_id)
        .then(noti => {
            if (!noti) throw new Error("Không tìm thấy Thông báo")
            return res.json({
                code: 1,
                message: "Lấy nội dung thông báo thành công",
                noti: noti,
            })
        })
        .catch(e => MongooseErrorHandler(e,req,res))
})

// get notifies by cat_id
Router.get('/:cat_id/:page', CheckLogin, (req, res) => {
    let {cat_id, page} = req.params
    let currPage = parseInt(page) - 1
    if (currPage<0) currPage = 1

    NotifyModel.find({"category._id": mongoose.Types.ObjectId(cat_id)})
        .sort({"create_at" : -1})
        .limit(10)
        .skip(currPage*10)
        .then(notifies => {
            if (!notifies) throw new Error("Không tìm thấy category_id")
            return res.json({
                code: 1,
                message: "Lấy thông báo theo trang và category thành công",
                notify: notifies,
            })
        })
        .catch(e => MongooseErrorHandler(e,req,res))
})



function MongooseErrorHandler(e, req, res) {
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
}

module.exports = Router