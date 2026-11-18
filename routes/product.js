var express = require('express');
var router = express.Router();
var productSchema = require('../models/product')
var orderSchema = require('../models/order')
const verifyToken = require('../middleware/auth')
const role = require('../middleware/role')
const upload = require('../middleware/upload')
const fs = require('fs')
const path = require('path')

// ลบไฟล์รูปเก่าออกจากเครื่อง
const removeImage = (imagePath) => {
    if (!imagePath) return
    const file = path.join(__dirname, '..', imagePath)
    fs.unlink(file, () => {}) // ถ้าไม่มีไฟล์ก็ไม่ต้องสนใจ error
}

// แสดง products ทั้งหมด (สาธารณะ)
router.get('/', async function(req, res, next) {
    try{
        let products = await productSchema.find({}).populate('shop', 'name')
        .sort({ _id: -1 })
        res.ok('Query product success', products)
    } catch (error) {
        res.serverError(error.message)
    }
});

// แสดงสินค้าของร้านตัวเอง  (ต้องอยู่ก่อน /:id)
router.get('/mine', verifyToken, role('shop'), async function(req, res, next) {
    try{
        const products = await productSchema.find({ shop: req.auth.id })
        .sort({ _id: -1 })
        res.ok('Query my product success', products)
    } catch (error) {
        res.serverError(error.message)
    }
});

// ค้นหารายการ product 1 รายการ (สาธารณะ)
router.get('/:id', async function(req, res, next) {
    try{
        const product = await productSchema.findById(req.params.id).populate('shop', 'name')
        if (!product) return res.badRequest('Product not found')

        res.ok('Find 1 product success', product)
    } catch (error) {
        if (error.name === 'CastError') return res.badRequest('Product not found')
        res.serverError(error.message)
    }
})

// แสดง Order ทั้งหมดของ Product (เจ้าของสินค้า หรือ admin)
router.get('/:id/orders', verifyToken, role('shop', 'admin'), async function(req, res, next) {
    try{
        const { id } = req.params

        const product = await productSchema.findById(id)
        if (!product) return res.badRequest('Product not found')

        if (req.auth.role === 'shop' && String(product.shop) !== req.auth.id) {
            return res.unauthorized('Permission denied')
        }

        const orders = await orderSchema.find({ product: id })
            .populate('user', 'username name tel')
            .populate('product', 'name price')

        res.ok('Query order all in product success', orders)
    } catch (error) {
        if (error.name === 'CastError') return res.badRequest('Product not found')
        res.serverError(error.message)
    }
})

// เพิ่ม Order ใน Product (เฉพาะ user)
router.post('/:id/orders', verifyToken, role('user'), async function(req, res, next) {
    try{
        const { id } = req.params
        const quantity = Number(req.body.quantity)

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.badRequest('Quantity must be a positive integer')
        }

        // ตัดสต็อกแบบ atomic เฉพาะเมื่อสต็อกพอ
        const product = await productSchema.findOneAndUpdate(
            { _id: id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        )

        if (!product) {
            const exists = await productSchema.exists({ _id: id })
            if (!exists) return res.badRequest('Product not found')
            return res.badRequest('Cant create order Not enough Stock')
        }

        try {
            const order = await new orderSchema({
                product: id,
                user: req.auth.id,
                quantity: quantity
            }).save()
            res.created('Create order success', order)
        } catch (err) {
            // สร้าง order ไม่สำเร็จ คืนสต็อก
            await productSchema.updateOne({ _id: id }, { $inc: { stock: quantity } })
            throw err
        }
    } catch (error) {
        if (error.name === 'CastError') return res.badRequest('Product not found')
        res.serverError(error.message)
    }
})

// เพิ่มรายการ products (เฉพาะ shop) ส่งเป็น multipart/form-data
router.post('/', verifyToken, role('shop'), upload, async function(req, res, next) {
    console.log('FILE:', req.file)
    console.log('BODY:', req.body)
    try {
        const { name, price, stock, description } = req.body

        const checkName = await productSchema.findOne({ name: name })
        if (checkName) {
            if (req.file) removeImage(`/uploads/${req.file.filename}`)
            return res.badRequest('Product name already exists')
        }

        const product = new productSchema({
            name: name,
            price: price,
            stock: stock,
            description: description,
            image: req.file ? `/uploads/${req.file.filename}` : '',
            shop: req.auth.id
        })

        await product.save()
        res.created('Created Product Success', product)

    } catch (error) {
        if (req.file) removeImage(`/uploads/${req.file.filename}`)
        res.serverError(error.message)
    }
});

// แก้ไขข้อมูล (เฉพาะเจ้าของสินค้า)
router.put('/:id', verifyToken, role('shop'), upload, async function(req, res, next) {
    try {
        const { id } = req.params
        const { name, price, stock, description } = req.body
        const newImage = req.file ? `/uploads/${req.file.filename}` : null

        const product = await productSchema.findById(id)
        if (!product) {
            if (newImage) removeImage(newImage)
            return res.badRequest('Product not found')
        }

        if (String(product.shop) !== req.auth.id) {
            if (newImage) removeImage(newImage)
            return res.unauthorized('Permission denied')
        }

        if (name !== undefined) {
            const checkName = await productSchema.findOne({ name: name, _id: { $ne: id } })
            if (checkName) {
                if (newImage) removeImage(newImage)
                return res.badRequest('Product name already exists')
            }
            product.name = name
        }
        if (price !== undefined) product.price = price
        if (stock !== undefined) product.stock = stock
        if (description !== undefined) product.description = description

        if (newImage) {
            removeImage(product.image) // ลบรูปเก่า
            product.image = newImage
        }

        await product.save()
        res.ok('Edit Product Success', product)

    } catch (error) {
        if (req.file) removeImage(`/uploads/${req.file.filename}`)
        if (error.name === 'CastError') return res.badRequest('Product not found')
        res.serverError(error.message)
    }
});

// ลบข้อมูล (เฉพาะเจ้าของสินค้า)
router.delete('/:id', verifyToken, role('shop'), async function(req, res, next) {
    try{
        const product = await productSchema.findById(req.params.id)
        if (!product) return res.badRequest('Product not found')

        if (String(product.shop) !== req.auth.id) {
            return res.unauthorized('Permission denied')
        }

        await product.deleteOne()
        removeImage(product.image)

        res.ok('Delete Product Success', product)
    } catch (error) {
        if (error.name === 'CastError') return res.badRequest('Product not found')
        res.serverError(error.message)
    }
});

module.exports = router;