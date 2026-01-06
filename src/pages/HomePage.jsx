import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Calendar, Users, Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { organizeMembersByRole, groupCoreTeamByLevel, CORE_TEAM_ROLES, shouldUseLevelWiseDisplay } from "../utils/committeeRoles";

const HomePage = () => {
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      try {
        // Fetch committee members
        const committeeSnapshot = await getDocs(collection(db, "committeeMembers"));
        const members = committeeSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommitteeMembers(members);
      } catch (error) {
        console.warn("Could not fetch committee members:", error.message);
        setCommitteeMembers([]);
      }

      try {
        // Fetch featured event (latest event)
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const events = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (events.length > 0) {
          const sortedEvents = events.sort((a, b) => 
            new Date(b.meta?.startDate || 0) - new Date(a.meta?.startDate || 0)
          );
          setFeaturedEvent(sortedEvents[0]);
        }
      } catch (error) {
        console.warn("Could not fetch events:", error.message);
        setFeaturedEvent(null);
      }
    } catch (error) {
      console.warn("General data fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-teal-900/10 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-teal-900/20"></div>
        <div className="text-center space-y-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="flex flex-col items-center">
              <img src="/logo.jpg" alt="Hitam AI Logo" className="w-56 h-56 md:w-64 md:h-64 object-cover object-center mb-8 rounded-lg shadow-2xl" />
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-6">
                HITAM AI
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Empowering the next generation of AI innovators at HITAM
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
          >
            {/* Solid blue button with arrow */}
            <Button
              size="lg"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold shadow-lg flex items-center px-8 py-4 rounded-xl transition"
              onClick={() => navigate("/events")}
            >
              Explore Events
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>

            {/* Outlined purple button with users icon */}
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-purple-600 text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900 font-semibold flex items-center px-8 py-4 rounded-xl transition"
              onClick={() => navigate("/community")}
            >
              <Users className="mr-3 w-5 h-5" />
              Join Our Community
            </Button>

            {/* Soft glassmorphism button with calendar icon */}
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-400 text-white font-semibold shadow-md flex items-center px-8 py-4 rounded-xl transition hover:from-purple-600 hover:to-blue-500 hover:shadow-lg"
              onClick={() => navigate("/upcoming")}
            >
              <Calendar className="mr-3 w-6 h-6" />
              View Upcoming Activities
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About HITAM Section */}
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
              About HITAM
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              Hyderabad Institute of Technology and Management (HITAM) is a premier educational institution 
              committed to excellence in engineering education and research. Founded with the vision of 
              nurturing skilled professionals who can contribute to technological advancement and societal development.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "Expert Faculty",
                description: "Learn from industry experts and experienced academicians"
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Excellence in Education",
                description: "Recognized for academic excellence and innovative teaching methods"
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Industry Connections",
                description: "Strong partnerships with leading technology companies"
              }
            ].map((item, index) => (
              <Card key={index} delay={index * 0.2}>
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About HITAM AI Club Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              About HITAM AI Club
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              The HITAM AI Club is a vibrant community of students passionate about Artificial Intelligence, 
              Machine Learning, and cutting-edge technology. We organize workshops, hackathons, and seminars 
              to help students stay at the forefront of AI innovation.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                To create a collaborative environment where students can explore, learn, and innovate 
                in the field of Artificial Intelligence, fostering the next generation of AI leaders.
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Our Motive
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We believe in democratizing AI education and making it accessible to all students, 
                regardless of their background. Through hands-on workshops, real-world projects, 
                and industry partnerships, we prepare students for the AI-driven future.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {[
                "Regular AI/ML workshops and seminars",
                "Hands-on project development",
                "Industry expert guest lectures",
                "Hackathons and competitions",
                "Research collaboration opportunities",
                "Career guidance and placement support"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Committee Members Section */}
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
              Our Committee
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Meet the dedicated team behind HITAM AI Club
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {(() => {
                const { coreTeam, committeeMembers: nonCoreMembers } = organizeMembersByRole(committeeMembers);
                const coreTeamByLevel = groupCoreTeamByLevel(coreTeam);
                const useLevelWise = shouldUseLevelWiseDisplay(coreTeam);

                return (
                  <>
                    {/* Core Team Section */}
                    {coreTeam.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8">
                          Core Team
                        </h3>

                        {/* Level-wise hierarchical, center aligned (Rule B) */}
                        {useLevelWise ? (
                          <div className="space-y-8">
                            {CORE_TEAM_ROLES.map((role) => {
                              const members = coreTeamByLevel[role] || [];
                              return members.length > 0 ? (
                                <div key={role}>
                                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                                    {role}
                                  </h4>
                                  <div className="flex flex-wrap justify-center gap-8">
                                    {members.map((member, index) => (
                                      <div key={member.id} className="w-64">
                                        <Card delay={index * 0.05}>
                                          <div className="p-6 text-center">
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
                                            <p className="text-blue-600 dark:text-blue-400 font-medium">
                                              {member.role}
                                            </p>
                                          </div>
                                        </Card>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          /* Left-to-right display (Rule A) */
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {CORE_TEAM_ROLES.map((role) => {
                              const members = coreTeamByLevel[role] || [];
                              return (
                                <div key={role}>
                                  <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 ml-2">
                                    {role}
                                  </h4>
                                  <div className="space-y-6">
                                    {members.map((member, index) => (
                                      <Card key={member.id} delay={index * 0.05}>
                                        <div className="p-6 text-center">
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
                                          <p className="text-blue-600 dark:text-blue-400 font-medium">
                                            {member.role}
                                          </p>
                                        </div>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Committee Members Section (always full-width below Core Team) */}
                    {nonCoreMembers.length > 0 && (
                      <div className="w-full mt-12 clear-both">
                        <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-8">
                          Committee Members
                        </h3>
                        <div className="w-full">
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {nonCoreMembers.map((member, index) => (
                              <Card key={member.id} delay={index * 0.1}>
                                <div className="p-6 text-center">
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
                                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                                    {member.role}
                                  </p>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {coreTeam.length === 0 && nonCoreMembers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                          No committee members found yet.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default HomePage;