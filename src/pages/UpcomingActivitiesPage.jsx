import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { FiCalendar, FiUser, FiMapPin, FiPlus, FiExternalLink } from 'react-icons/fi';
import PageHeader from '../components/ui/PageHeader';
import AnimatedSection from '../components/ui/AnimatedSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate, isFutureDate } from '../utils/dateUtils';

function UpcomingActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    fetchActivities();
  }, []);
  
  async function fetchActivities() {
    try {
      setLoading(true);
      
      // Get current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Create query for upcoming activities
      const activitiesQuery = query(
        collection(db, 'events'),
        where('date', '>=', today),
        orderBy('date')
      );
      
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activitiesData = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }
  
  const handleAddActivity = () => {
    // Placeholder for add activity functionality
    console.log('Add activity');
  };
  
  return (
    <div>
      <PageHeader 
        title="Upcoming Activities" 
        subtitle="Stay informed about our upcoming events and workshops"
      />
      
      <div className="container py-12">
        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex justify-end mb-8">
            <motion.button
              onClick={handleAddActivity}
              className="btn-primary flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus className="mr-2" />
              Add Activity
            </motion.button>
          </div>
        )}
        
        {/* Activities List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-8">
            {activities.map((activity, index) => (
              <AnimatedSection
                key={activity.id}
                animation="fade-up"
                delay={index * 0.1}
                className="card overflow-hidden"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 bg-neutral-100 dark:bg-neutral-800">
                    <img 
                      src={activity.imageUrl || 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg'} 
                      alt={activity.title} 
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6 md:w-2/3">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.type === 'event' 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-secondary-500 text-white'
                      }`}>
                        {activity.type === 'event' ? 'Event' : 'Workshop'}
                      </span>
                      
                      <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-sm">
                        <FiCalendar className="mr-1" />
                        <span>
                          {activity.type === 'workshop' && activity.endDate
                            ? `${formatDate(activity.date)} - ${formatDate(activity.endDate)}`
                            : formatDate(activity.date)
                          }
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold mb-3">{activity.title}</h3>
                    
                    <p className="text-neutral-600 dark:text-neutral-300 mb-6 line-clamp-2 md:line-clamp-3">
                      {activity.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-6 mb-6">
                      {activity.presenter && (
                        <div className="flex items-center text-neutral-500 dark:text-neutral-400">
                          <FiUser className="mr-2" />
                          <span>{activity.presenter}</span>
                        </div>
                      )}
                      
                      {activity.location && (
                        <div className="flex items-center text-neutral-500 dark:text-neutral-400">
                          <FiMapPin className="mr-2" />
                          <span>{activity.location}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <a
                        href={`/events/${activity.id}`}
                        className="btn-outline flex items-center"
                      >
                        View Details
                      </a>
                      
                      {activity.registrationLink && (
                        <a
                          href={activity.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary flex items-center"
                        >
                          Register Now
                          <FiExternalLink className="ml-2" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              No upcoming activities scheduled at the moment.
            </p>
            {isAdmin && (
              <button
                onClick={handleAddActivity}
                className="btn-outline"
              >
                Add Your First Activity
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingActivitiesPage;