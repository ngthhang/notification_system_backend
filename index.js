// require credentials
require('dotenv').config()
var credentials = require("./credential");

// require modules
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// require routers
const UserRouter = require('./routers/UserRouter')
const CategoriesRouter = require('./routers/CategoriesRouter')
const StudentRouter = require('./routers/StudentRouter')


// use
const app = express()
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    return res.json({
        code: 0,
        message: "Welcome to my REST API"
    })
})

// use router
app.use('/user', UserRouter)
app.use('/categories', CategoriesRouter)
app.use('/student', StudentRouter)


const port = process.env.PORT || 8080
var environment = process.env.NODE_ENV || 'development';

// connect mongoose and start server
var opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
switch (environment){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, opts)
            .then(() => {
                app.listen(port, console.log('http://localhost:' + port))
            })
            .catch(e => console.log("Cannot connect to mongoDB:"+ e.message))
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, opts);
        break;
    default:
        throw new Error('Unknown execution environment :'+ environment)
}