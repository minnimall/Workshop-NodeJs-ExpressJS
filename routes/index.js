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
    const { username, name, tel, password } = req.body
    const checkUsername = await userSchema.findOne({ username: username })
    if (checkUsername) return res.badRequest('Username already exists')

    const checkTel = await userSchema.findOne({ tel: tel })
    if (checkTel) return res.badRequest('Tel already exists')

    const hash = await bcrypt.hash(password, 10)

    const user = new userSchema({
      username: username,
      name: name,
      tel: tel,
      password: hash
    })

    await user.save()
    res.created('Register Success. Waiting for approve.', { _id: user._id, username: user.username, name: user.name, tel: user.tel, approve: user.approve })

  } catch (error) {
    res.serverError(error.message)
  }
});

// เข้าสู่ระบบ
router.post('/login', async function(req, res, next) {
  try {
    const { username, password } = req.body

    const user = await userSchema.findOne({ username: username })
    if (!user) return res.badRequest('User not found')

    const compare_hash = await bcrypt.compare(password, user.password)
    if (!compare_hash) return res.badRequest('Invalid password')

    if (!user.approve) return res.unauthorized('Waiting for approve')

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' })

    res.ok('Login Success', { token: token })

  } catch (error) {
    res.serverError(error.message)
  }
});

module.exports = router;
