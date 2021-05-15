const saltedMd5=require('salted-md5')
const uuidv4 = require('uuid-v4')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const rootDir = path.dirname(require.main.filename)
const tmpPath = "/public/filetmp"

var storage  = multer.diskStorage({
    filename:function(req,file,callback){
        let name = saltedMd5(Date.now()+"_"+file.originalname, 'SUPER-S@LT!')+ "." + file.mimetype.split("/")[1]
        callback(null,name);
    },
    destination:function(req,file,callback){
        let path = "files"
        if(file.mimetype.startsWith("image/")){
            path = "images"
        }
        callback(null,"public/"+path);
    }
})
var upload = multer({
    storage:storage,
    dest: rootDir + tmpPath,
    fileFilter:function(req,file,callback){
        //cho phép upload
        callback(null,true);
    },
    limits:{fileSize:5000000} // giới hạn file -- bé hơn 1mb
})


function uploadFile(req, res) {
    let uploader = upload.single("attachment")
    try{
        let filePath;
        uploader(req, res, function(err) {
            file = req.file
            if (err) {
                throw new Error("File quá lớn")
            }
            if (!file) {
                throw new Error("Chưa có file hoặc file không hợp lệ")
            }
            filePath = file.path
            console.log(filePath)
        })
        return JSON.stringify({
            code: 0,
            message:"Upload thành công",
            URL: filePath,
        })
        console.log(filePath)
    }
    catch (error) {
        return JSON.stringify({
            code: 1,
            message: error.message,
        })
    }
}

function deleteFile(URL) {
    let path = rootDir + "\\" + URL
    try {
        if (!fs.existsSync(path)){
            throw new Error("Không tồn tại file")
        }
        fs.unlinkSync(path)
        return JSON.stringify({
            code: 0,
            message:"Delete file thành công",
        })
    }catch (err) {
        return JSON.stringify({
            code: 1,
            message: err.message,
        })
    }
}

module.exports = {
    upload,
    deleteFile,
}