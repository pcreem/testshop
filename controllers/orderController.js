const db = require('../models')
const nodemailer = require('nodemailer')
var crypto = require('crypto')

const Order = db.Order
const OrderItem = db.OrderItem
const Cart = db.Cart
const CartItem = db.CartItem
require('dotenv').config()

// const GMAIL_ACCOUNT = process.env.GMAIL_ACCOUNT
// const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     type: "login", // default
//     user: GMAIL_ACCOUNT,
//     pass: GMAIL_PASSWORD
//   },
// })

const etherealUSER = process.env.etherealUSER
const etherealPASS = process.env.etherealPASS


const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: etherealUSER,
    pass: etherealPASS
  }
});

// 藍新金流串接
const URL = process.env.URL
const MerchantID = process.env.MerchantID
const HashKey = process.env.HashKey
const HashIV = process.env.HashIV
const PayGateWay = "https://ccore.spgateway.com/MPG/mpg_gateway"
const ReturnURL = URL + "/newebpay/callback?from=ReturnURL"
const NotifyURL = URL + "/newebpay/callback?from=NotifyURL"
const ClientBackURL = URL + "/orders"

function genDataChain(TradeInfo) {
  let results = [];
  for (let kv of Object.entries(TradeInfo)) {
    results.push(`${kv[0]}=${kv[1]}`);
  }
  return results.join("&");
}

function create_mpg_aes_decrypt(TradeInfo) {
  let decrypt = crypto.createDecipheriv("aes256", HashKey, HashIV);
  decrypt.setAutoPadding(false);
  let text = decrypt.update(TradeInfo, "hex", "utf8");
  let plainText = text + decrypt.final("utf8");
  let result = plainText.replace(/[\x00-\x20]+/g, "");
  return result;
}

function create_mpg_aes_encrypt(TradeInfo) {
  let encrypt = crypto.createCipheriv("aes256", HashKey, HashIV);
  let enc = encrypt.update(genDataChain(TradeInfo), "utf8", "hex");
  return enc + encrypt.final("hex");
}

