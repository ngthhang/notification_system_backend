const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotifyModel = new Schema({
    header: String,
    content: String,
    create_at: {
        type: Date,
    },
    poster: {
        type: Schema.Types.Mixed,
    },
    category: {
        type: Schema.Types.Mixed,
    },
    files_url: [String],
})

module.exports = mongoose.model('Notify', NotifyModel)