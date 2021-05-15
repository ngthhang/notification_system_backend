const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CategoryModel = require("../models/CategoryModel")

const UserModel = new Schema({
    username: {
        type:String,
        trim: true,
        index: true,
        unique: true,
        sparse: true
    },
    password: String,
    role: String,
    category_id: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    name: String,
    avatar: String
})

const Category = mongoose.model("Category", CategoryModel.schema)
module.exports = mongoose.model('User', UserModel)