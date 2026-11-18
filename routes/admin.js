var express = require('express');
var router = express.Router();
var userSchema = require('../models/user')
var productSchema = require('../models/product')
var orderSchema = require('../models/order')

// สถิติรวมสำหรับแดชบอร์ด
router.get('/stats', async function(req, res) {
    try {
        const [users, pendingUsers, shops, products, orders] = await Promise.all([
            userSchema.countDocuments({}),
            userSchema.countDocuments({ approve: false }),
            userSchema.countDocuments({ role: 'shop' }),
            productSchema.countDocuments({}),
            orderSchema.find({}).populate('product', 'price').select('quantity product')
        ])

        const revenue = orders.reduce(
            (sum, o) => sum + (o.product ? o.product.price * o.quantity : 0), 0
        )

        res.ok('Query stats success', {
            users, pendingUsers, shops, products,
            orders: orders.length, revenue
        })
    } catch (error) {
        res.serverError(error.message)
    }
})

// user ทั้งหมด (ไม่ส่ง password)
router.get('/users', async function(req, res) {
    try {
        const users = await userSchema.find({}).select('-password').sort({ _id: -1 })
        res.ok('Query users success', users)
    } catch (error) {
        res.serverError(error.message)
    }
})

// อนุมัติ / ยกเลิกอนุมัติ  body: { approve: true | false }
router.patch('/users/:id/approve', async function(req, res) {
    try {
        const { id } = req.params
        const approve = req.body.approve === true

        if (id === req.auth.id && !approve) {
            return res.badRequest('Cannot revoke your own approval')
        }

        const user = await userSchema.findByIdAndUpdate(
            id, { approve }, { new: true }
        ).select('-password')
        if (!user) return res.badRequest('User not found')

        res.ok(approve ? 'Approve user success' : 'Revoke approval success', user)
    } catch (error) {
        if (error.name === 'CastError') return res.badRequest('User not found')
        res.serverError(error.message)
    }
})

// สินค้าทั้งหมด พร้อมชื่อร้าน
router.get('/products', async function(req, res) {
    try {
        const products = await productSchema.find({})
            .populate('shop', 'name username')
            .sort({ _id: -1 })
        res.ok('Query products success', products)
    } catch (error) {
        res.serverError(error.message)
    }
})

module.exports = router;