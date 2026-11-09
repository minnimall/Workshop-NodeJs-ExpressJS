var express = require('express');
var router = express.Router();
var orderSchema = require('../models/order')

// แสดง Order ทุกรายการ
router.get('/', async function(req, res, next) {
    try{
        const orders = await orderSchema.find({})
            .populate('product', 'name price')
            .populate('user', 'username name tel')

        res.ok('Query order success', orders)
    } catch (error) {
        res.serverError(error.message)
    }
})

module.exports = router;