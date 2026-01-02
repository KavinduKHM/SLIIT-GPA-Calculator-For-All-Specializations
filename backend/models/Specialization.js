const mongoose = require('mongoose');

const SpecializationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    specializationNamme: {
        type: String,
        trim: true
    },
    specializationCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    year3Modules: {
        type: [String],
        default: []
    },
    year4Modules: {
        type: [String],
        default: []
    },
    minCreditsYear3: {
        type: Number,
        default: 30
    },
    minCreditsYear4: {
        type: Number,
        default: 30
    }
});


module.exports = mongoose.model('Specialization',SpecializationSchema);