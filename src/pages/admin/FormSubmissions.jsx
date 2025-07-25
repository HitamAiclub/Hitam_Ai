import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Download, Eye, Calendar, Users, Trash2, Edit } from 'lucide-react';

const FormSubmissions = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAllSubmissions();
    }
  }, [user]);

  const fetchAllSubmissions = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Fetching submissions for user:', user.uid);
      
      const activitiesSnapshot = await getDocs(collection(db, 'upcomingActivities'));
      console.log('Activities found:', activitiesSnapshot.size);
      
      const activitiesData = await Promise.all(
        activitiesSnapshot.docs.map(async (doc) => {
          const activity = { id: doc.id, ...doc.data() };
          
          let registrations = [];
          try {
            const registrationsSnapshot = await getDocs(
              collection(db, 'upcomingActivities', doc.id, 'registrations')
            );
            registrations = registrationsSnapshot.docs.map(regDoc => ({
              id: regDoc.id,
              activityId: doc.id,
              ...regDoc.data()
            }));
            console.log(`Registrations for ${activity.title}:`, registrations.length);
          } catch (regError) {
            console.warn(`Error fetching registrations for ${activity.title}:`, regError);
            // Continue with empty registrations array
          }
          
          return { ...activity, registrations, type: 'activity' };
        })
      );
      
      setActivities(activitiesData);
      console.log('Total activities loaded:', activitiesData.length);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(error.message);
      
      // Fallback: try to load from allRegistrations collection
      try {
        console.log('Trying fallback method...');
        const allRegsSnapshot = await getDocs(collection(db, 'allRegistrations'));
        const groupedRegistrations = {};
        
        allRegsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const activityId = data.activityId;
          if (!groupedRegistrations[activityId]) {
            groupedRegistrations[activityId] = {
              id: activityId,
              title: data.activityTitle || 'Unknown Activity',
              registrations: [],
              type: 'activity'
            };
          }
          groupedRegistrations[activityId].registrations.push({
            id: doc.id,
            ...data
          });
        });
        
        setActivities(Object.values(groupedRegistrations));
        setError(null);
        console.log('Fallback method successful');
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        setError('Unable to load submissions. Please check your permissions.');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportSubmissions = (submissions, title) => {
    if (submissions.length === 0) {
      alert('No submissions to export');
      return;
    }

    const csvContent = submissions.map(submission => {
      const row = [];
      Object.values(submission).forEach(value => {
        if (typeof value === 'object' && value !== null) {
          if (value.fileUrl) {
            row.push(value.fileUrl);
          } else {
            row.push(JSON.stringify(value));
          }
        } else {
          row.push(value || '');
        }
      });
      return row.join(',');
    }).join('\n');

    const headers = Object.keys(submissions[0]).join(',');
    const fullContent = headers + '\n' + csvContent;

    const blob = new Blob([fullContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_submissions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const viewSubmissions = (submissions, title) => {
    setSelectedSubmissions(submissions);
    setSelectedTitle(title);
    setShowModal(true);
  };

  const editSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowEditModal(true);
  };

  const updateSubmissionStatus = async (submissionId, activityId, newStatus) => {
    if (!user) {
      alert('User not authenticated');
      return;
    }

    try {
      console.log('Updating submission status:', { submissionId, activityId, newStatus });
      
      // Update in upcomingActivities collection
      try {
        await updateDoc(
          doc(db, 'upcomingActivities', activityId, 'registrations', submissionId),
          { 
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: user.uid
          }
        );
      } catch (updateError) {
        console.warn('Failed to update in upcomingActivities, trying allRegistrations:', updateError);
        
        // Fallback: update in allRegistrations
        await updateDoc(
          doc(db, 'allRegistrations', submissionId),
          { 
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: user.uid
          }
        );
      }
      
      // Refresh data
      await fetchAllSubmissions();
      setShowEditModal(false);
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const deleteSubmission = async (submissionId, activityId) => {
    if (!user) {
      alert('User not authenticated');
      return;
    }

    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        console.log('Deleting submission:', { submissionId, activityId });
        
        // Delete from upcomingActivities collection
        try {
          await deleteDoc(
            doc(db, 'upcomingActivities', activityId, 'registrations', submissionId)
          );
        } catch (deleteError) {
          console.warn('Failed to delete from upcomingActivities, trying allRegistrations:', deleteError);
          
          // Fallback: delete from allRegistrations
          await deleteDoc(
            doc(db, 'allRegistrations', submissionId)
          );
        }
        
        // Refresh data
        await fetchAllSubmissions();
        setShowModal(false);
        alert('Submission deleted successfully');
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Failed to delete submission');
      }
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
  if (error && activities.length === 0) {
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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Form Submissions
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage all event and activity registrations
          </p>
        </motion.div>

        {error && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              ⚠️ Some data may be incomplete due to permission issues. Showing available data.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((item, index) => (
            <Card key={item.id} delay={index * 0.1}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Activity
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Submissions: {item.registrations?.length || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {item.eventDate 
                        ? new Date(item.eventDate).toLocaleDateString()
                        : 'Date not set'
                      }
                    </span>
                  </div>
                  {item.isPaid && (
                    <div className="flex items-center">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Fee: ₹{item.fee}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewSubmissions(item.registrations || [], item.title)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportSubmissions(item.registrations || [], item.title)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {activities.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No form submissions found. Create activities to start receiving submissions.
            </p>
          </div>
        )}
      </div>

      {/* View Submissions Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Submissions for ${selectedTitle}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Total Submissions: {selectedSubmissions.length}
            </p>
            <Button
              size="sm"
              onClick={() => exportSubmissions(selectedSubmissions, selectedTitle)}
            >
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {selectedSubmissions.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Submitted</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSubmissions.map((submission, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{submission.name || '-'}</td>
                      <td className="px-4 py-2">{submission.email || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          submission.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {submission.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editSubmission(submission)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteSubmission(submission.id, submission.activityId)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No submissions found for this activity.
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit Submission Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Submission"
        size="lg"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <p className="text-gray-900 dark:text-white">{selectedSubmission.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">{selectedSubmission.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Status
                </label>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedSubmission.status === 'confirmed' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {selectedSubmission.status || 'pending'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Submitted At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : '-'}
                </p>
              </div>
            </div>

            {selectedSubmission.paymentProof && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Proof
                </label>
                <a
                  href={selectedSubmission.paymentProof.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View Payment Proof
                </a>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => updateSubmissionStatus(
                  selectedSubmission.id, 
                  selectedSubmission.activityId, 
                  'confirmed'
                )}
                className="flex-1"
              >
                Mark as Confirmed
              </Button>
              <Button
                variant="outline"
                onClick={() => updateSubmissionStatus(
                  selectedSubmission.id, 
                  selectedSubmission.activityId, 
                  'pending_payment'
                )}
                className="flex-1"
              >
                Mark as Pending
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FormSubmissions;