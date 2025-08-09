import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { FiPlus, FiSearch, FiFilter } from "react-icons/fi";
import PageHeader from "../components/ui/PageHeader";
import MemberCard from "../components/admin/MemberCard";
import MemberForm from "../components/admin/MemberForm";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    if (isAdmin) {
      fetchMembers();
    }
  }, [isAdmin]);
  
  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  async function fetchMembers() {
    try {
      setLoading(true);
      
      // Get members from Firestore
      const membersQuery = collection(db, "members");
      const membersSnapshot = await getDocs(membersQuery);
      const membersData = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort: committee members first, then alphabetically by name
      membersData.sort((a, b) => {
        if (a.role === "Member" && b.role !== "Member") return 1;
        if (a.role !== "Member" && b.role === "Member") return -1;
        return a.name.localeCompare(b.name);
      });
      
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }
  
  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };
  
  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };
  
  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await deleteDoc(doc(db, "members", id));
        setMembers(members.filter(member => member.id !== id));
        toast.success("Member deleted successfully");
      } catch (error) {
        console.error("Error deleting member:", error);
        toast.error("Failed to delete member");
      }
    }
  };
  
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // This is a placeholder for the actual Firebase implementation
      // In a real implementation, you would:
      // 1. Create or update document in Firestore
      
      setTimeout(() => {
        // Simulate successful submission
        setShowForm(false);
        fetchMembers();
        toast.success(editingMember ? "Member updated successfully" : "Member added successfully");
      }, 1000);
    } catch (error) {
      console.error("Error submitting member:", error);
      toast.error("Failed to save member");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter and search members
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === "all" || 
      (filter === "committee" && member.role !== "Member") ||
      (filter === "regular" && member.role === "Member");
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div>
      <PageHeader 
        title="Community Members" 
        subtitle="Manage and view all HITAM AI Club members"
      />
      
      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            {/* Filter Options */}
            <div className="flex items-center">
              <FiFilter className="mr-2 text-neutral-500" />
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === "all"
                      ? "bg-primary-500 text-white"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("committee")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === "committee"
                      ? "bg-primary-500 text-white"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  Committee
                </button>
                <button
                  onClick={() => setFilter("regular")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filter === "regular"
                      ? "bg-primary-500 text-white"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  Regular
                </button>
              </div>
            </div>
          </div>
          
          <motion.button
            onClick={handleAddMember}
            className="btn-primary flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus className="mr-2" />
            Add Member
          </motion.button>
        </div>
        
        {/* Member Form Dialog */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold mb-6">
                  {editingMember ? "Edit Member" : "Add New Member"}
                </h2>
                
                <MemberForm 
                  initialData={editingMember || {}}
                  onSubmit={handleSubmit}
                  onCancel={() => setShowForm(false)}
                  isLoading={isSubmitting}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Members Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              {searchQuery 
                ? "No members found matching your search criteria." 
                : "No members found in the database."}
            </p>
            <button
              onClick={handleAddMember}
              className="btn-outline"
            >
              Add Your First Member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MembersPage;