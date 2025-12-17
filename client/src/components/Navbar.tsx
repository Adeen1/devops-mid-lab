import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-primary tracking-tighter">
                    GOURMET<span className="text-white">HUB</span>
                </Link>
                <div className="flex gap-6 text-sm font-medium">
                    <Link to="/" className="hover:text-primary transition">MENU</Link>
                    <Link to="/track" className="hover:text-primary transition">TRACK ORDER</Link>
                </div>
                <div className="flex gap-4">
                    <Link to="/admin" className="text-gray-400 hover:text-white"><Shield size={20} /></Link>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
