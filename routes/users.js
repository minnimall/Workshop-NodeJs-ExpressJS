var express = require('express');
var router = express.Router();
var userSchema = require('../models/user')
const multer = require('multer')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// ปรับแก้ไข approve เป็น true
router.put('/:id/approve', async function(req, res, next) {
  try{
    let { id } = req.params
    
    let user = await userSchema.findByIdAndUpdate(id,{
      approve: true
    }, { new:true}).select('-password')

    if (!user) return res.status(400).send({ status: 400, message: 'User not found', data: null })

    res.status(200).send({ status: 200, message: 'Approve User Success.', data: user })

  } catch (error) {
    res.status(500).send({ status: 500, message: error.message, data: null })
  }
});

module.exports = router;
