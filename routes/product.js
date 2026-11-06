var express = require('express');
var router = express.Router();
var productSchema = require('../models/product')
var orderSchema = require('../models/order')

// แสดง products ทั้งหมด
router.get('/', async function(req, res, next) {
    try{
        let products = await productSchema.find({})
        res.status(200).send({ status: 200, message: 'success', data: products });
    } catch (error) {
        res.status(500).send({ status: 500, message: error.message, data: null })
    }
});

// ค้นหารายการ product 1 รายการ
router.get('/:id', async function(req, res, next) {
    try{
        let { id } = req.params

        let product = await productSchema.findById(id)
        if (!product) return res.status(400).send({ status: 400, message: 'Product not found', data: null })

        res.status(200).send({ status: 200, message: 'success', data: product })
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).send({ status: 400, message: 'Product not found', data: null })
        }
        res.status(500).send({ status: 500, message: error.message, data: null })
    }
})

// แสดง Order ทั้งหมดของ Product
router.get('/:id/orders', async function(req, res, next) {
    try{
        let { id } = req.params

        let orders = await orderSchema.find({ product: id })
            .populate('user', 'username name tel')
            .populate('product', 'name price')

        res.status(200).send({ status: 200, message: 'success', data: orders })
    } catch (error) {
        res.status(500).send({ status: 500, message: error.message, data: null })
    }
})

// เพิ่ม Order ใน Product
router.post('/:id/orders', async function(req, res, next) {
    try{
        let { id } = req.params
        let { quantity } = req.body

        let product = await productSchema.findById(id)

        if (!product) return res.status(400).send({ status: 400, message: 'Product not found', data: null })
        
        if(quantity > product.stock) {
            return res.status(400).send({ status:400, message: 'Cant create order Not enough Stock', data:null })
        }

        let order = new orderSchema({
            product: id,
            user: req.auth.id,
            quantity: quantity
        })

        await order.save()
        product.stock -= quantity
        await product.save()
        res.status(201).send({ status: 201, message: 'Create Order Success', data: order })

    } catch (error) {
        res.status(500).send({ status: 500, message: error.message, data: null })
    }
})

// เพิ่มรายการ products
router.post('/', async function(req, res, next) {
    try {
        let { name, price, stock } = req.body

        let checkName = await productSchema.findOne({ name: name })
        if (checkName) return res.status(400).send({ status: 400, message: 'Product name already exists', data: null })

        let product = new productSchema({
            name: name,
            price: price,
            stock: stock
        })

        await product.save()
        res.status(201).send({ status: 201, message: 'Created Product Success.', data: product })

    } catch (error) {
        res.status(500).send({ status: 500, message: error.message, data: null })
    }
});

// แก้ไขข้อมูล
router.put('/:id', async function(req, res, next) {
    try {

        let { id } = req.params
        let { name, price, stock } = req.body

        let checkName = await productSchema.findOne({ name: name, _id: { $ne: id } })
        if (checkName) return res.status(400).send({ status: 400, message: 'Product name already exists', data: null })

        let product = await productSchema.findByIdAndUpdate(id,{
            name: name,
            price: price,
            stock: stock
        }, { new: true })

        if (!product) return res.status(400).send({ status: 400, message: 'Product not found', data: null })

        res.status(200).send({ status: 200, message: 'Edit Product Success.', data: product })

    } catch (error) {
        res.status(500).send({ status: 500, message: error.message, data: null })
    }
});

// ลบข้อมูล
router.delete('/:id', async function(req, res, next) {
    try{
        let { id } = req.params

        let product = await productSchema.findByIdAndDelete(id)
        if (!product) return res.status(400).send({ status: 400, message: 'Product not found', data: null })

        res.status(200).send({ status: 200, message: 'Delete Product Success.', data: product })
    } catch (error) {
        res.status(500).send({ status: 500, message: error.message, data: null })
    }
});

module.exports = router;