function create_mpg_sha_encrypt(TradeInfo) {

  let sha = crypto.createHash("sha256");
  let plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`

  return sha.update(plainText).digest("hex").toUpperCase();
}

function getTradeInfo(Amt, Desc, email) {

  console.log('===== getTradeInfo =====')
  console.log(Amt, Desc, email)
  console.log('==========')

  data = {
    'MerchantID': MerchantID, // 商店代號
    'RespondType': 'JSON', // 回傳格式
    'TimeStamp': Date.now(), // 時間戳記
    'Version': 1.5, // 串接程式版本
    'MerchantOrderNo': Date.now(), // 商店訂單編號
    'LoginType': 0, // 智付通會員
    'OrderComment': 'OrderComment', // 商店備註
    'Amt': Amt, // 訂單金額
    'ItemDesc': Desc, // 產品名稱
    'Email': email, // 付款人電子信箱
    'ReturnURL': ReturnURL, // 支付完成返回商店網址
    'NotifyURL': NotifyURL, // 支付通知網址/每期授權結果通知
    'ClientBackURL': ClientBackURL, // 支付取消返回商店網址
  }

  console.log('===== getTradeInfo: data =====')
  console.log(data)


  mpg_aes_encrypt = create_mpg_aes_encrypt(data)
  mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)

  console.log('===== getTradeInfo: mpg_aes_encrypt, mpg_sha_encrypt =====')
  console.log(mpg_aes_encrypt)
  console.log(mpg_sha_encrypt)

  tradeInfo = {
    'MerchantID': MerchantID, // 商店代號
    'TradeInfo': mpg_aes_encrypt, // 加密後參數
    'TradeSha': mpg_sha_encrypt,
    'Version': 1.5, // 串接程式版本
    'PayGateWay': PayGateWay,
    'MerchantOrderNo': data.MerchantOrderNo,
  }

  console.log('===== getTradeInfo: tradeInfo =====')
  console.log(tradeInfo)

  return tradeInfo
}



let orderController = {
  getOrders: (req, res) => {

    Order.findAll({
      where: { UserId: req.user.id },
      include: 'items'
    }).then(orders => {
      return res.render('orders', {
        orders
      })
    })
  },
  postOrder: (req, res) => {

    // console.log(req.body.cartId)
    //1 get cart
    return Cart.findByPk(req.body.cartId, { include: 'items' }).then(cart => {

      //2 create order
      Order.create({
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        amount: req.body.amount,
        shipping_status: req.body.shipping_status,
        payment_status: req.body.payment_status,
        UserId: req.user.id
      }).then(order => {
        //3 copy cart to order

        var results = []
        for (var i = 0; i < cart.items.length; i++) {
          // console.log(order.id, cart.items[i].id)

          results.push(
            OrderItem.create({
              OrderId: order.id,
              ProductId: cart.items[i].id,
              price: cart.items[i].price,
              quantity: cart.items[i].CartItem.quantity,
            })
          )

        }

        return Promise.all(results).then(() => {

          if (req.user.email) {
            //目前設定必須到 Gmail 帳戶中的這頁 https://myaccount.google.com/security
            //開啟低安全性設定，以後可改成oauth2 API 串接方式較為安全。
            // https://nodemailer.com/smtp/oauth2/#oauth-3lo
            var mailOptions = {
              from: 'foo@example.com',
              to: 'jasmin.ryan@ethereal.email',
              subject: `${order.id} 訂單成立`,
              text: `${order.id} 訂單成立`,
            }

            // 訂單成立通知信
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error)
              } else {
                console.log('Email sent: ' + info.response);
              }
            })

          } else {
            console.error('Error: user email not exist!!')
          }

          res.redirect('/orders')
        })


      })
    })
  },
  cancelOrder: (req, res) => {
    Order.findByPk(req.params.id).then(order => {
      order.update({
        shipping_status: "-1",
        payment_status: "-1"
      }).then(() => {

        var mailOptions = {
          from: 'foo@example.com',
          to: 'jasmin.ryan@ethereal.email',
          subject: `${order.id} 訂單已取消`,
          text: `${order.id} 訂單已取消`,
        }

        // 訂單取消通知信
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
          } else {
            console.log('Email sent: ' + info.response);
          }
        })

        return res.redirect('back')
      })
    })
  },
  getPayment: (req, res) => {

    Order.findByPk(req.params.id).then(order => {

      const tradeInfo = getTradeInfo(order.amount, process.env.PRODUCT_NAME, 'jasmin.ryan@ethereal.email')

      order.update({
        ...req.body,
        sn: tradeInfo.MerchantOrderNo,
      }).then(order => {
        res.render('payment', { order, tradeInfo })
      })

    })

  },
  newebpayCallback: (req, res) => {
    console.log('===== newebpayCallback =====')
    console.log(req.method)
    console.log(req.query)
    console.log(req.body)
    console.log('==========')


    const data = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo))

    console.log('===== newebpayCallback: create_mpg_aes_decrypt data =====')
    console.log(data)
    console.log(data['Result']['MerchantOrderNo'])


    return Order.findAll({ where: { sn: data['Result']['MerchantOrderNo'] } })
      .then(orders => {
        orders[0].update({
          ...req.body,
          payment_status: 1,
        }).then(order => {


          var mailOptions = {
            from: 'foo@example.com',
            to: 'jasmin.ryan@ethereal.email',
            subject: `${order.id} 訂單已付款成功`,
            text: `${order.id} 訂單已付款成功`,
          }

          // 訂單已付款通知信
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error)
            } else {
              console.log('Email sent: ' + info.response);
            }
          })


          return res.redirect('/orders')
        })
      })
  },
}

module.exports = orderController



// findAll({ include: 'items' })
//也可以這樣寫
/*
findAll({
      include:
        [
          {
            model: Product,
            as: "items"
          }
        ]
    })
    */
