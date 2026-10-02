const mongoose = require('mongoose');

const lightingRecordSchema = new mongoose.Schema({
    sensorId: {
        type: String,
        required: true
    },

    roomId: {
        type: String,
        required: true
    },

    motionDetected: {
        type: Boolean,
        required: true
    },

    lightIntensity: {
        type: Number,
        required: true
    },

    occupancy: {
        type: Number,
        required: true
    },

    lightStatus: {
        type: String,
        required: true
    },

    brightness: {
        type: Number,
        required: true
    },

    reason: {
        type: String,
        required: true
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model(
    'LightingRecord',
    lightingRecordSchema
);