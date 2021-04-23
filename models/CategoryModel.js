const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CategoryModel = new Schema({
    name: {
        type:String,
        unique: true
    },
    short_name: String,
    alias_key: String
})

module.exports = mongoose.model('Category', CategoryModel)