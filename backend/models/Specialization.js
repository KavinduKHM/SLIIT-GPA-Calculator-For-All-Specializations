const mongoose = require('mongoose');

const SpecializationSchema = new mongoose.Schema({

    specializationNamme:{
        type:String,
        required:true,
        unique:true
    },

    year3Modules:{
        type:String,
        ref:'Module'
    },
    year4Modules:{
        type:String,
        ref:'Module'
    },
    minCreditsYear3:{
        type:Number,
        default:30
    },
    minCreditsYear4:{
        type:Number,
        default:30
    }
})


module.exports = mongoose.model('Specialization',SpecializationSchema);