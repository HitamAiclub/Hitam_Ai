import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiClock, FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AnimatedSection from '../components/ui/AnimatedSection';
import { formatDate } from '../utils/dateUtils';

function EventDetailPage() {
  const { id, type } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    async function fetchEvent() {
      try {
        const eventRef = doc(db, 'events', id);
        const eventDoc = await getDoc(eventRef);
        
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          // Event not found, redirect to events page
          navigate('/events', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvent();
  }, [id, navigate]);
  
  const handleEdit = () => {
    // Placeholder for edit functionality
    navigate(`/events/edit/${id}`);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // Placeholder for delete functionality
        navigate('/events');
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div>
      {event ? (
        <>
          {/* Hero Image */}
          <div className="relative h-[40vh] md:h-[50vh] bg-neutral-800">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            
            <img 
              src={event.imageUrl || 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg'} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 flex items-end">
              <div className="container pb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-wrap items-center mb-4 gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.type === 'event' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-secondary-500 text-white'
                    }`}>
                      {event.type === 'event' ? 'Event' : 'Workshop'}
                    </span>
                    
                    <div className="flex items-center text-white">
                      <FiCalendar className="mr-2" />
                      <span>
                        {event.type === 'workshop' && event.endDate
                          ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
                          : formatDate(event.date)
                        }
                      </span>
                    </div>
                    
                    {event.presenter && (
                      <div className="flex items-center text-white">
                        <FiUser className="mr-2" />
                        <span>{event.presenter}</span>
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    {event.title}
                  </h1>
                </motion.div>
              </div>
            </div>
          </div>
          
          <div className="container py-12">
            {/* Back button and actions */}
            <div className="flex flex-wrap justify-between items-center mb-8">
              <Link to="/events" className="flex items-center text-primary-500 hover:text-primary-600">
                <FiArrowLeft className="mr-2" />
                <span>Back to Events</span>
              </Link>
              
              {isAdmin && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleEdit}
                    className="flex items-center btn-outline"
                  >
                    <FiEdit className="mr-2" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="flex items-center bg-error-50 dark:bg-error-900/30 text-error-500 px-4 py-2 rounded-lg font-medium hover:bg-error-100 dark:hover:bg-error-900/50"
                  >
                    <FiTrash2 className="mr-2" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Event content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <AnimatedSection animation="fade-up" className="lg:col-span-2">
                <div className="card p-8">
                  <h2 className="text-2xl font-bold mb-6">About This {event.type === 'event' ? 'Event' : 'Workshop'}</h2>
                  
                  <div className="prose max-w-none dark:prose-invert">
                    <p className="whitespace-pre-line">{event.description}</p>
                  </div>
                </div>
              </AnimatedSection>
              
              <AnimatedSection animation="fade-up" delay={0.2}>
                <div className="card p-6 sticky top-24">
                  <h3 className="text-xl font-semibold mb-4">Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Date</p>
                      <div className="flex items-center mt-1">
                        <FiCalendar className="mr-2 text-primary-500" />
                        <span>
                          {formatDate(event.date)}
                          {event.type === 'workshop' && event.endDate && (
                            <> - {formatDate(event.endDate)}</>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {event.presenter && (
                      <div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Presenter</p>
                        <div className="flex items-center mt-1">
                          <FiUser className="mr-2 text-primary-500" />
                          <span>{event.presenter}</span>
                        </div>
                      </div>
                    )}
                    
                    {event.duration && (
                      <div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Duration</p>
                        <div className="flex items-center mt-1">
                          <FiClock className="mr-2 text-primary-500" />
                          <span>{event.duration}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Registration button - placeholder */}
                  <div className="mt-8">
                    {new Date(event.date) > new Date() ? (
                      <Link 
                        to="/upcoming" 
                        className="w-full btn-primary block text-center py-3"
                      >
                        Register Now
                      </Link>
                    ) : (
                      <div className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 py-3 text-center rounded-lg">
                        Registration Closed
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </>
      ) : (
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Event Not Found</h2>
          <p className="mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/events" className="btn-primary">
            View All Events
          </Link>
        </div>
      )}
    </div>
  );
}

export default EventDetailPage;