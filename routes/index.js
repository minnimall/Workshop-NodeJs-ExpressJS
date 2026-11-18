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
    const { username, name, tel, password, role } = req.body

    if (!username || !name || !tel || !password) {
      return res.badRequest('กรุณากรอกข้อมูลทุกช่อง')
    }

    const checkUsername = await userSchema.findOne({ username: username })
    if (checkUsername) return res.badRequest('ชื่อ Username นี้ถูกใช้งานแล้ว')

    const checkTel = await userSchema.findOne({ tel: tel })
    if (checkTel) return res.badRequest('เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว')

    const hash = await bcrypt.hash(password, 10)

    // อนุญาตแค่ user กับ shop ห้ามสมัครเป็น admin เอง
    const safeRole = ['user', 'shop'].includes(role) ? role : 'user'

    const user = new userSchema({
      username: username,
      name: name,
      tel: tel,
      role: safeRole,
      password: hash
    })

    await user.save()
    res.created('สมัครสำเร็จ! รอรับการอนุมัติบัญชี', {
      _id: user._id, username: user.username, name: user.name,
      tel: user.tel, role: user.role, approve: user.approve
    })
  } catch (error) {
    res.serverError(error.message)
  }
});

// เข้าสู่ระบบ
router.post('/login', async function(req, res, next) {
  try {
    const { username, password } = req.body

    const user = await userSchema.findOne({ username: username })
    if (!user) return res.badRequest('ไม่พบข้อมูลผู้ใช้งาน')

    const compare_hash = await bcrypt.compare(password, user.password)
    if (!compare_hash) return res.badRequest('รหัสผ่านไม่ถูกต้อง')

    if (!user.approve) return res.unauthorized('รอรับการอนุมัติบัญชี')

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })

    res.ok('Login Success', { token: token, user:{ _id: user._id, username: user.username, name: user.name, role: user.role } })

  } catch (error) {
    res.serverError(error.message)
  }
});

module.exports = router;
