// require modules
const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

// require models
const UserModel = require('../models/UserModel')
const PostModel = require('../models/PostModel')

// check JWT login
const CheckLogin = require('../auth/CheckLogin')

// middlewares
const FileHandler = require('../routers/middlewares/FileHandler')
const upload = FileHandler.upload

// require validators
const addPostValidator = require('../routers/validators/addPostValidator')
const updatePostValidator = require('../routers/validators/updatePostValidator')

// create post
Router.post('/',CheckLogin,addPostValidator,upload.array('attachment',10),(req,res) => {
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
    try{
        let {content, poster, video} = req.body
        UserModel.countDocuments({_id: poster})
            .then(count => {
                if (count === 0) throw new Error("Không tìm thấy Poster")
            })
            .then(() => {
                let fields = {
                    content: content,
                    create_at: Date.now(),
                    poster: poster,
                    comments: [],
                }
                let newPaths = []
                for (file of req.files) {
                    newPaths.push(file.destination + "/" + file.filename)
                }
                fields['image'] = newPaths
                if (video && video.length>1){
                    fields['video'] = video
                }
                let post = new PostModel(fields)
                return post.save()
            })
            .then(post => {
                return res.json({
                    code: 1,
                    message: "Đã đăng post thành công",
                    post: post,
                    files: req.files,
                    file: req.file
                })
            })
            .catch (e => {
                if (req.file){
                    FileHandler.deleteFile(req.file.path)
                }
                MongooseErrorHandler(e, req, res)
            })
    }
    catch (e) {
        if (req.file){
            FileHandler.deleteFile(req.file.path)
        }
        MongooseErrorHandler(e, req, res)
    }
})

// update post
Router.put('/', CheckLogin,updatePostValidator, upload.array('attachment',10),(req, res) => {
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
    try{
        // below valid when pass validator

        let {content, post_id, video, previous_files} = req.body
        if (!post_id) throw new Error("Không có dữ liệu post_id")

        let updateFields = {
            content: content,
            create_at: Date.now(),
        }
        let newPaths = previous_files
        for (file of req.files) {
            newPaths.push(file.destination + "/" + file.filename)
        }
        updateFields['image'] = newPaths
        if (video && video.length>1){
            updateFields['video'] = video
        }
        PostModel.findById(post_id)
            .then(old_post => {
                if (!old_post) throw new Error("Post không tồn tại")
                if (!res.locals.user.user_id || res.locals.user.user_id != old_post.poster){
                    throw new Error("Sai thông tin poster hoặc JWT 1")
                }
                return PostModel.findByIdAndUpdate(
                    post_id,
                    updateFields,
                    {new: true}
                )
            })
            .then(post => {
                if (!post) throw new Error("Post không tồn tại")
                if (!res.locals.user.user_id || res.locals.user.user_id != post.poster){
                    throw new Error("Sai thông tin poster hoặc JWT 2")
                }
                return post
            })
            .then(post => {
                return res.json({
                    code: 1,
                    message: "Đã sửa post thành công",
                    post: post,
                })
            })
            .catch (e => {
                if (req.file){
                    FileHandler.deleteFile(req.file.path)
                }
                MongooseErrorHandler(e, req, res)
            })
    }
    catch (e) {
        if (req.file){
            FileHandler.deleteFile(req.file.path)
        }
        MongooseErrorHandler(e, req, res)
    }
})

// delete post
Router.post('/delete', CheckLogin, (req, res) =>{
    let {post_id} = req.body
    try{
        if (!post_id) throw new Error("Không có dữ liệu post_id")
        if (!res.locals.user.user_id ){
            throw new Error("Sai thông tin poster trong JWT token")
        }
        PostModel.findById(post_id)
            .then(post => {
                if (!post) throw new Error("Sai post_id")
                if(post.poster != res.locals.user.user_id) {
                    throw new Error("Không đủ quyền để xóa")
                }
                return PostModel.findByIdAndDelete({_id: post_id})
            })
            .then(result => {
                if (!result) throw new Error("Sai post_id")
                FileHandler.deleteFile(result.image)
            })
            .then(() => {
                return res.json({
                    code: 1,
                    message: "Đã xóa post thành công",
                })
            })
            .catch(e => MongooseErrorHandler(e, req, res))
    }
    catch (e) {
        MongooseErrorHandler(e, req, res)
    }
})

// get post  by pages , or of a user_id
Router.post('/new/:page', CheckLogin, (req, res) => {
    let {user_id} = req.body
    let {page} = req.params
    let currPage = parseInt(page) - 1
    if (currPage<0) currPage = 1

    let filter = {};
    if (user_id && user_id.length>1){
        filter['poster'] = user_id
    }
    try{
        PostModel.find(filter,
            {
                "comments" : {$slice: 1}
            })
            .sort({"create_at" : -1})
            .limit(10)
            .skip(currPage*10)
            .then(posts => {
                if (!posts) throw new Error("Không tìm thấy posts")
                return res.json({
                    code: 1,
                    message: "Lấy thông báo theo trang và posts thành công",
                    posts: posts,
                })
            })
            .catch(e => MongooseErrorHandler(e,req,res))
    }
    catch (e) {
        MongooseErrorHandler(e, req, res)
    }
})

// create comment
Router.post('/comment',CheckLogin, (req,res) =>{
    let {post_id, content} = req.body
    try{
        if (!post_id || !content) throw new Error('Thông tin comment không đủ')
        if (!res.locals.user.user_id) throw new Error("Thông tin JWT token sai ")

        let comment = {
            _id: new mongoose.Types.ObjectId(),
            content: content,
            poster: res.locals.user.user_id,
            create_at: Date.now(),
        }
        PostModel.findOneAndUpdate(
            {_id: post_id},
            {$push: {
                'comments': {
                    $each: [comment],
                    $position: 0,
                },
            }},
        )
            .then(() =>{
                return res.json({
                    code: 1,
                    message: "Đã đăng comment thành công",
                    comment: comment,
                })
            })
            .catch (e => {
                MongooseErrorHandler(e, req, res)
            })
    }catch (e) {
        MongooseErrorHandler(e, req, res)
    }
})

// update comment
Router.put('/comment',CheckLogin, (req,res) =>{
    let {post_id, comment_id, content} = req.body
    try{
        if (!post_id || !content || !comment_id) throw new Error('Thông tin comment không đủ')
        if (!res.locals.user.user_id) throw new Error("Thông tin JWT token sai ")
        PostModel.findOneAndUpdate(
            {
                _id: post_id,
                "comments._id": mongoose.Types.ObjectId(comment_id),
                "comments.poster": res.locals.user.user_id
            },
            {$set: {
                    'comments.$.content': content,
                }},
            {new: true}
        )
            .then(post => {
                if (!post) throw new Error("Post không tồn tại")
                return post.comments.filter(comment => comment._id == comment_id)
            })
            .then(comment =>{
                return res.json({
                    code: 1,
                    message: "Đã sửa comment thành công",
                    comment: comment,
                })
            })
            .catch (e => {
                MongooseErrorHandler(e, req, res)
            })
    }catch (e) {
        MongooseErrorHandler(e, req, res)
    }
})

// delete comment
Router.post('/delete_comment',CheckLogin, (req, res) => {
    let {post_id, comment_id} = req.body
    try{
        if (!post_id || !comment_id) throw new Error('Thông tin comment không đủ')
        if (!res.locals.user.user_id) throw new Error("Thông tin JWT token sai ")

        PostModel.updateOne(
            {_id: post_id},
            {$pull: {
                    'comments': {
                        _id: mongoose.Types.ObjectId(comment_id),
                        poster: res.locals.user.user_id,
                    },
                }},
        )
            .then(() =>{
                return res.json({
                    code: 1,
                    message: "Đã xóa comment thành công",
                })
            })
            .catch (e => {
                MongooseErrorHandler(e, req, res)
            })
    }catch (e) {
        MongooseErrorHandler(e, req, res)
    }
})

// get post
Router.get('/:post_id', CheckLogin, (req,res) => {
    let {post_id} = req.params
    try{
        PostModel.findById(post_id)
            .then(post => {
                if (!post) throw new Error("Không tìm thấy post")
                return res.json({
                    code: 1,
                    message: "Lấy post thành công",
                    posts: post,
                })
            })
            .catch(e => MongooseErrorHandler(e,req,res))
    }
    catch (e) {
        MongooseErrorHandler(e, req, res)
    }
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