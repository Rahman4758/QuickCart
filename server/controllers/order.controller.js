import razorpay from '../config/razorpay.js'
import crypto from "crypto";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

   export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

    export const pricewithDiscount = (price,dis = 1)=>{
    const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100)
    const actualPrice = Number(price) - Number(discountAmout)
    return actualPrice
}


   export async function verifyRazorpayPayment(req, res) {
   try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, list_items, addressId, subTotalAmt, totalAmt } = req.body;
    const userId = req.userId;

    // Verify payment signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
     }

    // Save order in DB
    const payload = list_items.map(el => ({
      userId: userId,
      orderId: `ORD-${new mongoose.Types.ObjectId()}`,
      productId: el.productId._id,
      product_details: {
        name: el.productId.name,
        image: el.productId.image
      },
      paymentId: razorpay_payment_id,
      payment_status: "PAID",
      delivery_address: addressId,
      subTotalAmt: subTotalAmt,
      totalAmt: totalAmt
    }));

    const generatedOrder = await OrderModel.insertMany(payload);

    // Clear cart
    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    res.json({ success: true, order: generatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


       export async function paymentController(req, res) {
  try {
    const userId = req.userId;
    const { list_items, totalAmt, addressId, subTotalAmt } = req.body;

    const receiptId = `rcptid_${new Date().getTime()}`;

    //create razor pay order
    const options = {
      amount: totalAmt * 100, // in paise
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId: userId,
        addressId: addressId
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
       }

     export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

