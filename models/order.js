const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    quantity: { type: Number, required: true, min: 1 }
},{
    timestamps: true
})

module.exports = mongoose.model('orders', orderSchema);