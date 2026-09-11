import express from "express";
const router = express.Router();
import { addToCart, getCartItems, updateQuantity, removeCartItem, clearCart } from "../controllers/cartController.js";
import { protectedRoute } from "../middleware/productMiddleware.js";


router.post('/add', protectedRoute, addToCart);
router.get('/', protectedRoute, getCartItems);
router.put('/:itemId', protectedRoute, updateQuantity);
router.delete('/clear', protectedRoute, clearCart);
router.delete('/:itemId', protectedRoute, removeCartItem);

export default router;