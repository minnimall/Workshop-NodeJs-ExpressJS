var express = require('express');
var router = express.Router();
var userSchema = require('../models/user')
const bcrypt = require('bcrypt')

// ดึงข้อมูลของ user
router.get('/', async function(req, res, next) {
  try{
        let users = await userSchema.find({}).select('-password')
        res.ok('Query user success', users)
      } catch (error) {
    res.serverError(error.message)
  }
})

// ปรับแก้ไข approve เป็น true
router.put('/:id/approve', async function(req, res, next) {
  try{
    const { id } = req.params
    
    const user = await userSchema.findByIdAndUpdate(id,{
      approve: true
    }, { new:true}).select('-password')

    if (!user) return res.badRequest('User not found')

    res.ok('Approve user success', user)

  } catch (error) {
    res.serverError(error.message)
  }
});

module.exports = router;
