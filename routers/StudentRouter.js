const express = require('express')
const Router = express.Router()

Router.get('/', (req, res) => {
    return res.json({
        code: 1,
        message: "user API"
    })
})

module.exports = Router