import { useState } from "react";
import { motion } from "framer-motion";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FiCheck } from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import AnimatedSection from "../components/ui/AnimatedSection";
import JoinClubForm from "../components/forms/JoinClubForm";
import { toast } from "react-toastify";

function JoinClubPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // Add member to Firestore
      await addDoc(collection(db, "members"), {
        ...formData,
        role: "Member",
        joinDate: new Date().toISOString(),
      });
      
      // Show success message
      setSubmitted(true);
      toast.success("Successfully joined the AI Club!");
      
      // In a real implementation, you would also:
      // 1. Send confirmation email
      // 2. Include WhatsApp group invite link
      
    } catch (error) {
      console.error("Error joining club:", error);
      toast.error("Failed to join the club. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div>
      <PageHeader 
        title="Join HITAM AI Club" 
        subtitle="Become a part of our growing community and explore the world of AI together"
      />
      
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up" className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join Us?</h2>
            <p className="text-lg text-neutral-700 dark:text-neutral-300">
              By becoming a member of the HITAM AI Club, you"ll gain access to exclusive workshops, events, and hands-on projects. Connect with like-minded peers and industry experts to enhance your AI knowledge and skills.
            </p>
          </AnimatedSection>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <AnimatedSection animation="fade-right">
              <div className="card h-full">
                <h3 className="text-xl font-semibold mb-4">Benefits of Joining</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Participate in hands-on AI workshops and training sessions</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Collaborate on real-world AI projects with peers</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Network with industry professionals and guest speakers</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Access to resources, tutorials, and learning materials</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Opportunity to participate in hackathons and competitions</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Enhance your resume with practical AI experience</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fade-left">
              <div className="card h-full">
                <h3 className="text-xl font-semibold mb-4">Club Activities</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Regular technical workshops on AI/ML tools and frameworks</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Guest lectures from industry experts and researchers</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Group projects addressing real-world challenges</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>AI hackathons and coding competitions</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Field trips to tech companies and research labs</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheck className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Networking events and social gatherings</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>
          </div>
          
          {submitted ? (
            <motion.div 
              className="card p-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 mx-auto bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mb-6">
                <FiCheck className="text-success-500" size={32} />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Welcome to HITAM AI Club!</h2>
              <p className="text-lg mb-6">
                Your application has been submitted successfully. You"ll receive a confirmation email shortly with more details and a WhatsApp group invite link.
              </p>
              
              <div className="max-w-md mx-auto p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-6">
                <p className="text-neutral-700 dark:text-neutral-300">
                  <strong>Next Steps:</strong><br />
                  1. Check your email for confirmation<br />
                  2. Join our WhatsApp group<br />
                  3. Attend our next meeting
                </p>
              </div>
              
              <button
                onClick={() => setSubmitted(false)}
                className="btn-outline"
              >
                Submit Another Application
              </button>
            </motion.div>
          ) : (
            <AnimatedSection animation="fade-up" className="card p-8">
              <h2 className="text-2xl font-bold mb-6">Membership Application</h2>
              <p className="text-neutral-700 dark:text-neutral-300 mb-8">
                Please fill out the form below to join HITAM AI Club. Only HITAM students with a valid HITAM email address can join.
              </p>
              
              <JoinClubForm 
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
              />
            </AnimatedSection>
          )}
        </div>
      </div>
    </div>
  );
}

export default JoinClubPage;