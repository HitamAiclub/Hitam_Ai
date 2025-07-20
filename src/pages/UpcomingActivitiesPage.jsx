import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { FiCalendar, FiUser, FiMapPin, FiPlus, FiExternalLink } from 'react-icons/fi';
import PageHeader from '../components/ui/PageHeader';
import AnimatedSection from '../components/ui/AnimatedSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate, isFutureDate } from '../utils/dateUtils';

function UpcomingActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    type: 'event',
    presenter: '',
    location: '',
    imageUrl: '',
    registrationLink: ''
  });
  const [formError, setFormError] = useState('');
  // Registration modal state
  const [showRegModal, setShowRegModal] = useState(false);
  const [regActivity, setRegActivity] = useState(null);
  const [regSaving, setRegSaving] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', email: '', phone: '' });
  const [regError, setRegError] = useState('');
  
  useEffect(() => {
    fetchActivities();
  }, []);
  
  async function fetchActivities() {
    try {
      setLoading(true);
      
      // Get current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Create query for upcoming activities
      const activitiesQuery = query(
        collection(db, 'events'),
        where('date', '>=', today),
        orderBy('date')
      );
      
      const activitiesSnapshot = await getDocs(activitiesQuery);
      const activitiesData = activitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }
  
  const handleAddActivity = () => {
    setForm({
      title: '',
      description: '',
      date: '',
      endDate: '',
      type: 'event',
      presenter: '',
      location: '',
      imageUrl: '',
      registrationLink: ''
    });
    setFormError('');
    setShowAddModal(true);
  };

  async function saveActivity(e) {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.date || !form.description) {
      setFormError('Title, Date, and Description are required.');
      return;
    }
    setSaving(true);
    try {
      // Convert date fields to Firestore Timestamp
      const dateObj = new Date(form.date);
      const endDateObj = form.endDate ? new Date(form.endDate) : null;
      const docData = {
        ...form,
        date: Timestamp.fromDate(dateObj),
        ...(endDateObj ? { endDate: Timestamp.fromDate(endDateObj) } : {})
      };
      await addDoc(collection(db, 'events'), docData);
      setShowAddModal(false);
      setForm({
        title: '', description: '', date: '', endDate: '', type: 'event', presenter: '', location: '', imageUrl: '', registrationLink: ''
      });
      fetchActivities();
    } catch (err) {
      setFormError('Failed to save activity. Please try again.');
    } finally {
      setSaving(false);
    }
  }
  
  return (
    <div>
      <PageHeader 
        title="Upcoming Activities" 
        subtitle="Stay informed about our upcoming events and workshops"
      />
      <div className="container py-12">
        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex justify-end mb-8">
            <motion.button
              onClick={handleAddActivity}
              className="btn-primary flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus className="mr-2" />
              Add Activity
            </motion.button>
          </div>
        )}
        {/* Add Activity Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Activity" size="lg">
          <form onSubmit={saveActivity} className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required multiline rows={3} />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 border rounded">
                  <option value="event">Event</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
              <Input label="Presenter" value={form.presenter} onChange={e => setForm(f => ({ ...f, presenter: e.target.value }))} />
            </div>
            <div className="flex gap-4">
              <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="flex-1" />
              <Input label="Image URL" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="flex-1" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border rounded" required />
              </div>
              {form.type === 'workshop' && (
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full px-3 py-2 border rounded" />
                </div>
              )}
            </div>
            <Input label="Registration Link" value={form.registrationLink} onChange={e => setForm(f => ({ ...f, registrationLink: e.target.value }))} />
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Activity'}</button>
            </div>
          </form>
        </Modal>
        {/* Registration Modal */}
        <Modal isOpen={showRegModal} onClose={() => setShowRegModal(false)} title={regActivity ? `Register for ${regActivity.title}` : 'Register'} size="md">
          <form onSubmit={async (e) => {
            e.preventDefault();
            setRegError('');
            if (!regForm.name || !regForm.email || !regForm.phone) {
              setRegError('All fields are required.');
              return;
            }
            setRegSaving(true);
            try {
              await addDoc(collection(db, `events/${regActivity.id}/registrations`), {
                ...regForm,
                submittedAt: new Date().toISOString()
              });
              setShowRegModal(false);
              setRegForm({ name: '', email: '', phone: '' });
              alert('Registration submitted!');
            } catch (err) {
              setRegError('Failed to submit registration. Please try again.');
            } finally {
              setRegSaving(false);
            }
          }} className="space-y-4">
            <Input label="Name" value={regForm.name} onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Email" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} required />
            <Input label="Phone" value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} required />
            {regError && <div className="text-red-500 text-sm">{regError}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-outline" onClick={() => setShowRegModal(false)} disabled={regSaving}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={regSaving}>{regSaving ? 'Submitting...' : 'Submit'}</button>
            </div>
          </form>
        </Modal>
        {/* Activities List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-8">
            {activities.map((activity, index) => (
              <AnimatedSection
                key={activity.id}
                animation="fade-up"
                delay={index * 0.1}
                className="card overflow-hidden"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 bg-neutral-100 dark:bg-neutral-800">
                    <img 
                      src={activity.imageUrl || 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg'} 
                      alt={activity.title} 
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.type === 'event' 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-secondary-500 text-white'
                      }`}>
                        {activity.type === 'event' ? 'Event' : 'Workshop'}
                      </span>
                      <div className="flex items-center text-neutral-500 dark:text-neutral-400 text-sm">
                        <FiCalendar className="mr-1" />
                        <span>
                          {activity.type === 'workshop' && activity.endDate
                            ? `${formatDate(activity.date)} - ${formatDate(activity.endDate)}`
                            : formatDate(activity.date)
                          }
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3">{activity.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-300 mb-6 line-clamp-2 md:line-clamp-3">
                      {activity.description}
                    </p>
                    <div className="flex flex-wrap gap-6 mb-6">
                      {activity.presenter && (
                        <div className="flex items-center text-neutral-500 dark:text-neutral-400">
                          <FiUser className="mr-2" />
                          <span>{activity.presenter}</span>
                        </div>
                      )}
                      {activity.location && (
                        <div className="flex items-center text-neutral-500 dark:text-neutral-400">
                          <FiMapPin className="mr-2" />
                          <span>{activity.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <a
                        href={`/events/${activity.id}`}
                        className="btn-outline flex items-center"
                      >
                        View Details
                      </a>
                      <button
                        className="btn-primary flex items-center"
                        onClick={() => {
                          setRegActivity(activity);
                          setShowRegModal(true);
                        }}
                      >
                        Register
                      </button>
                      {activity.registrationLink && (
                        <a
                          href={activity.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary flex items-center"
                        >
                          Register Now
                          <FiExternalLink className="ml-2" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              No upcoming activities scheduled at the moment.
            </p>
            {isAdmin && (
              <button
                onClick={handleAddActivity}
                className="btn-outline"
              >
                Add Your First Activity
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpcomingActivitiesPage;