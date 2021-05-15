const mongoose = require('mongoose')
const Schema = mongoose.Schema
const UserModel = require("../models/UserModel")

const StudentModel = new Schema({
    sub: {
        type: String,
        unique: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
    },
    display_name: {
        type: String,
    },
    student_id: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    last_name: String,
    first_name: String,
    class_name: String,
    faculty_name: String,
    avatar: String,
})

const User = mongoose.model("User", UserModel.schema)
module.exports = mongoose.model('Student', StudentModel)