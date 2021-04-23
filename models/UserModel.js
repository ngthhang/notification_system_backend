const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserModel = new Schema({
    username: {
        type:String,
        unique: true
    },
    password: String,
    role: String,
    category_id: Array,
    name: String,
    avatar: String
})

module.exports = mongoose.model('User', UserModel)