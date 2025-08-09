import { motion } from "framer-motion";
import { BarChart3, Users, Calendar, TrendingUp } from "lucide-react";
import { useEvents, useClubMembers, useCommunityMembers } from "../../hooks/useFirebaseData";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminHome = () => {
  const { data: eventsData, loading: eventsLoading } = useEvents();
  const { data: clubMembersData, loading: clubLoading } = useClubMembers();
  const { data: communityData, loading: communityLoading } = useCommunityMembers();

  // Calculate stats from Firebase data
  const eventsCount = eventsData ? Object.keys(eventsData).length : 0;
  const clubMembersCount = clubMembersData ? Object.keys(clubMembersData).length : 0;
  const communityMembersCount = communityData ? Object.keys(communityData).length : 0;

  const stats = [
    {
      icon: Users,
      label: "Club Members",
      value: clubMembersCount.toString(),
      change: "+12 this month",
      color: "from-blue-500 to-purple-500",
      loading: clubLoading
    },
    {
      icon: Calendar,
      label: "Total Events",
      value: eventsCount.toString(),
      change: "+3 this month",
      color: "from-purple-500 to-pink-500",
      loading: eventsLoading
    },
    {
      icon: Users,
      label: "Community Members",
      value: communityMembersCount.toString(),
      change: "+5 this month",
      color: "from-green-500 to-teal-500",
      loading: communityLoading
    },
    {
      icon: TrendingUp,
      label: "Engagement Rate",
      value: "87%",
      change: "+5% this month",
      color: "from-orange-500 to-red-500",
      loading: false
    }
  ];

  // Generate recent activity from Firebase data
  const getRecentActivity = () => {
    const activities = [];
    
    if (clubMembersData) {
      const recentMembers = Object.entries(clubMembersData)
        .slice(-3)
        .map(([id, member]) => ({
          action: "New member joined",
          user: member.name,
          time: "2 hours ago"
        }));
      activities.push(...recentMembers);
    }

    if (eventsData) {
      const recentEvents = Object.entries(eventsData)
        .slice(-2)
        .map(([id, event]) => ({
          action: "Event created",
          event: event.meta?.title,
          time: "1 day ago"
        }));
      activities.push(...recentEvents);
    }

    // Add some default activities if no data
    if (activities.length === 0) {
      activities.push(
        { action: "System initialized", title: "Admin dashboard ready", time: "Just now" }
      );
    }

    return activities.slice(0, 4);
  };

  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back! Here"s what"s happening with Hitam AI Club.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              {stat.loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                    {stat.label}
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-xs font-medium">
                    {stat.change}
                  </p>
                </>
              )}
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {activity.user || activity.event || activity.project || activity.title}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { title: "Create Event", description: "Add a new event to the calendar", color: "from-blue-500 to-purple-500" },
            { title: "Manage Members", description: "View and manage community members", color: "from-purple-500 to-pink-500" },
            { title: "Export Data", description: "Download reports and analytics", color: "from-green-500 to-teal-500" }
          ].map((action, index) => (
            <motion.div
              key={action.title}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br ${action.color} rounded-2xl p-6 text-white cursor-pointer`}
            >
              <h3 className="text-xl font-bold mb-2">{action.title}</h3>
              <p className="text-white/80">{action.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminHome;