import { Link } from 'react-router-dom';
import { FiMail, FiMapPin, FiPhone, FiGithub, FiLinkedin, FiInstagram } from 'react-icons/fi';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">HITAM AI</h3>
            <p className="text-neutral-300 mb-4">
              The AI Club at HITAM is dedicated to promoting knowledge and skills in artificial intelligence through workshops, events, and hands-on projects.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" className="text-neutral-300 hover:text-primary-400 transition-colors" aria-label="GitHub">
                <FiGithub size={20} />
              </a>
              <a href="https://linkedin.com" className="text-neutral-300 hover:text-primary-400 transition-colors" aria-label="LinkedIn">
                <FiLinkedin size={20} />
              </a>
              <a href="https://instagram.com" className="text-neutral-300 hover:text-primary-400 transition-colors" aria-label="Instagram">
                <FiInstagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-neutral-300 hover:text-primary-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/events" className="text-neutral-300 hover:text-primary-400 transition-colors">Events</Link>
              </li>
              <li>
                <Link to="/workshops" className="text-neutral-300 hover:text-primary-400 transition-colors">Workshops</Link>
              </li>
              <li>
                <Link to="/join" className="text-neutral-300 hover:text-primary-400 transition-colors">Join Club</Link>
              </li>
              <li>
                <Link to="/upcoming" className="text-neutral-300 hover:text-primary-400 transition-colors">Upcoming Activities</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FiMapPin className="mt-1 text-primary-400 flex-shrink-0" />
                <span className="text-neutral-300">HITAM Campus, Hyderabad, Telangana, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-primary-400 flex-shrink-0" />
                <span className="text-neutral-300">+91 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-primary-400 flex-shrink-0" />
                <a href="mailto:aiclub@hitam.org" className="text-neutral-300 hover:text-primary-400 transition-colors">aiclub@hitam.org</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 mt-8 pt-6 text-center text-neutral-400">
          <p>© {currentYear} HITAM AI Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;