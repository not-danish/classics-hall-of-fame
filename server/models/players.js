const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    common_name: {
        type: String,
        required: true
    },
    country_id: {
        type: Number,
        required: true
    },
    date_of_birth: {
        type: Date,
        required: true
    },
    display_name: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    id: {
        type: Number,
        required: true
    },
    image_path: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    nationality_id: {
        type: Number,
        required: true
    },
    position_id: {
        type: Number,
        required: true
    },
    sport_id: {
        type: Number,
        required: true
    },
    type_id: {
        type: Number,
        required:true
    },
    weight: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("players", playerSchema)