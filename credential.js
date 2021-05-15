require('dotenv').config()
module.exports = {
    mongo: {
        development: {
            connectionString: process.env.connectionString,
        },
        production: {
            connectionString: process.env.connectionString,
        },
    }
}