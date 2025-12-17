import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import React from 'react';

interface CartItem {
    item: {
        _id: string;
        name: string;
        price: number;
        imageUrl: string;
    };
    qty: number;
}

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    updateQty: (id: string, delta: number) => void;
    checkout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, updateQty, checkout }) => {
    const total = cart.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-neutral-900 border-l border-white/10 shadow-2xl z-50 flex flex-col"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <ShoppingBag /> Your Order
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-500 mt-20">
                                    <p>Your cart is empty.</p>
                                </div>
                            ) : (
                                cart.map((c) => (
                                    <div key={c.item._id} className="flex gap-4 bg-white/5 p-4 rounded-xl">
                                        <img src={c.item.imageUrl} className="w-20 h-20 object-cover rounded-lg" alt={c.item.name} />
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold">{c.item.name}</h4>
                                                <span className="text-primary">${c.item.price}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateQty(c.item._id, -1)} className="p-1 bg-white/10 rounded hover:bg-white/20"><Minus size={14} /></button>
                                                <span className="font-bold w-4 text-center">{c.qty}</span>
                                                <button onClick={() => updateQty(c.item._id, 1)} className="p-1 bg-white/10 rounded hover:bg-white/20"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10 bg-neutral-800">
                            <div className="flex justify-between items-center mb-6 text-xl font-bold">
                                <span>Total</span>
                                <span className="text-primary">${total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={checkout}
                                disabled={cart.length === 0}
                                className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Checkout Now
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
