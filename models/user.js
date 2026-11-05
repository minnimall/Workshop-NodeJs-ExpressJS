const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    name: {type: String, required: true},
    tel: { type: String, required: true, unique: true },
    password: {type: String, required: true},
    approve: { type: Boolean,
                default: false,
                required: true
    ,}
},{
    timestamps: true
})

module.exports = mongoose.model('users', userSchema);