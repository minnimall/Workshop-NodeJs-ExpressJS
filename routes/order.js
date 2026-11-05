var express = require('express');
var router = express.Router();
var orderSchema = require('../models/order')

// แสดง Order ทุกรายการ
router.get('/', async function(req, res, next) {
    try{
        let orders = await orderSchema.find({})
            .populate('product', 'name price')
            .populate('user', 'username name tel')

        res.status(200).send({ status: 200, message: 'success', data: orders });
    } catch (error) {
        res.status(500).send({ status: 500, message: error.message, data: null })
    }
})

module.exports = router;