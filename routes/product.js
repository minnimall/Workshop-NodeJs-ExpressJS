var express = require('express');
var router = express.Router();
var productSchema = require('../models/product')
var orderSchema = require('../models/order')

// แสดง products ทั้งหมด
router.get('/', async function(req, res, next) {
    try{
        let products = await productSchema.find({})
        res.ok('Query product success', products)
    } catch (error) {
        res.serverError(error.message)
    }
});

// ค้นหารายการ product 1 รายการ
router.get('/:id', async function(req, res, next) {
    try{
        let { id } = req.params

        const product = await productSchema.findById(id)
        if (!product) return res.badRequest('Product not found')

        res.ok('Find 1 product success', product)
    } catch (error) {
        if (error.name === 'CastError') {
            return res.badRequest('Product not found')
        }
        res.serverError(error.message)
    }
})

// แสดง Order ทั้งหมดของ Product
router.get('/:id/orders', async function(req, res, next) {
    try{
        const { id } = req.params

        const orders = await orderSchema.find({ product: id })
            .populate('user', 'username name tel')
            .populate('product', 'name price')

        res.ok('Query order all in product success', orders)
    } catch (error) {
        res.serverError(error.message)
    }
})

// เพิ่ม Order ใน Product
router.post('/:id/orders', async function(req, res, next) {
    try{
        const { id } = req.params
        const { quantity } = req.body

        const product = await productSchema.findById(id)

        if (!product) return res.badRequest('Product not found')
        
        if(quantity > product.stock) {
            return res.badRequest('Cant create order Not enough Stock')
        }

        const order = new orderSchema({
            product: id,
            user: req.auth.id,
            quantity: quantity
        })

        await order.save()
        product.stock -= quantity
        await product.save()
        res.created('Create order success', order)
    } catch (error) {
        res.serverError(error.message)
    }
})

// เพิ่มรายการ products
router.post('/', async function(req, res, next) {
    try {
        const { name, price, stock } = req.body

        const checkName = await productSchema.findOne({ name: name })
        if (checkName) return res.badRequest('Product name already exists')

        const product = new productSchema({
            name: name,
            price: price,
            stock: stock
        })

        await product.save()
        res.created('Created Product Success', product)

    } catch (error) {
        res.serverError(error.message)
    }
});

// แก้ไขข้อมูล
router.put('/:id', async function(req, res, next) {
    try {

        const { id } = req.params
        const { name, price, stock } = req.body

        const checkName = await productSchema.findOne({ name: name, _id: { $ne: id } })
        if (checkName) return res.badRequest('Product name already exists')

        const product = await productSchema.findByIdAndUpdate(id,{
            name: name,
            price: price,
            stock: stock
        }, { new: true })

        if (!product) return res.badRequest('Product not found')

        res.ok('Edit Product Success', product)

    } catch (error) {
        res.serverError(error.message)
    }
});

// ลบข้อมูล
router.delete('/:id', async function(req, res, next) {
    try{
        const { id } = req.params

        let product = await productSchema.findByIdAndDelete(id)
        if (!product) return res.badRequest('Product not found')

        res.ok('Delete Product Success', product)
    } catch (error) {
        res.serverError(error.message)
    }
});

module.exports = router;