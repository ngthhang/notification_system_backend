const mongoose = require('mongoose')
const Schema = mongoose.Schema
const UserModel = require("../models/UserModel")

const PostModel = new Schema({
    content: String,
    create_at: Date,
    poster: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    comments: [{
        content: String,
        poster: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        create_at: Date,
    }],
    image: [String],
    video: String,
})

const User = mongoose.model("User", UserModel.schema)
module.exports = mongoose.model('Post', PostModel)