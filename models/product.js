const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true, min: 0},
    stock: {type: Number, required: true, min: 0}
},{
    timestamps: true
})

module.exports = mongoose.model('products', productSchema);