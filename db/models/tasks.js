const mongoose = require('mongoose');

const taskScheme = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
});

const Tasks = mongoose.model("Tasks",taskScheme);

module.exports = Tasks;