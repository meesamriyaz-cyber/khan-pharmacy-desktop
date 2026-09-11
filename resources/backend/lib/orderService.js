// services/orderService.js
import Order from "../models/Order.js";

/**
 * Create a new order after successful payment verification
 */
export const createOrder = async ({
  userId,
  orderItems,
  totalAmount,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  shippingAddress,
  couponApplied
}) => {
  const order = new Order({
    user: userId,
    orderItems,
    totalAmount,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    paymentStatus: "paid",
    status: "processing",
    shippingAddress,
    couponApplied
  });

  return await order.save();
};

/**
 * Fetch order with populated user + product details (for invoice)
 */
export const getOrderWithDetails = async (orderId) => {
  return await Order.findById(orderId)
    .populate("user", "name email")
    .populate("orderItems.product", "name price");
};