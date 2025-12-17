import { useEffect, useState } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import CartDrawer from '../components/CartDrawer';
import Modal from '../components/Modal';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
}

const Home = () => {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<{ item: MenuItem, qty: number }[]>(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [orderPlacedId, setOrderPlacedId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        api.get('/menu')
            .then(res => {
                if (Array.isArray(res.data) && res.data.length === 0) {
                    api.post('/menu/seed').then(() => {
                        api.get('/menu').then(newRes => setMenu(newRes.data));
                    });
                } else if (Array.isArray(res.data)) {
                    setMenu(res.data);
                }
            })
            .catch(err => console.error("Failed to fetch menu:", err));
    }, []);

    const addToCart = (item: MenuItem, openCart = true) => {
        setCart(prev => {
            const existing = prev.find(p => p.item._id === item._id);
            if (existing) {
                return prev.map(p => p.item._id === item._id ? { ...p, qty: p.qty + 1 } : p);
            }
            return [...prev, { item, qty: 1 }];
        });
        if (openCart) setIsCartOpen(true);
    };

    const buyNow = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(p => p.item._id === item._id);
            if (!existing) {
                return [...prev, { item, qty: 1 }];
            }
            return prev;
        });
        setIsCheckoutModalOpen(true);
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.item._id === id) {
                return { ...item, qty: Math.max(0, item.qty + delta) };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const handleCheckout = async () => {
        if (!customerName || cart.length === 0) return;

        const total = cart.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);
        try {
            const res = await api.post('/orders', {
                customer_name: customerName,
                items: cart.map(c => ({ id: c.item._id, name: c.item.name, price: c.item.price, qty: c.qty })),
                total_amount: total
            });
            setOrderPlacedId(res.data.id);
            setIsCheckoutModalOpen(false);
            setCart([]);
            setCustomerName('');
        } catch (error) {
            console.error(error);
            alert("Failed to place order.");
        }
    };

    return (
        <div className="relative">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 text-center md:text-left">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Our Menu</h1>
                    <p className="text-gray-400 text-lg">Freshly prepared, premium ingredients.</p>
                </div>
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="bg-primary text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <ShoppingBag size={20} />
                    Cart ({cart.reduce((acc, curr) => acc + curr.qty, 0)})
                </button>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
                {menu.map((item, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={item._id}
                        className="bg-neutral-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition group flex flex-col w-full max-w-sm border border-white/5"
                    >
                        <div className="h-56 overflow-hidden relative">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {item.category}
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1 text-center items-center">
                            <h3 className="font-bold text-xl mb-2">{item.name}</h3>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{item.description}</p>
                            <div className="flex flex-col w-full gap-3 mt-auto">
                                <span className="text-2xl font-bold text-primary mb-2">${item.price}</span>
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="bg-white/10 hover:bg-white hover:text-black py-2 rounded-xl transition font-bold"
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => buyNow(item)}
                                        className="bg-primary text-black hover:bg-white py-2 rounded-xl transition font-bold"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Cart Drawer & Modals */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                updateQty={updateQty}
                checkout={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }}
            />

            <Modal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                title="Checkout"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Your Name</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                            placeholder="Enter your name..."
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={!customerName}
                        className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                        Confirm Order
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={!!orderPlacedId}
                onClose={() => setOrderPlacedId(null)}
                title="Order Placed!"
            >
                <div className="text-center py-4">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-gray-300 mb-6">Your order has been received. Track it using your Order ID:</p>
                    <div className="bg-white/10 p-4 rounded-xl text-2xl font-mono font-bold text-primary select-all">
                        {orderPlacedId}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Copy this ID to track your status.</p>
                </div>
            </Modal>
        </div>
    );
};

export default Home;
