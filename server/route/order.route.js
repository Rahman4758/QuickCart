import { Router } from 'express'
import auth from '../middleware/auth.js'
import { CashOnDeliveryOrderController, getOrderDetailsController, paymentController, verifyRazorpayPayment  } from '../controllers/order.controller.js'

const orderRouter = Router()

orderRouter.post("/cash-on-delivery",auth,CashOnDeliveryOrderController)
orderRouter.post('/checkout',auth,paymentController)
orderRouter.post('/verify-payment',verifyRazorpayPayment)
orderRouter.get("/order-list",auth,getOrderDetailsController)

export default orderRouter