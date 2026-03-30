// mobile-app/src/context/CartContext.js
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Savatchaga qo'shish
  const addToCart = (cake, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.cakeId === cake.id);
      
      if (existingItem) {
        // Agar mavjud bo'lsa, quantity ni oshirish
        return prev.map(item =>
          item.cakeId === cake.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Yangi qo'shish
        return [...prev, {
          id: Date.now(),
          cakeId: cake.id,
          name: cake.name,
          price: cake.price,
          quantity: quantity,
          imageUrl: cake.imageUrl,
        }];
      }
    });
  };

  // Quantity ni o'zgartirish
  const updateQuantity = (cakeId, change) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.cakeId === cakeId) {
          const newQuantity = item.quantity + change;
          if (newQuantity < 1) return item;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Savatchadan o'chirish
  const removeFromCart = (cakeId) => {
    setCartItems(prev => prev.filter(item => item.cakeId !== cakeId));
  };

  // Savatchani tozalash
  const clearCart = () => {
    setCartItems([]);
  };

  // Jami summa
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Savatcha soni
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalAmount,
      cartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
