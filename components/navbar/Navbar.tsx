import { useEffect, useState, ReactNode } from "react";
import { getUserDetails, isAuthenticated, isEmployee, isViewAsCustomer, logout, setViewAsCustomer } from "@/common/utils/Auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaTrashCan } from "react-icons/fa6";
import { ImCart } from "react-icons/im";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserInfo } from "@/common/interfaces/UserInfo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CartItem, editCartItem, loadCart, refreshCartNameAndPrice } from "@/common/utils/CartManager";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";


type Props = {
  children? : ReactNode;
  refreshKey: number;
};

export default function Navbar({children, refreshKey} : Props) {
  const [cart, setCart] = useState<CartItem[]>(loadCart());
  const [userDetails, setUserDetails] = useState<UserInfo>();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      let resp = await getUserDetails();
      if (!resp) {
        console.error("Failed to fetch user details");
        return;
      }
      if (!resp.ok) {
        console.error(`HTTP ${resp.status}`);
        return;
      }
      const data: UserInfo = await resp.json();
      setUserDetails(data);
    };
    fetchUserDetails();
  }, [])

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const refreshCart = () => {
    const updatedCart = loadCart();
    setCart(updatedCart);
  }

  useEffect(() => {
    if (refreshKey > 0) {
      refreshCart();
    }
  }, [refreshKey]);


  return <div className="flex justify-between items-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Link href="/" className="flex items-center gap-2">
            <Image height={50} width={50} src="/logo.png" alt={""}/>
          </Link>
          {children}
        </div>
        
        
        <div className="flex flex-row items-center gap-4">
          {isAuthenticated() && <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none relative">
              <motion.div
                key={refreshKey} // changing this triggers animation
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.3 }}
              >
                <ImCart size={30} />
                {cart.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] flex items-center justify-center"
                  style={{ fontSize: '0.75rem', lineHeight: 1 }}
                  aria-label={`${cart.length} items in cart`}
                >
                  {cart.length > 9 ? "9+" : cart.length}
                </span>
                )}
              </motion.div>
              
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96">
              <DropdownMenuLabel>Shopping Cart</DropdownMenuLabel>
              <DropdownMenuSeparator />
                {cart.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 gap-4 hover:bg-muted">
                    <a href={`/products/${item.productId}`} target="_blank">{item.name} (${item.listPrice.toFixed(2)})</a>
                    <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex gap-1 items-center">Qty: <Input 
                      type="number" 
                      value={item.quantity} 
                      min={1} 
                      className="w-16"
                      onChange={(e) => {
                      const newQuantity = Number(e.target.value);
                      if (newQuantity > 0) {
                        editCartItem(item.productId, newQuantity);
                      }
                      refreshCart();
                      }}
                    /></span>
                    <p className="text-red-600 cursor-pointer"
                      onClick={() => {
                      editCartItem(item.productId, 0); // Remove item
                      refreshCart();
                      }}
                      >
                      <FaTrashCan />
                    </p>
                    </div>
                  </div>
                  ))}
                </div>
                ) : (
                <DropdownMenuItem disabled>
                  Cart is empty
                </DropdownMenuItem>
              )}
              {cart.length > 0 && <DropdownMenuSeparator />}
                { cart.length > 0 && (
                  <div className="flex justify-between items-center p-1">
                    <div className="p-2 text-left text-sm">
                      Total cost: ${cart.reduce((sum, item) => sum + item.listPrice * item.quantity, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {/* refresh cart button */}
                    <Button 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={async () => {
                        await refreshCartNameAndPrice();
                        refreshCart();
                      }}
                    >
                      Refresh Cart
                    </Button>
                  </div>
                )}
            </DropdownMenuContent>
          </DropdownMenu>}

          {isAuthenticated() && <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar className="w-9 h-9">
                <AvatarImage src="/default_avatar.jpg" />
                <AvatarFallback>
                  {userDetails?.firstName?.[0]}
                  {userDetails?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{userDetails?.firstName} {userDetails?.lastName}</p>
                <p className="text-xs text-muted-foreground">{userDetails?.emailAddress}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {userDetails?.personType === "EM" ? "Employee" : "Customer"}
                  {isEmployee(true) && isViewAsCustomer() ? " (Viewing as Customer)" : ""}
                </p>
              </div>
              <DropdownMenuSeparator />
              {isEmployee(true) && (
                <DropdownMenuItem>
                  {/* View as customer toggle */}
                  {isViewAsCustomer() ? (
                    <p onClick={() => {setViewAsCustomer(false)
                      window.location.reload();
                    }}>
                      View as Employee
                    </p>
                  ) : (
                    <p onClick={() => {setViewAsCustomer(true)
                      window.location.reload();
                    }}>
                      View as Customer
                    </p>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={(e) => {
                e.preventDefault(); // prevent closing until dialog handles it
                setShowLogoutDialog(true);
              }}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>}

          {!isAuthenticated() && <Button variant="default" className="cursor-pointer" onClick={() => {
            window.location.href = '/login'
          }}>Login</Button>}
          
        </div>
        

        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">Are you sure you want to log out?</p>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
}