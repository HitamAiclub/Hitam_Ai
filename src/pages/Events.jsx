import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Filter } from "lucide-react";
import { useEvents } from "../hooks/useFirebaseData";
import LoadingSpinner from "../components/LoadingSpinner";
import NoDataFound from "../components/NoDataFound";

const Events = () => {
  const [filter, setFilter] = useState("all");
  const { data: eventsData, loading, error } = useEvents();

  // Convert Firebase object to array
  const events = eventsData ? Object.entries(eventsData).map(([id, event]) => ({
    id,
    ...event.meta,
    type: event.meta?.type || "upcoming",
    registrationOpen: event.meta?.registrationOpen || false
  })) : [];

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true;
    return event.type === filter;
  });

  const getFilterColor = (type) => {
    switch (type) {
      case "completed": return "from-green-500 to-emerald-500";
      case "upcoming": return "from-blue-500 to-purple-500";
      case "registration": return "from-orange-500 to-red-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="lg" message="Loading events..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NoDataFound 
            title="Error Loading Events"
            message="There was an error loading the events. Please try again later."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Our Events
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover upcoming workshops, seminars, and networking events that will enhance your AI journey.
          </p>
        </motion.div>

        {events.length > 0 && (
          <>
            {/* Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {[
                { key: "all", label: "All Events", color: "from-gray-500 to-gray-600" },
                { key: "completed", label: "Completed", color: "from-green-500 to-emerald-500" },
                { key: "upcoming", label: "Upcoming", color: "from-blue-500 to-purple-500" },
                { key: "registration", label: "Registration Open", color: "from-orange-500 to-red-500" }
              ].map(({ key, label, color }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(key)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    filter === key
                      ? `bg-gradient-to-r ${color} text-white shadow-lg`
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  {label}
                </motion.button>
              ))}
            </motion.div>

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="relative">
                      <img
                        src={event.imageUrl || "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400"}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getFilterColor(event.type)}`}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4 mr-2" />
                          {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                        {event.participants && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <Users className="w-4 h-4 mr-2" />
                            {event.participants} participants
                          </div>
                        )}
                      </div>

                      {event.type === "completed" && event.conclusion && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {event.conclusion}
                        </p>
                      )}

                      {event.type !== "completed" && event.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          {event.description}
                        </p>
                      )}

                      {event.registrationOpen && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                        >
                          Register Now
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <NoDataFound 
                title="No Events Found"
                message={`No events found for the "${filter}" filter. Try selecting a different filter.`}
                icon={Filter}
              />
            )}
          </>
        )}

        {events.length === 0 && (
          <NoDataFound 
            title="No Events Available"
            message="There are no events available at the moment. Check back later for upcoming events and workshops."
            icon={Calendar}
          />
        )}
      </div>
    </div>
  );
};

export default Events;