var express = require('express');
var router = express.Router();
var orderSchema = require('../models/order')
var productSchema = require('../models/product')
const role = require('../middleware/role')

// ออเดอร์ของตัวเอง (user)
router.get('/', async function(req, res, next) {
    try {
        const orders = await orderSchema.find({ user: req.auth.id })
            .populate('product', 'name price image')
            .sort({ _id: -1 })
        res.ok('Query my orders success', orders)
    } catch (error) {
        res.serverError(error.message)
    }
})

// ออเดอร์ทั้งหมดของสินค้าร้านตัวเอง
router.get('/shop', role('shop'), async function(req, res, next) {
    try{
        const myProducts = await productSchema.find({ shop: req.auth.id }).select('_id')
        const ids = myProducts.map((p) => p._id)

        const orders = await orderSchema.find({ product: { $in: ids } })
            .populate('user', 'name tel')
            .populate('product', 'name price image')
            .sort({ _id: -1 })
        res.ok('Query shop orders success', orders)
    } catch (error) {
        res.serverError(error.message)
    }
})

module.exports = router;