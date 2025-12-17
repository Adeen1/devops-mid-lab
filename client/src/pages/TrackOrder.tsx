import { useState } from 'react';
import api from '../api';

const TrackOrder = () => {
    const [id, setId] = useState('');
    const [order, setOrder] = useState<any>(null);

    const track = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data);
        } catch {
            alert('Order not found');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <h1 className="text-3xl font-bold mb-6 text-center">Track Your Order</h1>
            <form onSubmit={track} className="flex gap-2 mb-8">
                <input 
                    type="text" 
                    value={id} 
                    onChange={e => setId(e.target.value)}
                    placeholder="Enter Order ID" 
                    className="flex-1 bg-neutral-800 border-none rounded-lg p-3 text-white focus:ring-2 ring-primary outline-none"
                />
                <button className="bg-primary text-black font-bold px-6 rounded-lg">Track</button>
            </form>

            {order && (
                <div className="bg-neutral-800 p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between mb-4">
                        <span className="text-gray-400">Order #{order.id}</span>
                        <span className={`font-bold ${
                            order.status === 'Pending' ? 'text-yellow-500' :
                            order.status === 'Cooking' ? 'text-orange-500' :
                            order.status === 'Delivered' ? 'text-green-500' : 'text-blue-500'
                        }`}>{order.status}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                        {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span>${item.price}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/10 pt-4 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${order.total_amount}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;
