const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true, min: 0},
    stock: {type: Number, required: true, min: 0},
    description: {type: String, default: ''},
    image: {type: String, default: ''},
    shop: { type: Schema.Types.ObjectId, ref: 'users', required: true }
},{
    timestamps: true
})

module.exports = mongoose.model('products', productSchema);