'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// uuidv4 is no longer needed as we are using the actual product_id from the database
// import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
    // Removed _id field as it was a temporary UUID, not the database product ID
    // _id: string;
    // Changed product_id type to string to match MongoDB ObjectId string representation
    product_id: string;
    product_name: string;
    image: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
}

interface CartContextType {
    cartItems: CartItem[]; // addToCart now expects an item without the temporary _id
    addToCart: (item: Omit<CartItem, '_id'>) => void; // removeFromCart and updateQuantity now use product_id, size, and color to identify the item
    removeFromCart: (productId: string, size: string, color: string) => void;
    updateQuantity: (
        productId: string,
        size: string,
        color: string,
        quantity: number,
    ) => void;
    clearCart: () => void;
    isLoading: boolean;
    totalItems: number;
    totalPrice: number;
    isAuthenticated: boolean;
    logout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
// eslint-disable-next-line 
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    useEffect(() => {
        let isMounted = true;

        const checkAuthAndLoadCart = async () => {
            if (!isMounted) return;

          try {
              const backendUrl =
                  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                const res = await fetch(
                    `${backendUrl}/api/users/check-session`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    },
                );
                const data = await res.json();
                if (isMounted) {
                    setIsAuthenticated(data.authenticated);
                    if (data.authenticated && data.user) {
                        // When loading cart from backend, ensure product_id is the string ObjectId
                        const cartRes = await fetch(
                            `${backendUrl}/api/cart`,
                            {
                                method: 'GET',
                                credentials: 'include',
                            },
                        );
                        const cartData = await cartRes.json(); // Assuming cartData.items from backend has product_id as string ObjectId
                        setCartItems(cartData.items || []);
                    } else {
                        setCartItems([]);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((err as any)?.status !== 401) {
                        console.error(
                            'Error checking auth status or loading cart:',
                            err,
                        );
                    }
                    setIsAuthenticated(false);
                    setCartItems([]);
                }
            }
        };

        checkAuthAndLoadCart();

        return () => {
            isMounted = false;
        };
    }, []); // Helper function to find an item in the cart by product_id, size, and color

    const findCartItem = (productId: string, size: string, color: string) => {
        return cartItems.find(
            (item) =>
                item.product_id === productId &&
                item.size === size &&
                item.color === color,
        );
    };

    const syncCart = async (updated: CartItem[]) => {
        if (!isAuthenticated) {
            console.warn('User not authenticated, cannot sync cart'); // Instead of throwing an error, maybe handle this more gracefully in the UI // throw new Error('Please log in to sync cart');
            return; // Exit if not authenticated
        }

        setIsLoading(true);
      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const res = await fetch(`${backendUrl}/api/cart`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ items: updated }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 401) {
                    setIsAuthenticated(false); // Consider showing a message to the user to log in
                    console.error('Session expired, please log in again');
                }
                throw new Error(errorData.message || 'Failed to sync cart');
            }

            const data = await res.json();
            setCartItems(data.items);
        } catch (err) {
            console.error('Failed to sync cart:', err); // Re-throw the error so components using syncCart can handle it (e.g., show error message)
            throw err;
        } finally {
            setIsLoading(false);
        }
    }; // newItem should already contain the correct product_id (string ObjectId)

    const addToCart = async (newItem: Omit<CartItem, '_id'>) => {
        if (!isAuthenticated) {
            console.warn('User not authenticated, cannot add to cart'); // Consider storing in local storage or showing a login prompt
            return;
        } // Find existing item based on product_id, size, and color

        const exists = findCartItem(
            newItem.product_id,
            newItem.size,
            newItem.color,
        );

        const updated = exists
            ? cartItems.map(
                  (
                      item, // Update existing item based on product_id, size, and color
                  ) =>
                      item.product_id === newItem.product_id &&
                      item.size === newItem.size &&
                      item.color === newItem.color
                          ? {
                                ...item,
                                quantity: item.quantity + newItem.quantity,
                            }
                          : item,
              )
            : // Add new item if it doesn't exist
              [...cartItems, newItem as CartItem]; // Cast newItem to CartItem as _id is removed

        try {
            await syncCart(updated);
        } catch (err) {
            console.error('Failed to add item to cart:', err); // Handle error in UI, e.g., show a dialog
        }
    };

    const updateQuantity = async (
        productId: string, // Use product_id instead of temporary itemId
        size: string,
        color: string,
        quantity: number,
    ) => {
        if (!isAuthenticated) {
            console.warn('User not authenticated, cannot update quantity');
            return;
        }
        if (quantity < 1) return;

        const updated = cartItems.map(
            (
                item, // Find item based on product_id, size, and color
            ) =>
                item.product_id === productId &&
                item.size === size &&
                item.color === color
                    ? { ...item, quantity }
                    : item,
        );
        try {
            await syncCart(updated);
        } catch (err) {
            console.error('Failed to update quantity:', err); // Handle error in UI
        }
    };

    const removeFromCart = async (
        productId: string, // Use product_id instead of temporary itemId
        size: string,
        color: string,
    ) => {
        if (!isAuthenticated) {
            console.warn('User not authenticated, cannot remove item');
            return;
        } // Filter out the item based on product_id, size, and color
        const updated = cartItems.filter(
            (item) =>
                !(
                    item.product_id === productId &&
                    item.size === size &&
                    item.color === color
                ),
        );
        try {
            await syncCart(updated);
        } catch (err) {
            console.error('Failed to remove item from cart:', err); // Handle error in UI
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) {
            console.warn('User not authenticated, cannot clear cart');
            return;
        }
      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            setIsLoading(true);
            const res = await fetch(`${backendUrl}/api/cart`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 401) {
                    setIsAuthenticated(false);
                    console.error('Session expired, please log in again');
                }
                throw new Error(errorData.message || 'Failed to clear cart');
            }
            setCartItems([]);
        } catch (err) {
            console.error('Failed to clear cart:', err); // Handle error in UI
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
      try {
          const backendUrl =
              import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            await fetch(`${backendUrl}/api/users/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            setIsAuthenticated(false);
            setCartItems([]);
            window.location.href = '/'; // Redirect after logout
        } catch (err) {
            console.error('Failed to logout:', err); // Handle error in UI
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQuantity,
                removeFromCart,
                clearCart,
                isLoading,
                totalItems,
                totalPrice,
                isAuthenticated,
                logout,
            }}
        >
           {children}
        </CartContext.Provider>
    );
};
