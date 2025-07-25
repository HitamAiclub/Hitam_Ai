import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowRight, Users, Calendar, Trophy, Brain, Zap, Target } from 'lucide-react';

const HomePage = () => {
  const [stats, setStats] = useState({
    events: 0,
    members: 0,
    workshops: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch events count
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch club members count
      const membersSnapshot = await getDocs(collection(db, 'clubJoins'));
      
      // Fetch committee members
      const committeeSnapshot = await getDocs(collection(db, 'committeeMembers'));
      const committee = committeeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Get recent events (last 3)
      const recentEventsQuery = query(
        collection(db, 'events'),
        orderBy('meta.startDate', 'desc'),
        limit(3)
      );
      const recentEventsSnapshot = await getDocs(recentEventsQuery);
      const recent = recentEventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setStats({
        events: events.length,
        members: membersSnapshot.size,
        workshops: events.filter(e => e.meta?.type === 'workshop').length
      });
      setRecentEvents(recent);
      setCommitteeMembers(committee.slice(0, 6)); // Show first 6 members
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Research",
      description: "Cutting-edge research in machine learning, deep learning, and artificial intelligence"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Hands-on Workshops",
      description: "Practical workshops on AI tools, frameworks, and real-world applications"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Industry Projects",
      description: "Collaborate on industry-sponsored projects and build your portfolio"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "Join a vibrant community of AI enthusiasts, researchers, and innovators"
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
              Hitam AI Club
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Empowering the next generation of AI innovators and researchers at HITAM University
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/join">
              <Button size="lg" className="group">
                Join Our Community
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="secondary" size="lg">
                Explore Events
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 mt-16"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{stats.events}+</div>
              <div className="text-gray-600 dark:text-gray-300">Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{stats.members}+</div>
              <div className="text-gray-600 dark:text-gray-300">Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">{stats.workshops}+</div>
              <div className="text-gray-600 dark:text-gray-300">Workshops</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Join Hitam AI?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover the opportunities that await you in our AI community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} delay={index * 0.1}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Events Section */}
      {recentEvents.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Events
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Check out our latest events and workshops
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentEvents.map((event, index) => (
                <Card key={event.id} delay={index * 0.1}>
                  <div className="space-y-4">
                    <img
                      src={event.meta?.imageUrl || 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={event.meta?.title}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        event.meta?.type === 'workshop' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {event.meta?.type === 'workshop' ? 'Workshop' : 'Event'}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-2 mb-2">
                        {event.meta?.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                        {event.meta?.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {event.meta?.startDate && new Date(event.meta.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/events">
                <Button variant="outline">
                  View All Events
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Committee Section */}
      {committeeMembers.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                The dedicated individuals leading our AI community
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {committeeMembers.map((member, index) => (
                <Card key={member.id} delay={index * 0.1}>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      {member.photoUrl ? (
                        <img 
                          src={member.photoUrl} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-2xl font-bold">
                          {member.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {member.branch}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Shape the Future of AI?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join our community of innovators and be part of the AI revolution at HITAM University
            </p>
            <Link to="/join">
              <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Join Hitam AI Club
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;