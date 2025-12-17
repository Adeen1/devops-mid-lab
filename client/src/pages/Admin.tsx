import { useEffect, useState } from 'react';
import api from '../api';
import { Lock } from 'lucide-react';

const Admin = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
            const interval = setInterval(fetchOrders, 5000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
                <button onClick={() => setIsAuthenticated(false)} className="text-sm text-gray-400 hover:text-white">Logout</button>
            </div>

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
        </div>
    );
};

export default Admin;
