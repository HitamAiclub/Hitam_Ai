import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { UserPlus, Mail, Phone, Book, Users, AlertCircle } from "lucide-react";
import ImageManager from "../components/ImageManager";

const JoinClub = () => {
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    branch: "",
    year: "",
    section: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submissionEnabled, setSubmissionEnabled] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const branches = [
     "Computer Science Engineering",
  "Computer Science Engineering (AI & ML)",
  "Computer Science Engineering (Data Science)",
  "Computer Science Engineering (Cyber Security)",
  "Computer Science Engineering (IoT)",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering"
  ];

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const sections = ["A", "B", "C", "D", "E", "F", "G", "H"];

  useEffect(() => {
    checkSubmissionStatus();
  }, []);

  const checkSubmissionStatus = async () => {
    try {
      const statusDoc = await getDoc(doc(db, "settings", "clubJoinStatus"));
      if (statusDoc.exists()) {
        setSubmissionEnabled(statusDoc.data().enabled || false);
      } else {
        // If document doesn"t exist, enable submissions by default
        setSubmissionEnabled(true);
      }
    } catch (error) {
      console.warn("Could not check submission status:", error.message);
      // Default to enabled if we can"t check
      setSubmissionEnabled(true);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Starting club join submission...", formData);
    setLoading(true);
    setError("");

    // Validate email domain
    if (!formData.email.endsWith("@hitam.org")) {
      setError("Please use your HITAM email address (@hitam.org)");
      setLoading(false);
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.rollNo || !formData.branch || !formData.year || !formData.section) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const joinData = {
        ...formData,
        joinedAt: new Date().toISOString(),
        status: "pending"
      };

      console.log("Saving join data:", joinData);
      const result = await addDoc(collection(db, "clubJoins"), joinData);
      console.log("Join data saved:", result);

      setSuccess(true);
      setFormData({
        name: "",
        rollNo: "",
        branch: "",
        year: "",
        section: "",
        phone: "",
        email: ""
      });
    } catch (error) {
      console.error("Error joining club:", error);
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!submissionEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertCircle className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Submissions Closed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 dark:text-gray-300"
            >
              Club membership applications are currently closed. Please check back later or contact the club administrators for more information.
            </motion.p>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Application Submitted!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 dark:text-gray-300 mb-6"
            >
              Thank you for your interest in joining the HITAM AI Club. We"ve sent a welcome email with the WhatsApp group link to your email address. We"ll review your application and get back to you soon.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button onClick={() => setSuccess(false)}>
                Submit Another Application
              </Button>
            </motion.div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Join the HITAM AI Club
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Be part of the future of AI at HITAM. Join our community of passionate students 
            exploring the frontiers of artificial intelligence and machine learning.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Why Join Us?
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      icon: <Book className="w-6 h-6" />,
                      title: "Learn AI/ML",
                      description: "Hands-on workshops and tutorials on cutting-edge AI technologies"
                    },
                    {
                      icon: <Users className="w-6 h-6" />,
                      title: "Network",
                      description: "Connect with like-minded students and industry professionals"
                    },
                    {
                      icon: <Mail className="w-6 h-6" />,
                      title: "Projects",
                      description: "Work on real-world AI projects and build your portfolio"
                    },
                    {
                      icon: <Phone className="w-6 h-6" />,
                      title: "Career Support",
                      description: "Get guidance for AI careers and internship opportunities"
                    }
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Application Form
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />

                  <Input
                    label="Student Roll Number"
                    value={formData.rollNo}
                    onChange={(e) => handleChange("rollNo", e.target.value)}
                    placeholder="Enter your roll number"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Branch *
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => handleChange("branch", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Academic Year *
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) => handleChange("year", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Year</option>
                        {years.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Section *
                      </label>
                      <select
                        value={formData.section}
                        onChange={(e) => handleChange("section", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Section</option>
                        {sections.map((section) => (
                          <option key={section} value={section}>
                            {section}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Mobile Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+91 XXXXXXXXXX"
                    required
                  />

                  <Input
                    label="HITAM Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your.email@hitam.org"
                    required
                  />

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg"
                    >
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full"
                    size="lg"
                  >
                    Join the Club
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </div>

        
        
      </div>
    </div>
  );
};

export default JoinClub;