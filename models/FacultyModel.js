const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FacultyModel = new Schema({
    name: {
        type:String,
        unique: true
    },
    short_name: String,
})

module.exports = mongoose.model('Faculty', FacultyModel)