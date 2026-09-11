import Product from "../models/Product.js";
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    // Validate ObjectId format
    const productIdStr = productId.toString();
    if (!productIdStr.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid product ID format",
        error: "Product ID must be a valid MongoDB ObjectId",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        error: "The requested product does not exist in our catalog",
      });
    }

    // Find existing item in cart
    const existingItemIndex = user.cartItems.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    // Calculate new quantity
    const currentQuantity =
      existingItemIndex > -1 ? user.cartItems[existingItemIndex].quantity : 0;
    const newQuantity = currentQuantity + 1;

    // Check stock availability
    const availableStock = product.stock || 0;
    if (newQuantity > availableStock) {
      return res.status(400).json({
        message: `Insufficient stock. Only ${availableStock} available.`,
        error: "Stock limit exceeded",
        availableStock: availableStock,
        requestedQuantity: newQuantity,
      });
    }

    if (existingItemIndex > -1) {
      // Item exists, increase quantity
      user.cartItems[existingItemIndex].quantity = newQuantity;
    } else {
      // Item doesn't exist, add new item
      user.cartItems.push({
        productId: productId,
        quantity: 1,
      });
    }

    await user.save({ validateBeforeSave: false });

    // Return updated cart with full product details
    const updatedCartItems = await Promise.all(
      user.cartItems.map(async (cartItem) => {
        const product = await Product.findById(cartItem.productId);
        if (product) {
          return {
            ...product.toJSON(),
            quantity: cartItem.quantity,
            cartItemId: cartItem._id,
            productId: cartItem.productId,
          };
        }
        return null;
      })
    ).then((items) => items.filter((item) => item !== null));

    res.status(200).json({
      message: "Product added to cart successfully",
      cartItems: updatedCartItems,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCartItems = async (req, res) => {
  try {
    const user = req.user;

    if (!user.cartItems || user.cartItems.length === 0) {
      return res.status(200).json([]);
    }

    // Filter out invalid product IDs and extract valid ones
    const validCartItems = user.cartItems.filter(
      (item) =>
        item.productId && item.productId.toString().match(/^[0-9a-fA-F]{24}$/)
    );

    if (validCartItems.length === 0) {
      return res.status(200).json([]);
    }

    // Extract product IDs from valid cart items
    const productIds = validCartItems.map((item) => item.productId);

    // Fetch products from database
    const products = await Product.find({ _id: { $in: productIds } });

    // Combine product data with quantity from cart
    const cartItems = validCartItems
      .map((cartItem) => {
        const product = products.find(
          (p) => p._id.toString() === cartItem.productId.toString()
        );
        if (product) {
          return {
            ...product.toJSON(),
            quantity: cartItem.quantity,
            cartItemId: cartItem._id,
            productId: cartItem.productId,
            // Ensure all required fields are present
            price: product.price,
            image: product.image,
            name: product.name,
            description: product.description,
          };
        }
        return null; // Product no longer exists
      })
      .filter((item) => item !== null); // Remove null items

    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    // Validate ObjectId format
    const itemIdStr = itemId.toString();
    if (!itemIdStr.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid cart item ID format",
        error: "Cart item ID must be a valid MongoDB ObjectId",
      });
    }

    // Validate quantity
    if (!quantity || quantity < 0) {
      return res.status(400).json({
        message: "Invalid quantity",
        error: "Quantity must be a non-negative number",
      });
    }

    if (quantity <= 0) {
      // Remove item from cart if quantity is 0 or negative
      user.cartItems = user.cartItems.filter(
        (item) => item._id.toString() !== itemId.toString()
      );
      await user.save({ validateBeforeSave: false });

      // Return updated cart with full product details
      const updatedCartItems = await Promise.all(
        user.cartItems.map(async (cartItem) => {
          const product = await Product.findById(cartItem.productId);
          if (product) {
            return {
              ...product.toJSON(),
              quantity: cartItem.quantity,
              cartItemId: cartItem._id,
              productId: cartItem.productId,
            };
          }
          return null;
        })
      ).then((items) => items.filter((item) => item !== null));

      return res.status(200).json({
        message: "Item removed from cart",
        cartItems: updatedCartItems,
      });
    }

    // Find and update the item
    const existingItemIndex = user.cartItems.findIndex(
      (item) => item._id.toString() === itemId.toString()
    );
    if (existingItemIndex > -1) {
      // Get the product to check stock
      const cartItem = user.cartItems[existingItemIndex];
      const product = await Product.findById(cartItem.productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          error: "The product in your cart no longer exists",
        });
      }

      // Check stock availability
      const availableStock = product.stock || 0;
      if (quantity > availableStock) {
        return res.status(400).json({
          message: `Insufficient stock. Only ${availableStock} available.`,
          error: "Stock limit exceeded",
          availableStock: availableStock,
          requestedQuantity: quantity,
        });
      }

      user.cartItems[existingItemIndex].quantity = quantity;
      await user.save({ validateBeforeSave: false });

      // Return updated cart with full product details
      const updatedCartItems = await Promise.all(
        user.cartItems.map(async (cartItem) => {
          const product = await Product.findById(cartItem.productId);
          if (product) {
            return {
              ...product.toJSON(),
              quantity: cartItem.quantity,
              cartItemId: cartItem._id,
              productId: cartItem.productId,
            };
          }
          return null;
        })
      ).then((items) => items.filter((item) => item !== null));

      res.status(200).json({
        message: "Quantity updated successfully",
        cartItems: updatedCartItems,
      });
    } else {
      return res.status(400).json({ message: "Product not in cart" });
    }
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = req.user;

    // Validate ObjectId format
    const itemIdStr = itemId.toString();
    if (!itemIdStr.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "Invalid cart item ID format",
        error: "Cart item ID must be a valid MongoDB ObjectId",
      });
    }

    // Find the item in cart
    const existingItemIndex = user.cartItems.findIndex(
      (item) => item._id.toString() === itemId.toString()
    );

    if (existingItemIndex === -1) {
      return res.status(400).json({ message: "Product not in cart" });
    }

    // Remove the item from cart
    user.cartItems.splice(existingItemIndex, 1);
    await user.save({ validateBeforeSave: false });

    // Return updated cart with full product details
    const updatedCartItems = await Promise.all(
      user.cartItems.map(async (cartItem) => {
        const product = await Product.findById(cartItem.productId);
        if (product) {
          return {
            ...product.toJSON(),
            quantity: cartItem.quantity,
            cartItemId: cartItem._id,
            productId: cartItem.productId,
          };
        }
        return null;
      })
    ).then((items) => items.filter((item) => item !== null));

    res.status(200).json({
      message: "Item removed from cart successfully",
      cartItems: updatedCartItems,
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user = req.user;
    user.cartItems = [];
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      message: "Cart cleared successfully",
      cartItems: [],
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Server error" });
  }
};
