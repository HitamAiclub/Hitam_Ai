import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { uploadCommitteeMemberImage } from "../../utils/cloudinary";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { Plus, Edit, Trash2, Upload, User } from "lucide-react";
import { COMMITTEE_ROLES, organizeMembersByRole, groupCoreTeamByLevel, shouldUseLevelWiseDisplay, isValidRole } from "../../utils/committeeRoles";

const CommitteeMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    branch: "",
    year: "",
    email: "",
    phone: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [optimisticMembers, setOptimisticMembers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Committee roles (updated to match specification)
  const roles = Object.values(COMMITTEE_ROLES);

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

  useEffect(() => {
    // Real-time listener with error handling
    const unsubscribe = onSnapshot(
      collection(db, "committeeMembers"), 
      (snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(membersData);
        setOptimisticMembers(membersData);
        setLoading(false);
      }, 
      (error) => {
        console.warn("Committee members listener error:", error.message);
        setMembers([]);
        setOptimisticMembers([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Starting committee member submission...");
    console.log("Form data:", formData);
    console.log("Current user:", auth.currentUser);
    
    // Check authentication first
    if (!auth.currentUser) {
      alert("You must be logged in to perform this action");
      return;
    }
    
    // Validate role strictly
    if (!formData.role || !isValidRole(formData.role)) {
      alert("Please select a valid role from the allowed roles.");
      return;
    }

    setUploading(true);
    
    // Optimistic update for faster UI response
    const tempId = Date.now().toString();
    const optimisticMember = {
      id: editingMember?.id || tempId,
      ...formData,
      photoUrl: imageFile ? URL.createObjectURL(imageFile) : editingMember?.photoUrl || "",
      createdAt: editingMember?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOptimistic: !editingMember
    };

    if (editingMember) {
      // Update existing member optimistically
      setOptimisticMembers(prev => 
        prev.map(member => 
          member.id === editingMember.id ? optimisticMember : member
        )
      );
    } else {
      // Add new member optimistically
      setOptimisticMembers(prev => [...prev, optimisticMember]);
    }

    // Close modal immediately for better UX
    setShowModal(false);
    resetForm();

    try {
      let photoUrl = editingMember?.photoUrl || "";
      
      if (imageFile) {
        console.log("Uploading image to Cloudinary...");
        // Upload to Cloudinary
        const uploadResult = await uploadCommitteeMemberImage(imageFile);
        console.log("Image uploaded successfully to Cloudinary");
        photoUrl = uploadResult.url;
        console.log("Image URL obtained from Cloudinary");
      }

      const memberData = {
        ...formData,
        photoUrl,
        createdAt: editingMember?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("Saving member data to Firestore...");
      
      if (editingMember) {
        await updateDoc(doc(db, "committeeMembers", editingMember.id), memberData);
        console.log("Member updated successfully");
      } else {
        const docRef = await addDoc(collection(db, "committeeMembers"), memberData);
        console.log("Member added successfully with ID:", docRef.id);
      }

      // Real-time listener will handle the update
      alert(editingMember ? "Member updated successfully!" : "Member added successfully!");
    } catch (error) {
      console.error("Error saving member:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Auth state:", auth.currentUser ? "Authenticated" : "Not authenticated");
      
      if (error.code === "permission-denied") {
        alert("Permission denied. Please ensure you are logged in as an admin and Firebase rules allow write access.");
      } else {
        alert(`Failed to save member: ${error.message}`);
      }
      
      // Revert optimistic update on error
      if (editingMember) {
        setOptimisticMembers(prev => 
          prev.map(member => 
            member.id === editingMember.id ? editingMember : member
          )
        );
      } else {
        setOptimisticMembers(prev => prev.filter(member => member.id !== tempId));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      role: member.role || "",
      branch: member.branch || "",
      year: member.year || "",
      email: member.email || "",
      phone: member.phone || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (memberId) => {
    setDeleteConfirm(memberId);
  };

  const confirmDelete = async () => {
    const memberId = deleteConfirm;
    setDeleteConfirm(null);
    
    // Optimistic delete
    const memberToDelete = optimisticMembers.find(m => m.id === memberId);
    setOptimisticMembers(prev => prev.filter(member => member.id !== memberId));

    try {
      await deleteDoc(doc(db, "committeeMembers", memberId));
    } catch (error) {
      console.error("Error deleting member:", error);
      // Revert optimistic delete on error
      if (memberToDelete) {
        setOptimisticMembers(prev => [...prev, memberToDelete]);
      }
      alert("Failed to delete member. Please try again.");
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      branch: "",
      year: "",
      email: "",
      phone: ""
    });
    setImageFile(null);
  };

  const exportMembers = () => {
    if (members.length === 0) {
      alert("No members to export");
      return;
    }

    const csvContent = members.map(member => {
      return [
        member.name,
        member.role,
        member.branch,
        member.year,
        member.email,
        member.phone,
        member.createdAt
      ].join(",");
    }).join("\n");

    const headers = "Name,Role,Branch,Year,Email,Phone,Created At";
    const fullContent = headers + "\n" + csvContent;

    const blob = new Blob([fullContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "committee_members.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
              Committee Members
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage the HITAM AI Club committee members
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportMembers}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Core Team Section */}
            {(() => {
              const { coreTeam, committeeMembers } = organizeMembersByRole(optimisticMembers);
              const coreTeamByLevel = groupCoreTeamByLevel(coreTeam);

              return (
                <>
                  {coreTeam.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Core Team
                      </h2>
                      <div className="space-y-6">
                        {Object.entries(coreTeamByLevel).map(([role, members]) => 
                          members.length > 0 && (
                            <div key={role}>
                              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
                                {role}
                              </h3>
                              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {members.map((member, index) => (
                                  <Card key={member.id} delay={index * 0.1}>
                                    <div className={`p-6 ${member.isOptimistic ? "opacity-75" : ""}`}>
                                      <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                                          {member.photoUrl ? (
                                            <img 
                                              src={member.photoUrl} 
                                              alt={member.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <User className="w-8 h-8 text-white" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {member.name}
                                          </h3>
                                          <p className="text-blue-600 dark:text-blue-400 font-medium">
                                            {member.role}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                                        {member.branch && (
                                          <p><strong>Branch:</strong> {member.branch}</p>
                                        )}
                                        {member.year && (
                                          <p><strong>Year:</strong> {member.year}</p>
                                        )}
                                        {member.email && (
                                          <p><strong>Email:</strong> {member.email}</p>
                                        )}
                                        {member.phone && (
                                          <p><strong>Phone:</strong> {member.phone}</p>
                                        )}
                                      </div>

                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEdit(member)}
                                          className="flex-1"
                                          disabled={member.isOptimistic}
                                        >
                                          <Edit className="w-4 h-4 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          variant="danger"
                                          size="sm"
                                          onClick={() => handleDelete(member.id)}
                                          disabled={member.isOptimistic}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Committee Members Section */}
                  {committeeMembers.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Committee Members
                      </h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {committeeMembers.map((member, index) => (
                          <Card key={member.id} delay={index * 0.1}>
                            <div className={`p-6 ${member.isOptimistic ? "opacity-75" : ""}`}>
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                                  {member.photoUrl ? (
                                    <img 
                                      src={member.photoUrl} 
                                      alt={member.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-8 h-8 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {member.name}
                                  </h3>
                                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                                    {member.role}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {member.branch && (
                                  <p><strong>Branch:</strong> {member.branch}</p>
                                )}
                                {member.year && (
                                  <p><strong>Year:</strong> {member.year}</p>
                                )}
                                {member.email && (
                                  <p><strong>Email:</strong> {member.email}</p>
                                )}
                                {member.phone && (
                                  <p><strong>Phone:</strong> {member.phone}</p>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(member)}
                                  className="flex-1"
                                  disabled={member.isOptimistic}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(member.id)}
                                  disabled={member.isOptimistic}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {optimisticMembers.length === 0 && (
                    <div className="text-center py-12">
                      <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No committee members found. Add your first member to get started.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Add/Edit Member Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMember ? "Edit Member" : "Add Committee Member"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 overflow-hidden">
              {imageFile ? (
                <img 
                  src={URL.createObjectURL(imageFile)} 
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : editingMember?.photoUrl ? (
                <img 
                  src={editingMember.photoUrl} 
                  alt={editingMember.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch
              </label>
              <select
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="member@hitam.org"
            />
            
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+91 XXXXXXXXXX"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" loading={uploading} className="flex-1">
              {editingMember ? "Update" : "Add"} Member
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this committee member? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommitteeMembers;