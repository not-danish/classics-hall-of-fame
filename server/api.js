const express = require('express');
const app = express()
const player = require('./models/players')

app.get("/api/", (req, res) => {
    res.send({"data": [{"id":1, "name": "Messi"}, {"id":2, "name": "Ronaldo"}]});
});

app.listen(3000, () => console.log("Listening on port 3000"));