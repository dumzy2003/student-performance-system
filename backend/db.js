const mysql = require("mysql2");

require("dotenv").config({
    path: __dirname + "/.env"
});

const db = mysql.createPool({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,
    port: process.env.DB_PORT,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});


db.getConnection((err, connection) => {

    if (err) {

        console.error(
            "MySQL connection failed:",
            err.message
        );

        return;

    }

    console.log(
        "MySQL database connected successfully!"
    );

    connection.release();

});


module.exports = db;