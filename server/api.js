const express = require('express');
const app = express()
const player = require('./models/players')
const mongoose = require('mongoose');

if(process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}

app.get("/api/", (req, res) => {
    res.send({"data": [{"id":1, "name": "Messi"}, {"id":2, "name": "Ronaldo"}]});
});

const PORT = process.env.PORT | 3000;
const start = async() => {
    try{
    await mongoose.connect(process.env.CON);
    app.listen(PORT, () => {
        console.log("Listening on port " + PORT);
    });
    } catch(e) {
        console.log(e.message);
    }

}

start();