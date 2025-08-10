import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { uploadEventImage } from "../utils/cloudinary";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import ImageManager from "../components/ImageManager";
import { Calendar, User, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    sessionBy: "",
    type: "event"
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [optimisticEvents, setOptimisticEvents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Real-time listener for events with error handling
    const unsubscribe = onSnapshot(
      collection(db, "events"), 
      (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);
        setOptimisticEvents(eventsData);
        setLoading(false);
      }, 
      (error) => {
        console.warn("Events listener error:", error.message);
        setEvents([]);
        setOptimisticEvents([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, activeFilter]);

  const fetchEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (activeFilter === "all") {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.meta?.type === activeFilter));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // Optimistic update
    const tempId = Date.now().toString();
    const optimisticEvent = {
      id: editingEvent?.id || tempId,
      meta: {
        ...formData,
        imageUrl: imageFile ? URL.createObjectURL(imageFile) : editingEvent?.meta?.imageUrl || "",
        createdAt: editingEvent?.meta?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      isOptimistic: !editingEvent
    };

    if (editingEvent) {
      setOptimisticEvents(prev => 
        prev.map(event => 
          event.id === editingEvent.id ? optimisticEvent : event
        )
      );
    } else {
      setOptimisticEvents(prev => [...prev, optimisticEvent]);
    }

    // Close modal immediately
    setShowModal(false);
    resetForm();

    try {
      let imageUrl = editingEvent?.meta?.imageUrl || "";
      let imageStoragePath = editingEvent?.meta?.imageStoragePath || "";

      if (imageFile) {
        // Upload to Cloudinary
        const uploadResult = await uploadEventImage(imageFile);
        imageUrl = uploadResult.url;
        imageStoragePath = uploadResult.publicId; // Store Cloudinary public ID instead of storage path
      }

      const eventData = {
        meta: {
          ...formData,
          imageUrl,
          imageStoragePath,
          createdAt: editingEvent?.meta?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      if (editingEvent) {
        await updateDoc(doc(db, "events", editingEvent.id), eventData);
      } else {
        await addDoc(collection(db, "events"), eventData);
      }

    } catch (error) {
      console.error("Error saving event:", error);
      // Revert optimistic update on error
      if (editingEvent) {
        setOptimisticEvents(prev => 
          prev.map(event => 
            event.id === editingEvent.id ? editingEvent : event
          )
        );
      } else {
        setOptimisticEvents(prev => prev.filter(event => event.id !== tempId));
      }
      alert("Failed to save event. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.meta?.title || "",
      description: event.meta?.description || "",
      startDate: event.meta?.startDate || "",
      endDate: event.meta?.endDate || "",
      sessionBy: event.meta?.sessionBy || "",
      type: event.meta?.type || "event"
    });
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    setDeleteConfirm(eventId);
  };

  const confirmDelete = async () => {
    const eventId = deleteConfirm;
    setDeleteConfirm(null);

    // Optimistic delete
    const eventToDelete = optimisticEvents.find(e => e.id === eventId);
    setOptimisticEvents(prev => prev.filter(event => event.id !== eventId));

    try {
      // Delete image from storage if exists
      if (eventToDelete?.meta?.imageStoragePath) {
        const imageRef = storageRef(storage, eventToDelete.meta.imageStoragePath);
        await deleteObject(imageRef);
      }
      await deleteDoc(doc(db, "events", eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      // Revert optimistic delete on error
      if (eventToDelete) {
        setOptimisticEvents(prev => [...prev, eventToDelete]);
      }
      alert("Failed to delete event. Please try again.");
    }
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      sessionBy: "",
      type: "event"
    });
    setImageFile(null);
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "event", label: "Events" },
    { key: "workshop", label: "Workshops" }
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Events & Workshops
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover our upcoming events and workshops
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "primary" : "outline"}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Admin Controls */}
        {user && (
          <div className="flex justify-end mb-8">
            <Button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </Button>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {optimisticEvents.filter(event => 
              activeFilter === "all" || event.meta?.type === activeFilter
            ).map((event, index) => (
              <Card key={event.id} delay={index * 0.1}>
                <div className={`relative ${event.isOptimistic ? "opacity-75" : ""}`}>
                  <img
                    src={event.meta?.imageUrl || "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800"}
                    alt={event.meta?.title}
                    className="w-full h-48 object-cover rounded-t-2xl"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.meta?.type === "workshop" 
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    }`}>
                      {event.meta?.type === "workshop" ? "Workshop" : "Event"}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {event.meta?.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {event.meta?.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {event.meta?.sessionBy && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>Session by: {event.meta.sessionBy}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {event.meta?.startDate && new Date(event.meta.startDate).toLocaleDateString()}
                        {event.meta?.endDate && event.meta.endDate !== event.meta.startDate && 
                          ` - ${new Date(event.meta.endDate).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  </div>

                  {user && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(event)}
                        disabled={event.isOptimistic}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                        disabled={event.isOptimistic}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {optimisticEvents.filter(event => 
          activeFilter === "all" || event.meta?.type === activeFilter
        ).length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No events found for the selected filter.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEvent ? "Edit Event" : "Add Event"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            />
          </div>

          <Input
            label="Session By"
            value={formData.sessionBy}
            onChange={(e) => setFormData({...formData, sessionBy: e.target.value})}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="event">Event</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" loading={uploading} className="flex-1">
              {editingEvent ? "Update" : "Create"} Event
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
            Are you sure you want to delete this event? This action cannot be undone.
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

export default EventsPage;