import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AnimatedBackground from '../ui/AnimatedBackground';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer position="bottom-right" theme="colored" />
    </div>
  );
}

export default Layout;