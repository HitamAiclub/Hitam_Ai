import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { UserPlus, CheckCircle, Users, Brain, Zap, Target } from 'lucide-react';

const JoinClubPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    branch: '',
    year: '',
    section: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const branches = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Aerospace Engineering',
    'Artificial Intelligence and Machine Learning'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email domain
    if (!formData.email.endsWith('@hitam.org')) {
      setError('Please use your HITAM email address (@hitam.org)');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'clubJoins'), {
        ...formData,
        joinedAt: new Date().toISOString(),
        status: 'pending'
      });

      setSuccess(true);
      setFormData({
        name: '',
        rollNo: '',
        branch: '',
        year: '',
        section: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error joining club:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <Card className="max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-white" />
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
            Thank you for your interest in joining the Hitam AI Club. We'll review your application and get back to you soon.
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
        </Card>
      </div>
    );
  }

  const benefits = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Learn AI/ML",
      description: "Hands-on workshops and tutorials on cutting-edge AI technologies"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Network",
      description: "Connect with like-minded students and industry professionals"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Projects",
      description: "Work on real-world AI projects and build your portfolio"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Career Support",
      description: "Get guidance for AI careers and internship opportunities"
    }
  ];

  return (
    <div className="min-h-screen pt-16 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Join the Hitam AI Club
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Be part of the future of AI at HITAM. Join our community of passionate students 
            exploring the frontiers of artificial intelligence and machine learning.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Why Join Us?
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
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
            </Card>
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Application Form
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

                <Input
                  label="Roll Number"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  placeholder="Enter your roll number"
                  required
                />

                <div>
                  <label className="form-label">Branch</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select your branch</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Year</label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    placeholder="e.g., A, B, C"
                    required
                  />
                </div>

                <Input
                  label="HITAM Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@hitam.org"
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXXXXXXX"
                  required
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl"
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
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join the Club
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JoinClubPage;