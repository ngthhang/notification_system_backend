const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CategoryModel = new Schema({
    name: String,
    short_name: String,
    alias_key: String
})

module.exports = mongoose.model('Category', CategoryModel)