var express = require('express');
var router = express.Router();
var userSchema = require('../models/user')
const multer = require('multer')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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
