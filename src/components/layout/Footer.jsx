import { Link } from "react-router-dom";
import { FiMail, FiMapPin, FiPhone, FiGithub, FiLinkedin, FiInstagram } from "react-icons/fi";

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white text-center py-4 w-full">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">HITAM AI</h3>
            <p className="text-neutral-300 mb-4">
              The AI Club at HITAM is dedicated to promoting knowledge and skills in artificial intelligence through workshops, events, and hands-on projects.
            </p>
            <div className="flex space-x-4">
              {/* Update these URLs to actual club profiles */}
             
              <a
                href="https://linkedin.com/company/hitam-aiclub"
                className="text-neutral-300 hover:text-primary-400 transition-colors"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiLinkedin size={20} />
              </a>
              <a
                href="https://instagram.com/hitam.aiclub"
                className="text-neutral-300 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiInstagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          
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
                <span className="text-neutral-300"></span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="text-primary-400 flex-shrink-0" />
                <a href="mailto:hitam.ai.club@gmail.com" className="text-neutral-300 hover:text-primary-400 transition-colors">hitam.ai.club@gmail.com</a>
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