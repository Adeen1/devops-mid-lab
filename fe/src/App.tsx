// App.jsx
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Navigation from "./pages/Navigation";
import Order from "./pages/Order";
import TrackOrder from "./pages/TrackOrder";

import AdminMenu from "./pages/AdminMenu";
import AdminOrders from "./pages/AdminOrders";
import CheckOut from "./pages/CheckOut";
import Success from "./pages/Success";
function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/order" element={<Order />} />
        <Route path="/checkout" element={<CheckOut />} />
        <Route path="/success" element={<Success />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trackOrder" element={<TrackOrder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/menu" element={<AdminMenu />} />
      </Routes>
    </Router>
  );
}

export default App;
