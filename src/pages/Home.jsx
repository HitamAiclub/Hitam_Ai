import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Users, Calendar, Award } from "lucide-react";
import { useCommunityMembers } from "../hooks/useFirebaseData";
import LoadingSpinner from "../components/LoadingSpinner";
import NoDataFound from "../components/NoDataFound";

const Home = () => {
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const statsRef = useRef(null);
  const communityRef = useRef(null);

  const isHeroInView = useInView(heroRef, { once: true });
  const isAboutInView = useInView(aboutRef, { once: true });
  const isStatsInView = useInView(statsRef, { once: true });
  const isCommunityInView = useInView(communityRef, { once: true });

  const { data: communityData, loading: communityLoading } = useCommunityMembers();

  // Convert Firebase object to array
  const communityMembers = communityData ? Object.entries(communityData).map(([id, member]) => ({
    id,
    ...member
  })) : [];

  const stats = [
    { icon: Users, label: "Active Members", value: "150+" },
    { icon: Calendar, label: "Events Hosted", value: "25+" },
    { icon: Award, label: "Projects Completed", value: "40+" },
    { icon: Brain, label: "AI Workshops", value: "15+" },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-6"
            >
              <div className="flex flex-col items-center">
                <img src="/logo.jpg" alt="Hitam AI Logo" className="w-48 h-48 md:w-56 md:h-56 object-cover object-center mb-6 rounded-lg shadow-2xl" />
                <span>HITAM</span>
              </div>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Hyderabad Institute of Technology and Management
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex justify-center"
            >
              <img
                src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="HITAM Campus"
                className="rounded-2xl shadow-2xl max-w-full h-auto w-full max-w-4xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About AI Club Section */}
      <section ref={aboutRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isAboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Hitam AI Club
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Welcome to the premier artificial intelligence community at HITAM. We"re a passionate group of students, researchers, and innovators dedicated to exploring the fascinating world of AI and machine learning.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Our club focuses on hands-on learning, collaborative projects, and staying at the forefront of AI technology. Whether you"re a beginner or an expert, you"ll find a supportive environment to grow your skills.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <a
                  href="/join"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                >
                  Join Our Community
                </a>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isAboutInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="AI Club Activities"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Our Impact
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Building a strong AI community with measurable results and meaningful connections.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Members Preview */}
      <section ref={communityRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isCommunityInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Meet Our Community
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Talented individuals from various branches working together to push the boundaries of AI.
            </p>
          </motion.div>

          {communityLoading ? (
            <LoadingSpinner message="Loading community members..." />
          ) : communityMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {communityMembers.slice(0, 8).map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isCommunityInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {member.name?.charAt(0) || "M"}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {member.name || "Community Member"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {member.branch || "Computer Science"}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <NoDataFound 
              title="No Community Members"
              message="Community members will be displayed here once they are added to the database."
              icon={Users}
            />
          )}

          {communityMembers.length > 8 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={isCommunityInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center mt-8"
            >
              <p className="text-gray-600 dark:text-gray-300">
                And {communityMembers.length - 8} more amazing members...
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;