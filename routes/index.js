var express = require('express');
var router = express.Router();
var userSchema = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// สมัครสมาชิก
router.post('/register', async function(req, res, next) {
  try {
    let { username, name, tel, password } = req.body
    let checkUsername = await userSchema.findOne({ username: username })
    if (checkUsername) return res.status(400).send({ status: 400, message: 'Username already exists', data: null })

    let checkTel = await userSchema.findOne({ tel: tel })
    if (checkTel) return res.status(400).send({ status: 400, message: 'Tel already exists', data: null })

    let hash = await bcrypt.hash(password, 10)

    let user = new userSchema({
      username: username,
      name: name,
      tel: tel,
      password: hash
    })

    await user.save()
    res.status(201).send({ status: 201, message: 'Register Success. Waiting for approve.',data: { _id: user._id, username: user.username, name: user.name, tel: user.tel, approve: user.approve }})

  } catch (error) {
    res.status(500).send({ status: 500, message: error.message, data: null })
  }
});

// เข้าสู่ระบบ
router.post('/login', async function(req, res, next) {
  try {
    let { username, password } = req.body

    let user = await userSchema.findOne({ username: username })
    if (!user) return res.status(400).send({ status: 400, message: 'User not found', data: null })

    let compare_hash = await bcrypt.compare(password, user.password)
    if (!compare_hash) return res.status(401).send({ status: 401, message: 'Invalid password', data: null })

    if (!user.approve) return res.status(401).send({ status: 401, message: 'Waiting for approve', data: null })

    let token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' })

    res.status(200).send({ status: 200, message: 'Login Success.', data: { token: token } })

  } catch (error) {
    res.status(500).send({ status: 500, message: error.message, data: null })
  }
});

module.exports = router;
