const db = require('../models')
require('dotenv').config()
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const Product = db.Product
const Category = db.Category
const User = db.User
const Farmer = db.Farmer
const Payment = db.Payment
const Order = db.Order
const Population = db.Population
const pageLimit = 10
const sequelize = require('sequelize');
const Op = sequelize.Op
const fs = require('fs')

const adminController = {
  getIndex: (req, res) => {
    Order.findAll({ include: 'items', }).then(orders => {
      orders = orders.map(order => ({
        ...order.dataValues,
      }))
      //資料解構測試
      orders.forEach(element => (element))
      orders.forEach(element => (element.items).forEach(eter => (eter.dataValues.OrderItem.quantity)));
      //根據paid條件重構product資料
      let productA = []
      let paidarr = []
      for (let i = 0; i < orders.length; i++) {
        if (orders[i].payment_status == 'paid') {
          paidarr.push('1')
          for (let a = 0; a < orders[i].items.length; a++) {
            let product = {};

            product.sn = (orders[i].sn)
            product.pid = (orders[i].items[a].dataValues.id)
            product.pname = (orders[i].items[a].dataValues.name)
            product.pprice = (orders[i].items[a].dataValues.price)
            product.pquantity = (orders[i].items[a].dataValues.OrderItem.quantity)
            product.pamount = (orders[i].items[a].dataValues.price) * (orders[i].items[a].dataValues.OrderItem.quantity)
            productA.push(product)
          }
        }
      }

      for (var i = 0; i < productA.length; i++) {
        for (var a = 1; a < productA.length; a++) {
          if (productA[i].pid === productA[a].pid && productA[i].sn !== productA[a].sn) {
            productA[i].pprice += productA[a].pprice
            productA[i].pquantity += productA[a].pquantity
            productA[i].pamount += productA[a].pamount
            productA.splice(a, 1)
          }
        }
      }
      Order.findAll({
        attributes: [
          'UserId',
          [sequelize.fn('sum', sequelize.col('amount')), 'total_amount'],
          [sequelize.fn('sum', sequelize.col('cost')), 'total_cost'],
        ],
        where: {
          payment_status: 'paid'
        },
        group: ['UserId'],


      }).then(userAmounts => {
        userAmounts = userAmounts.map(userAmount => ({
          ...userAmount.dataValues,
        }))

        let orderamount = 0
        let ordercost = 0
        for (let i = 0; i < userAmounts.length; i++) {
          orderamount += Number(userAmounts[i].total_amount)
          ordercost += Number(userAmounts[i].total_cost)
        }

        var backendData = {
          total_orders: orders.length, //總訂單數量
          conclude_orders: paidarr.length, //成交訂單量
          total_amount: orderamount, //成交金額
          total_cost: ordercost, //成本
          gross: orderamount - ordercost, //毛利
          profit_margin: Math.round((orderamount - ordercost) / orderamount * 100), //毛利率
          per_customer_transaction: orderamount / userAmounts.length //客單價
        }


        return res.render('admin/index', {
          orders, userAmounts, productA, backendData
        })
      })
    })
  },

  getUsers: (req, res) => {
    return User.findAll({
      where: {
        role: 'user'
      }
    }).then((users) => {
      users = users.map(user => ({
        ...user.dataValues,
      }))
      return res.render('admin/users', { users: users })
    })
  },
  getUserdetail: (req, res) => {
    return User.findByPk(req.params.id, {
      include: { model: Order, include: { model: Product, as: 'items' } },
    }).then((user) => {
      user = user.dataValues
      return res.render('admin/userdetail', { user: user })
    })
  },
  createUser: (req, res) => {
    return res.render('admin/createUser')
  },
  postUser: (req, res) => {
    return User.create({
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      tel: req.body.tel,
      role: 'user'
    })
      .then((user) => {
        res.redirect('/admin/users')
      })
  },
  editUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      return res.render('admin/createUser', { user: user })
    })
  },
  putUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        user.update({
          name: req.body.name,
          email: req.body.email,
          address: req.body.address,
          tel: req.body.tel,
          role: req.body.role
        })
          .then((user) => {
            res.redirect('/admin/users')
          })
      })
  },
  deleteUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then((user) => {
        user.destroy()
          .then((user) => {
            res.redirect('/admin/users')
          })
      })
  },

  getFarmers: (req, res) => {
    return Farmer.findAll({
    }).then((farmers) => {
      farmers = farmers.map(farmer => ({
        ...farmer.dataValues,
      }))
      return res.render('admin/farmers', { farmers: farmers })
    })
  },
  getFarmerdetail: (req, res) => {
    return Farmer.findByPk(req.params.id, {
      include: { model: Product, where: { FarmerId: req.params.id } },
    }).then((farmer) => {
      farmer = farmer.dataValues
      return res.render('admin/farmerdetail', { farmer: farmer })
    })
  },
  createFarmer: (req, res) => {
    return res.render('admin/createFarmer')
  },
  postFarmer: (req, res) => {
    return Farmer.create({
      name: req.body.name,
      tel: req.body.tel,
      address: req.body.address,
      line: req.body.line
    })
      .then((farmer) => {
        res.redirect('/admin/farmers')
      }).catch(function (err) {
        // print the error details
        console.log(err, req.body.name);
      });
  },
  editFarmer: (req, res) => {
    return Farmer.findByPk(req.params.id).then(farmer => {
      return res.render('admin/createFarmer', { farmer: farmer })
    })
  },
  putFarmer: (req, res) => {
    return Farmer.findByPk(req.params.id)
      .then((farmer) => {
        farmer.update({
          name: req.body.name,
          line: req.body.line,
          address: req.body.address,
          tel: req.body.tel
        })
          .then((farmer) => {
            res.redirect('/admin/farmers')
          })
      })
  },
  deleteFarmer: (req, res) => {
    return Farmer.findByPk(req.params.id)
      .then((farmer) => {
        farmer.destroy()
          .then((farmer) => {
            res.redirect('/admin/farmers')
          })
      })
  },

  getOrders: (req, res) => {
    Order.findAll({ include: 'items' }).then(orders => {
      return res.render('admin/orders', {
        orders
      })
    })
  },
  getOrderdetail: (req, res) => {
    Order.findByPk(req.params.id, { include: 'items' }).then(order => {
      order = order.dataValues
      order.createdAt = order.createdAt.toDateString()
      return res.render('admin/orderdetail', { order })
    })
  },
  editOrder: (req, res) => {
    return Order.findByPk(req.params.id).then(order => {
      return res.render('admin/editOrder', { order: order })
    })
  },
  putOrder: (req, res) => {
    return Order.findByPk(req.params.id)
      .then((order) => {
        order.update({
          name: req.body.name,
          phone: req.body.phone,
          address: req.body.address,
          UserId: req.body.UserId,
          shipping_status: req.body.shipping_status,
          payment_status: req.body.payment_status,
          sn: req.body.sn,
        })
          .then((order) => {
            res.redirect('/admin/orders')
          })
      })
  },
  deleteOrder: (req, res) => {
    return Order.findByPk(req.params.id)
      .then((order) => {
        order.destroy()
          .then((order) => {
            res.redirect('/admin/orders')
          })
      })
  },

  getProducts: (req, res) => {
    let offset = 0
    let whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }

    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }

    Product.findAndCountAll({
      order: [['id', 'ASC']], include: Category, where: whereQuery, offset: offset, limit: pageLimit
    }).then(result => {
      // data for pagination
      let page = Number(req.query.page) || 1
      let pages = Math.ceil(result.count / pageLimit)
      let totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      let prev = page - 1 < 1 ? 1 : page - 1
      let next = page + 1 > pages ? pages : page + 1
      // clean up product data
      const data = result.rows.map(r => ({

        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50)
      }))
      Category.findAll().then(categories => { // 取出 categoies 
        return res.render('admin/products', {
          products: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next
        })

      })
    })

  },
  getProductdetail: (req, res) => {
    Product.findByPk(req.params.id, { include: Category }).then(product => {
      product = product.dataValues
      return res.render('admin/productdetail', { product })
    })
  },
  createProduct: (req, res) => {
    Category.findAll().then(categories => {
      Population.findAll().then(populations => {
        Farmer.findAll().then(farmers => { return res.render('admin/createProduct', { categories, populations, farmers }) })
      })
    })
  },
  postProduct: (req, res) => {
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Product.create({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          image: file ? img.data.link : product.image,
          CategoryId: req.body.CategoryId,
          PopulationId: req.body.PopulationId,
          FarmerId: req.body.FarmerId
        }).then((product) => {
          req.flash('success_messages', 'product was successfully created')
          return res.redirect('/admin/products')
        })
      })
    }
    else {
      return Product.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: product.image,
        CategoryId: req.body.CategoryId,
        PopulationId: req.body.PopulationId,
        FarmerId: req.body.FarmerId
      }).then((product) => {
        req.flash('success_messages', 'product was successfully created')
        return res.redirect('/admin/products')
      })
    }
  },
  editProduct: (req, res) => {
    return Product.findByPk(req.params.id, {
      include: [
        { model: Category },
        { model: Population },
        { model: Farmer },
      ]
    }).then(product => {
      product = product.dataValues
      console.log(product)
      return res.render('admin/createProduct', { product })
    })
  },
  putProduct: (req, res) => {

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Product.findByPk(req.params.id)
          .then((product) => {
            product.update({
              name: req.body.name,
              description: req.body.description,
              price: req.body.price,
              image: file ? img.data.link : product.image,
              CategoryId: req.body.CategoryId,
              PopulationId: req.body.PopulationId,
              FarmerId: req.body.FarmerId
            })
              .then((product) => {
                req.flash('success_messages', 'product was successfully to update')
                res.redirect('/admin/products')
              })
          })
      })
    }
    else
      return Product.findByPk(req.params.id)
        .then((product) => {
          product.update({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            image: file ? img.data.link : product.image,
            CategoryId: req.body.CategoryId,
            PopulationId: req.body.PopulationId,
            FarmerId: req.body.FarmerId
          })
            .then((product) => {
              req.flash('success_messages', 'product was successfully to update')
              res.redirect('/admin/products')
            })
        })
  },
  deleteProduct: (req, res) => {
    return Product.findByPk(req.params.id)
      .then((product) => {
        product.destroy()
          .then((product) => {
            res.redirect('/admin/products')
          })
      })
  },

  getCategories: (req, res) => {
    return Category.findAll().then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then((category) => {
            return res.render('admin/categories', { categories: categories, category: category })
          })
      } else {
        return res.render('admin/categories', { categories: categories })
      }
    })
  },
  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.create({
        name: req.body.name
      })
        .then((category) => {
          res.redirect('/admin/categories')
        })
    }
  },
  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.findByPk(req.params.id)
        .then((category) => {
          category.update(req.body)
            .then((category) => {
              res.redirect('/admin/categories')
            })
        })
    }
  },
  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        category.destroy()
          .then((category) => {
            res.redirect('/admin/categories')
          })
      })
  },

  getPopulations: (req, res) => {
    return Population.findAll().then(populations => {
      if (req.params.id) {
        Population.findByPk(req.params.id)
          .then((population) => {
            return res.render('admin/populations', { populations: populations, population: population })
          })
      } else {
        return res.render('admin/populations', { populations: populations })
      }
    })
  },
  postPopulation: (req, res) => {
    if (!req.body.population) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Population.create({
        population: req.body.population
      })
        .then((population) => {
          res.redirect('/admin/populations')
        })
    }
  },
  putPopulation: (req, res) => {
    if (!req.body.population) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Population.findByPk(req.params.id)
        .then((population) => {
          population.update(req.body)
            .then((population) => {
              res.redirect('/admin/populations')
            })
        })
    }
  },
  deletePopulation: (req, res) => {
    return Population.findByPk(req.params.id)
      .then((population) => {
        population.destroy()
          .then((population) => {
            res.redirect('/admin/populations')
          })
      })
  }

}
module.exports = adminController




