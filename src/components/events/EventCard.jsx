import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';

function EventCard({ 
  event, 
  onEdit, 
  onDelete 
}) {
  const { isAdmin } = useAuth();
  
  return (
    <motion.div 
      className="card overflow-hidden flex flex-col h-full"
      whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-48 mb-4">
        <img 
          src={event.imageUrl || 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg'} 
          alt={event.title} 
          className="w-full h-full object-cover rounded-t-xl"
        />
        
        {event.type && (
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              event.type === 'event' 
                ? 'bg-primary-500 text-white' 
                : 'bg-secondary-500 text-white'
            }`}>
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-grow p-2">
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        
        <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-3">
          {event.description}
        </p>
        
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center text-neutral-500 dark:text-neutral-400">
            <FiUser className="mr-2" />
            <span>{event.presenter || 'TBA'}</span>
          </div>
          
          <div className="flex items-center text-neutral-500 dark:text-neutral-400">
            <FiCalendar className="mr-2" />
            <span>
              {event.type === 'workshop' && event.endDate
                ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
                : formatDate(event.date)
              }
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 pt-0 flex items-center justify-between">
        <Link 
          to={`/${event.type}/${event.id}`} 
          className="btn-outline text-sm px-3 py-1"
        >
          View Details
        </Link>
        
        {isAdmin && (
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(event)} 
              className="p-2 text-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 rounded-full"
              aria-label="Edit"
            >
              <FiEdit />
            </button>
            
            <button 
              onClick={() => onDelete(event.id)} 
              className="p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-full"
              aria-label="Delete"
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default EventCard;