import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, onSnapshot, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { Download, Users, Calendar, Mail, Phone, GraduationCap, Settings, Trash2, UserPlus } from "lucide-react";

const CommunityMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [acceptingSubmissions, setAcceptingSubmissions] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMembers();
      loadSettings();
    }
  }, [user]);

  const fetchMembers = async () => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("Fetching community members for user:", user.uid);
      
      const snapshot = await getDocs(collection(db, "clubJoins"));
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(membersData);
      console.log("Community members loaded:", membersData.length);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "clubJoinStatus"));
      if (settingsDoc.exists()) {
        setAcceptingSubmissions(settingsDoc.data().enabled || false);
      }
    } catch (error) {
      console.warn("Could not load settings:", error.message);
    }
  };

  const deleteMember = async (memberId) => {
    if (!user) {
      alert("User not authenticated");
      return;
    }

    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        console.log("Deleting member:", memberId);
        await deleteDoc(doc(db, "clubJoins", memberId));
        await fetchMembers();
        alert("Member deleted successfully");
      } catch (error) {
        console.error("Error deleting member:", error);
        alert("Failed to delete member");
      }
    }
  };

  const exportMembers = () => {
    if (members.length === 0) {
      alert("No members to export");
      return;
    }

    const csvContent = members.map(member => {
      return [
        member.name || "",
        member.rollNo || "",
        member.branch || "",
        member.year || "",
        member.section || "",
        member.email || "",
        member.phone || "",
        member.joinedAt || "",
        
      ].join(",");
    }).join("\n");

    const headers = "Name,Roll No,Branch,Year,Section,Email,Phone,Joined At";
    const fullContent = headers + "\n" + csvContent;

    const blob = new Blob([fullContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "community_members.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateSubmissionSettings = async () => {
    if (!user) {
      alert("User not authenticated");
      return;
    }

    setSettingsLoading(true);
    try {
      console.log("Updating submission settings:", acceptingSubmissions);
      
      // Save settings to Firestore
      await setDoc(doc(db, "settings", "clubJoinStatus"), {
        enabled: acceptingSubmissions,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid
      });
      
      setShowSettingsModal(false);
      alert("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert(`Failed to update settings: ${error.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && members.length === 0) {
    return (
      <div className="min-h-screen pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Access Error
              </h3>
              <p className="text-red-600 dark:text-red-300 mb-4">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Community Members
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage students who have joined the AI club
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowSettingsModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button
              onClick={exportMembers}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </motion.div>

        {error && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Some data may be incomplete due to permission issues. Showing available data.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <Card key={member.id} delay={index * 0.1}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {member.name}
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      {member.rollNo}
                    </span>
               
                  </h3>
                  
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{member.email}</span>

                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="truncate">{member.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <span>{member.branch} - {member.year}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {member.joinedAt 
                        ? new Date(member.joinedAt).toLocaleDateString()
                        : "Date not available"
                      }
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteMember(member.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {members.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No community members found. Students can join the club through the "Join the Club" page.
            </p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Community Settings"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={acceptingSubmissions}
                onChange={(e) => setAcceptingSubmissions(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Accept new member submissions
              </span>
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              When disabled, students won"t be able to submit new join requests
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(false)}
              disabled={settingsLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={updateSubmissionSettings}
              loading={settingsLoading}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommunityMembers;