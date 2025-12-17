import { useEffect, useState } from 'react';
import api from '../api';
import { Lock, Plus, Edit2, Trash2, LayoutList, Utensils } from 'lucide-react';
import Modal from '../components/Modal';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
}

const Admin = () => {
    const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Orders State
    const [orders, setOrders] = useState<any[]>([]);

    // Menu State
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        imageUrl: ''
    });

    const fetchOrders = () => {
        api.get('/orders')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setOrders(res.data.sort((a: any, b: any) => b.id - a.id));
                } else {
                    setOrders([]);
                }
            })
            .catch(() => setOrders([]));
    };

    const fetchMenu = () => {
        api.get('/menu')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setMenuItems(res.data);
                }
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
            fetchMenu();
            const interval = setInterval(() => {
                if (activeTab === 'orders') fetchOrders();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, activeTab]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid Password');
        }
    };

    const updateStatus = async (id: number, status: string) => {
        await api.put(`/orders/${id}`, { status });
        fetchOrders();
    };

    // Menu Handlers
    const handleSaveMenu = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: Number(formData.price)
        };

        try {
            if (editingItem) {
                await api.put(`/menu/${editingItem._id}`, payload);
            } else {
                await api.post('/menu', payload);
            }
            setIsMenuModalOpen(false);
            resetForm();
            fetchMenu();
        } catch (error) {
            console.error("Failed to save menu item", error);
            alert("Failed to save item");
        }
    };

    const handleDeleteMenu = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await api.delete(`/menu/${id}`);
                fetchMenu();
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const openEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            category: item.category,
            imageUrl: item.imageUrl || ''
        });
        setIsMenuModalOpen(true);
    };

    const openAddModal = () => {
        resetForm();
        setIsMenuModalOpen(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            imageUrl: ''
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-neutral-800 p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="bg-primary/20 p-4 rounded-full text-primary">
                            <Lock size={40} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/20 rounded-lg p-3 text-center tracking-widest text-xl focus:border-primary focus:outline-none transition"
                                placeholder="Enter Password"
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                        <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition">
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const statuses = ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                <div className="flex bg-neutral-800 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'orders' ? 'bg-primary text-black font-bold' : 'hover:bg-white/5'}`}
                    >
                        <LayoutList size={18} /> Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === 'menu' ? 'bg-primary text-black font-bold' : 'hover:bg-white/5'}`}
                    >
                        <Utensils size={18} /> Menu
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {activeTab === 'menu' && (
                        <button onClick={openAddModal} className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition">
                            <Plus size={18} /> Add Item
                        </button>
                    )}
                    <button onClick={() => setIsAuthenticated(false)} className="text-sm text-gray-400 hover:text-white">Logout</button>
                </div>
            </div>

            {activeTab === 'orders' ? (
                /* Orders View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-neutral-800 p-6 rounded-xl border border-white/5 shadow-lg relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${order.status === 'Delivered' ? 'bg-green-500' :
                                    order.status === 'Cancelled' ? 'bg-red-500' :
                                        order.status === 'Ready' ? 'bg-blue-500' :
                                            'bg-yellow-500'
                                }`} />

                            <div className="flex justify-between items-start mb-4 pl-3">
                                <div>
                                    <h3 className="font-bold text-lg">{order.customer_name}</h3>
                                    <span className="text-xs text-gray-500">Order #{order.id}</span>
                                </div>
                                <span className="bg-white/10 px-2 py-1 rounded text-xs font-mono">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className="my-4 space-y-2 pl-3 border-t border-white/10 pt-4 max-h-40 overflow-y-auto">
                                {order.items.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-300">{item.qty}x {item.name}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pl-3 mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Update Status</p>
                                <div className="flex flex-wrap gap-2">
                                    {statuses.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => updateStatus(order.id, s)}
                                            disabled={order.status === s}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition ${order.status === s
                                                    ? 'bg-white text-black'
                                                    : 'bg-neutral-700 text-gray-400 hover:bg-neutral-600 hover:text-white'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Menu View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {menuItems.map(item => (
                        <div key={item._id} className="bg-neutral-800 rounded-xl border border-white/5 overflow-hidden flex flex-col">
                            <div className="h-40 overflow-hidden relative group">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                    <button onClick={() => openEditModal(item)} className="p-2 bg-white text-black rounded-full hover:scale-110 transition"><Edit2 size={18} /></button>
                                    <button onClick={() => handleDeleteMenu(item._id)} className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{item.name}</h3>
                                    <span className="text-primary font-bold">${item.price}</span>
                                </div>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{item.category}</p>
                                <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Menu Modal */}
            <Modal
                isOpen={isMenuModalOpen}
                onClose={() => setIsMenuModalOpen(false)}
                title={editingItem ? 'Edit Item' : 'Add New Item'}
            >
                <form onSubmit={handleSaveMenu} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 focus:border-primary focus:outline-none"
                            placeholder="e.g. Burger"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Category</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 focus:border-primary focus:outline-none"
                            placeholder="e.g. Burger"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Price</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            required
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 focus:border-primary focus:outline-none"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 focus:border-primary focus:outline-none resize-none h-24"
                            placeholder="Description..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 focus:border-primary focus:outline-none"
                            placeholder="https://..."
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition">
                        {editingItem ? 'Save Changes' : 'Create Item'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Admin;
