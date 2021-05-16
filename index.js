// require credentials
require('dotenv').config()
var credentials = require("./credential");

// require modules
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')

// require routers
const UserRouter = require('./routers/UserRouter')
const CategoriesRouter = require('./routers/CategoriesRouter')
const StudentRouter = require('./routers/StudentRouter')
const NotifyRouter = require('./routers/NotifyRouter')
const PostRouter = require('./routers/PostRouter')

// use
const app = express()
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())
app.options('*', cors());
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length");
  next();
});
app.use('/public',express.static( __dirname+"/public"))
global.rootDir = __dirname;
app.get('/', (req, res) => {
    return res.json({
        code: 0,
        message: "Welcome to my REST API"
    })
})

// connect mongoose and start server
var opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
}
mongoose.connect(credentials.mongo.development.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .catch(e => console.log("Không thể kết nối tới db server:"+ e.message))

// use router
app.use('/user', UserRouter)
app.use('/categories', CategoriesRouter)
app.use('/student', StudentRouter)
app.use('/notify', NotifyRouter)
app.use('/post', PostRouter)

const port = process.env.PORT || 8080
var environment = process.env.NODE_ENV || 'development';

const httpserver = app.listen(port,'0.0.0.0', console.log('http://localhost:' + port))
const io = require('socket.io')(httpserver, {
    cors: {
        origin: '*',
    }
});
io.on('connection', client => {
    console.log(`Client ${client.id} connected`)
    client.on('new-noti-send', data =>{
        client.broadcast.emit('new-noti',data)
    })
})
