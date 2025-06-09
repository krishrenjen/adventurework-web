import { Product } from "../interfaces/Product";
import { callAuthenticatedApi, isAuthenticated } from "./Auth";

export type CartItem = {
  productId: number;
  name: string;
  listPrice: number;
  quantity: number;
};

const CART_KEY = "cart_items";

// Load cart from localStorage
export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Failed to load cart:", err);
    return [];
  }
}

// Save cart to localStorage
function saveCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
}

// Add an item to the cart (updates quantity if already exists)
export function addToCart(item: Omit<CartItem, "quantity">, quantity: number = 1): boolean {
  const currentCart = loadCart();
  const index = currentCart.findIndex((i) => i.productId === item.productId);

  if (index === -1) {
    // Item not in cart, add new
    const updatedCart = [...currentCart, { ...item, quantity }];
    saveCart(updatedCart);
    return true;
  } else {
    // Item exists, update quantity
    currentCart[index].quantity += quantity;
    saveCart(currentCart);
    return true;
  }
}

// Edit quantity of an item in the cart
export function editCartItem(productId: number, quantity: number): boolean {
  const currentCart = loadCart();
  const index = currentCart.findIndex((item) => item.productId === productId);

  if (index === -1) {
    console.error("Item not found in cart");
    return false;
  }

  if (quantity <= 0) {
    // If quantity is zero or less, remove the item
    removeFromCart(productId);
    return true;
  }

  // Update quantity
  currentCart[index].quantity = quantity;
  saveCart(currentCart);
  return true;
}


// Remove an item from the cart by productId
export function removeFromCart(productId: number) {
  const currentCart = loadCart();
  const updatedCart = currentCart.filter((item) => item.productId !== productId);
  saveCart(updatedCart);
}

// Get quantity of a specific item in the cart
export function getCartItemQuantity(productId: number): number {
  const currentCart = loadCart();
  const item = currentCart.find((i) => i.productId === productId);
  return item ? item.quantity : 0;
}

export async function refreshCartNameAndPrice(){
  if(isAuthenticated() === false) {
    console.warn("User is not authenticated, cannot refresh cart items.");
    return;
  }
  const currentCart = loadCart();
  const updatedCart = await Promise.all(currentCart.map(async (item) => {
    const res = await callAuthenticatedApi(
              `products/${item.productId}`, { method: 'GET' },);
    if (!res.ok) {
      return undefined; // product was probably deleted
    }

    const product : Product = await res.json();
    return {
      productId: item.productId,
      name: product.name, // Fetch updated name if needed
      listPrice: product.listPrice, // Fetch updated price if needed
      quantity: item.quantity, // Keep the same quantity
    };
  }));
  // Filter out any undefined results (products that were deleted)
  saveCart(updatedCart.filter((item): item is CartItem => item !== undefined));
}
