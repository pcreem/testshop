const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null),
            address: req.body.address,
            tel: req.body.phone,
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },




  getUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      return res.render('users', {
        user: user
      })
    })
  },

  editUser: (req, res) => {

    let uid = Number(req.params.id)

    if (uid !== req.user.id) {
      req.flash('error_messages', "you can't edit other user's profile")
      return res.redirect('back')
    }


    return User.findByPk(req.params.id).then(user => {
      return res.render('users/edit', {
        user: user
      })
    })
  },

  putUsers: (req, res) => {
    let uid = Number(req.params.id)

    if (uid !== req.user.id) {
      req.flash('error_messages', "you can not edit other profile")
      res.redirect('/users/' + req.user.id)
    }

    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {

      console.log('file exits heree')
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        console.log('heree imgLink:' + img.data.link)

        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              address: req.body.address,
              tel: req.body.tel,
              image: file ? img.data.link : user.image,
            })
              .then((user) => {
                req.flash('success_messages', 'user was successfully to update')
                res.redirect('/users/' + req.params.id)
              })
          })
      })
    }
    else {


      console.log('file not exist heree')
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            address: req.body.address,
            tel: req.body.tel,
            image: user.image
          })
            .then((user) => {
              req.flash('success_messages', 'user was successfully to update')
              res.redirect('/users/' + req.params.id)
            })
        })
    }
  },

}

module.exports = userController
