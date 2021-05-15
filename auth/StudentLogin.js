require('dotenv').config()
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);

module.exports = (req, res, next) => {
    let token = req.body.token;
    if (!token) {
        return res.status(401)
            .json({
                code: 11,
                message: "Vui lòng cung cấp Google auth token"
            })
    }

    // declare function
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        return ticket.getPayload();
    }


    verify()
        .then(payload => {
            if (!payload.hd || payload.hd != "student.tdtu.edu.vn"){
                return res.status(401)
                    .json({
                        code: 13,
                        message: "Gmail không thuộc student.tdtu.edu.vn"
                    })
            }
            res.locals.payload = payload;
            next();
        })
        .catch(e => {
            return res.status(401)
                .json({
                    code: 12,
                    message: "Lỗi token, vui lòng gửi lại"
                })
        });
}