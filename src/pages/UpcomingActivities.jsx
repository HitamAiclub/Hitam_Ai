import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { uploadFormFile } from "../utils/cloudinary";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import FormBuilder from "../components/FormBuilder/FormBuilder";
import { Calendar, Users, Plus, Edit, Trash2, Download, Eye, ExternalLink } from "lucide-react";

const UpcomingActivities = () => {
  const [activities, setActivities] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    registrationStart: "",
    registrationEnd: "",
    eventDate: "",
    maxParticipants: "",
    isPaid: false,
    fee: "",
    formSchema: [],
    paymentDetails: {
      paymentUrl: "",
      instructions: ""
    }
  });
  const [registrationData, setRegistrationData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [optimisticActivities, setOptimisticActivities] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize formSchema with default schema
    console.log("Initializing formData with default schema");
    const defaultSchema = getDefaultFormSchema();
    console.log("Default schema:", defaultSchema);
    setFormData(prev => ({
      ...prev,
      formSchema: defaultSchema
    }));
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "upcomingActivities"), 
      async (snapshot) => {
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActivities(activitiesData);
        setOptimisticActivities(activitiesData);

        const registrationsData = {};
        for (const activity of activitiesData) {
          try {
            const registrationsSnapshot = await getDocs(collection(db, "upcomingActivities", activity.id, "registrations"));
            registrationsData[activity.id] = registrationsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
          } catch (error) {
            console.warn(`Could not fetch registrations for ${activity.id}:`, error.message);
            registrationsData[activity.id] = [];
          }
        }
        setRegistrations(registrationsData);
        setLoading(false);
      }, 
      (error) => {
        console.warn("Activities listener error:", error.message);
        setActivities([]);
        setOptimisticActivities([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Starting activity submission...", formData);
    console.log("User authentication status:", !!user);
    console.log("User details:", user);
    console.log("Form data validation:", {
      title: !!formData.title,
      description: !!formData.description,
      registrationStart: !!formData.registrationStart,
      registrationEnd: !!formData.registrationEnd,
      eventDate: !!formData.eventDate,
      formSchema: !!formData.formSchema,
      formSchemaLength: formData.formSchema?.length,
      formSchemaType: typeof formData.formSchema,
      formSchemaIsArray: Array.isArray(formData.formSchema)
    });
    
    // Additional validation
    if (!formData.title || !formData.description || !formData.registrationStart || 
        !formData.registrationEnd || !formData.eventDate) {
      alert("Please fill in all required fields: Title, Description, Registration Start, Registration End, and Event Date.");
      setSubmitting(false);
      return;
    }
    
    if (!formData.formSchema || !Array.isArray(formData.formSchema) || formData.formSchema.length === 0) {
      console.warn("FormSchema is invalid, using default schema");
      formData.formSchema = getDefaultFormSchema();
    }

    // Check if user is authenticated for form creation
    if (!user) {
      alert("You must be logged in to create or edit activities. Please log in as an admin.");
      setSubmitting(false);
      return;
    }

    console.log("User is authenticated, proceeding with submission...");
    setSubmitting(true);

    const tempId = Date.now().toString();
    const optimisticActivity = {
      id: editingActivity?.id || tempId,
      ...formData,
      formSchema: formData.formSchema && formData.formSchema.length > 0 
        ? formData.formSchema 
        : getDefaultFormSchema(),
      createdAt: editingActivity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOptimistic: !editingActivity
    };

    if (editingActivity) {
      setOptimisticActivities(prev => 
        prev.map(activity => 
          activity.id === editingActivity.id ? optimisticActivity : activity
        )
      );
    } else {
      setOptimisticActivities(prev => [...prev, optimisticActivity]);
    }

    setShowModal(false);
    resetForm();

    try {
      // Ensure formSchema is properly initialized
      let finalFormSchema = formData.formSchema;
      if (!finalFormSchema || !Array.isArray(finalFormSchema) || finalFormSchema.length === 0) {
        console.log("FormSchema is empty or invalid, using default schema");
        finalFormSchema = getDefaultFormSchema();
      }

      console.log("Final form schema:", finalFormSchema);
      console.log("FormSchema type:", typeof finalFormSchema);
      console.log("FormSchema is array:", Array.isArray(finalFormSchema));

      // Utility function to remove undefined values recursively
      const removeUndefinedValues = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(item => removeUndefinedValues(item));
        } else if (obj !== null && typeof obj === "object") {
          const cleaned = {};
          Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (value !== undefined) {
              cleaned[key] = removeUndefinedValues(value);
            }
          });
          return cleaned;
        }
        return obj;
      };

      // Clean up form data to prevent undefined values in Firestore
      const cleanedFormData = {
        ...formData,
        maxParticipants: formData.maxParticipants && formData.maxParticipants.trim() !== "" 
          ? parseInt(formData.maxParticipants, 10) 
          : null,
        fee: formData.fee && formData.fee.trim() !== "" 
          ? parseFloat(formData.fee) 
          : null
      };
      
      console.log("Cleaned form data:", cleanedFormData);

      // Clean the form schema to remove undefined values
      const cleanedFormSchema = removeUndefinedValues(finalFormSchema);

      const activityData = {
        ...cleanedFormData,
        formSchema: cleanedFormSchema,
        createdAt: editingActivity?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Final cleanup of the entire activity data object
      const finalActivityData = removeUndefinedValues(activityData);

      console.log("Final activity data to save:", finalActivityData);
      console.log("Data type check:", {
        title: typeof finalActivityData.title,
        description: typeof finalActivityData.description,
        formSchema: typeof finalActivityData.formSchema,
        formSchemaIsArray: Array.isArray(finalActivityData.formSchema)
      });
      
              try {
          console.log("Attempting to save to Firebase with data:", finalActivityData);
          console.log("Firebase db object:", db);
          console.log("Collection reference:", collection(db, "upcomingActivities"));
          
          if (editingActivity) {
            console.log("Updating existing activity:", editingActivity.id);
            const docRef = doc(db, "upcomingActivities", editingActivity.id);
            console.log("Document reference:", docRef);
            const result = await updateDoc(docRef, finalActivityData);
            console.log("Activity updated successfully:", result);
          } else {
            console.log("Creating new activity");
            const colRef = collection(db, "upcomingActivities");
            console.log("Collection reference:", colRef);
            const result = await addDoc(colRef, finalActivityData);
            console.log("Activity added successfully:", result);
            console.log("New document ID:", result.id);
          }
        } catch (firebaseError) {
          console.error("Firebase error details:", firebaseError);
          console.error("Firebase error code:", firebaseError.code);
          console.error("Firebase error message:", firebaseError.message);
          console.error("Firebase error stack:", firebaseError.stack);
          throw firebaseError;
        }

    } catch (error) {
      console.error("Error saving activity:", error);
      console.error("Error stack:", error.stack);
      
      // Revert optimistic updates
      if (editingActivity) {
        setOptimisticActivities(prev => 
          prev.map(activity => 
            activity.id === editingActivity.id ? editingActivity : activity
          )
        );
      } else {
        setOptimisticActivities(prev => prev.filter(activity => activity.id !== tempId));
      }
      
      // Show more specific error message
      let errorMessage = "Failed to save activity. Please try again.";
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check if you're logged in as an admin.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase is currently unavailable. Please try again later.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formSchema = selectedActivity?.formSchema || getDefaultFormSchema();
      const missingFields = [];
      
      formSchema.forEach(field => {
        if (field.required && field.type !== "label" && field.type !== "image" && field.type !== "link") {
          const value = registrationData[field.id];
          
          // Handle different field types
          if (field.type === "checkbox") {
            // For checkboxes, check if array exists and has at least one item
            if (!value || !Array.isArray(value) || value.length === 0) {
              missingFields.push(field.label);
            }
          } else if (field.type === "file") {
            // For files, check if file object exists
            if (!value || !(value instanceof File)) {
              missingFields.push(field.label);
            }
          } else {
            // For other fields, check if value exists and is not empty string
            if (!value || value === "") {
              missingFields.push(field.label);
            }
          }
        }
      });

      if (missingFields.length > 0) {
        alert(`Please fill in the following required fields: ${missingFields.join(", ")}`);
        setSubmitting(false);
        return;
      }

      const processedData = { ...registrationData };
      
      for (const field of formSchema) {
        if (field.type === "file" && registrationData[field.id]) {
          try {
            const file = registrationData[field.id];
            if (file instanceof File) {
              // Upload to Cloudinary in form_register folder with activity title
              const uploadResult = await uploadFormFile(file, selectedActivity.title);
              processedData[field.id] = {
                fileName: file.name,
                fileUrl: uploadResult.url,
                fileSize: file.size,
                fileType: file.type,
                cloudinaryPublicId: uploadResult.publicId
              };
            }
          } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload file. Please try again.");
            setSubmitting(false);
            return;
          }
        }
      }

      const registrationDoc = {
        ...processedData,
        activityId: selectedActivity.id,
        activityTitle: selectedActivity.title,
        submittedAt: new Date().toISOString(),
        status: selectedActivity.isPaid ? "pending_payment" : "confirmed",
        formVersion: selectedActivity.updatedAt || selectedActivity.createdAt
      };

      await addDoc(collection(db, "upcomingActivities", selectedActivity.id, "registrations"), registrationDoc);
      await addDoc(collection(db, "allRegistrations"), registrationDoc);
      
      setShowRegistrationForm(false);
      setRegistrationData({});
      alert("Registration submitted successfully!");
    } catch (error) {
      console.error("Error submitting registration:", error);
      alert("Failed to submit registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title || "",
      description: activity.description || "",
      registrationStart: activity.registrationStart || "",
      registrationEnd: activity.registrationEnd || "",
      eventDate: activity.eventDate || "",
      maxParticipants: activity.maxParticipants || "",
      isPaid: activity.isPaid || false,
      fee: activity.fee || "",
      formSchema: activity.formSchema || getDefaultFormSchema(),
      paymentDetails: activity.paymentDetails || {
        paymentUrl: "",
        instructions: ""
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (activityId) => {
    setDeleteConfirm(activityId);
  };

  const confirmDelete = async () => {
    const activityId = deleteConfirm;
    setDeleteConfirm(null);
    
    const activityToDelete = optimisticActivities.find(a => a.id === activityId);
    setOptimisticActivities(prev => prev.filter(activity => activity.id !== activityId));

    try {
      // Delete all registrations for this activity in subcollection
      const registrationsRef = collection(db, "upcomingActivities", activityId, "registrations");
      const registrationsSnap = await getDocs(registrationsRef);
      const batchOps = [];
      registrationsSnap.forEach((docSnap) => {
        batchOps.push(deleteDoc(docSnap.ref));
      });
      await Promise.all(batchOps);


      // Delete all documents in allRegistrations where activityId field matches
      const allRegistrationsRef = collection(db, "allRegistrations");
      const allRegistrationsSnap = await getDocs(allRegistrationsRef);
      const deleteAllRegOps = [];
      allRegistrationsSnap.forEach((docSnap) => {
        if (docSnap.data().activityId === activityId) {
          deleteAllRegOps.push(deleteDoc(docSnap.ref));
        }
      });
      await Promise.all(deleteAllRegOps);

      // Delete only the document in upcomingActivities with id = activityId
      const activityDocRef = doc(db, "upcomingActivities", activityId);
      try {
        await deleteDoc(activityDocRef);
      } catch (e) {
        // If not found, ignore
      }
    } catch (error) {
      console.error("Error deleting activity and registrations:", error);
      if (activityToDelete) {
        setOptimisticActivities(prev => [...prev, activityToDelete]);
      }
      alert("Failed to delete activity. Please try again.");
    }
  };

  const resetForm = () => {
    setEditingActivity(null);
    setFormData({
      title: "",
      description: "",
      registrationStart: "",
      registrationEnd: "",
      eventDate: "",
      maxParticipants: "",
      isPaid: false,
      fee: "",
      formSchema: getDefaultFormSchema(),
      paymentDetails: {
        paymentUrl: "",
        instructions: ""
      }
    });
    setActiveTab("basic");
  };

  const isRegistrationOpen = (activity) => {
    const now = new Date();
    const start = new Date(activity.registrationStart);
    const end = new Date(activity.registrationEnd);
    return now >= start && now <= end;
  };

  const exportRegistrations = (activityId) => {
    const activityRegistrations = registrations[activityId] || [];
    if (activityRegistrations.length === 0) {
      alert("No registrations to export");
      return;
    }

    const csvContent = activityRegistrations.map(reg => {
      const row = [];
      Object.values(reg).forEach(value => {
        if (typeof value === "object" && value !== null) {
          row.push(JSON.stringify(value));
        } else {
          row.push(value || "");
        }
      });
      return row.join(",");
    }).join("\n");

    const headers = Object.keys(activityRegistrations[0]).join(",");
    const fullContent = headers + "\n" + csvContent;

    const blob = new Blob([fullContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations_${activityId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openRegistrationForm = (activity) => {
    setSelectedActivity(activity);
    setRegistrationData({});
    setShowRegistrationForm(true);
  };

  const canRegister = (activity) => {
    const now = new Date();
    const start = new Date(activity.registrationStart);
    const end = new Date(activity.registrationEnd);
    const isOpen = now >= start && now <= end;
    const hasSpace = !activity.maxParticipants || 
      (registrations[activity.id]?.length || 0) < parseInt(activity.maxParticipants);
    return isOpen && hasSpace;
  };

  const viewRegistrations = (activity) => {
    setSelectedActivity(activity);
    setShowViewModal(true);
  };

  const getDefaultFormSchema = () => [
    { 
      id: "name", 
      type: "text", 
      label: "Full Name", 
      required: true, 
      placeholder: "Enter your full name" 
    },
    { 
      id: "rollNo", 
      type: "text", 
      label: "Roll Number", 
      required: true, 
      placeholder: "Enter your roll number" 
    },
    { 
      id: "email", 
      type: "email", 
      label: "Email Address", 
      required: true, 
      placeholder: "your.email@hitam.org" 
    },
    { 
      id: "phone", 
      type: "phone", 
      label: "Phone Number", 
      required: true, 
      placeholder: "+91 XXXXXXXXXX" 
    },
    { 
      id: "year", 
      type: "select", 
      label: "Academic Year", 
      required: true, 
      options: ["1st Year", "2nd Year", "3rd Year", "4th Year"] 
    },
    { 
      id: "branch", 
      type: "select", 
      label: "Branch", 
      required: true, 
      options: [
         "Computer Science Engineering",
  "Computer Science Engineering (AI & ML)",
  "Computer Science Engineering (Data Science)",
  "Computer Science Engineering (Cyber Security)",
  "Computer Science Engineering (IoT)",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering"
      ]
    }
  ];

  const renderFormField = (field) => {
    if (field.type === "label" || field.type === "image" || field.type === "link") {
      return renderContentField(field);
    }

    const commonProps = {
      key: field.id,
      label: field.label + (field.required ? " *" : ""),
      value: registrationData[field.id] || "",
      onChange: (e) => setRegistrationData({...registrationData, [field.id]: e.target.value}),
      placeholder: field.placeholder,
      required: field.required
    };

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && "*"}
            </label>
            <textarea
              value={registrationData[field.id] || ""}
              onChange={(e) => setRegistrationData({...registrationData, [field.id]: e.target.value})}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && "*"}
            </label>
            <select
              value={registrationData[field.id] || ""}
              onChange={(e) => setRegistrationData({...registrationData, [field.id]: e.target.value})}
              required={field.required}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "radio":
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && "*"}
            </label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.id}-${index}`}
                    name={field.id}
                    value={option}
                    checked={registrationData[field.id] === option}
                    onChange={(e) => setRegistrationData({...registrationData, [field.id]: e.target.value})}
                    required={field.required}
                    className="text-blue-600"
                  />
                  <label htmlFor={`${field.id}-${index}`} className="text-sm text-gray-700 dark:text-gray-300">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label} {field.required && "*"}
            </label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${field.id}-${index}`}
                    value={option}
                    checked={(registrationData[field.id] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = registrationData[field.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      setRegistrationData({...registrationData, [field.id]: newValues});
                    }}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor={`${field.id}-${index}`} className="text-sm text-gray-700 dark:text-gray-300">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case "file":
        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label} {field.required && "*"}
            </label>
            <input
              type="file"
              onChange={(e) => setRegistrationData({...registrationData, [field.id]: e.target.files[0]})}
              required={field.required}
              accept={field.acceptedFileTypes || "*"}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {field.helpText && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {field.helpText}
              </p>
            )}
          </div>
        );

      case "phone":
        return <Input {...commonProps} type="tel" />;

      default:
        return <Input {...commonProps} type={field.type} />;
    }
  };

  const renderContentField = (field) => {
    const renderMarkdownLinks = (text) => {
      if (!text) return text;
      return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">${linkText}</a>`;
      });
    };

    const getFontSizeClass = (size) => {
      switch (size) {
        case "small": return "text-sm";
        case "large": return "text-lg";
        case "xl": return "text-xl";
        default: return "text-base";
      }
    };

    const getAlignmentClass = (alignment) => {
      switch (alignment) {
        case "center": return "text-center";
        case "right": return "text-right";
        default: return "text-left";
      }
    };

    switch (field.type) {
      case "label":
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-4`}>
            <div 
              className={`${getFontSizeClass(field.fontSize)} text-gray-900 dark:text-white`}
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdownLinks(field.content || "") 
              }}
            />
          </div>
        );

      case "image":
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-4`}>
            {field.imageUrl && (
              <img 
                src={field.imageUrl} 
                alt={field.altText || "Form image"} 
                className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
          </div>
        );

      case "link":
        const buttonClasses = {
          primary: "bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg",
          secondary: "bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-lg",
          outline: "border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg",
          link: "text-blue-600 dark:text-blue-400 hover:underline"
        };

        return (
          <div key={field.id} className="mb-4">
            <a
              href={field.linkUrl || "#"}
              target={field.openInNewTab ? "_blank" : "_self"}
              rel={field.openInNewTab ? "noopener noreferrer" : ""}
              className={`inline-block transition-colors ${buttonClasses[field.buttonStyle || "primary"]}`}
            >
              {field.linkText || "Click here"}
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upcoming Activities
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Register for our upcoming events and workshops
          </p>
        </motion.div>

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
              Add Activity
            </Button>
          </div>
        )}

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
            {optimisticActivities.map((activity, index) => (
              <Card key={activity.id} delay={index * 0.1}>
                <div className={`p-6 ${activity.isOptimistic ? "opacity-75" : ""}`}>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {activity.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Event: {new Date(activity.eventDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        Registered: {registrations[activity.id]?.length || 0}
                        {activity.maxParticipants && ` / ${activity.maxParticipants}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        canRegister(activity) 
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : !isRegistrationOpen(activity)
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}>
                        {!isRegistrationOpen(activity) 
                          ? "Registration Closed" 
                          : !canRegister(activity)
                          ? "Registration Full"
                          : "Registration Open"
                        }
                      </span>
                    </div>
                    {activity.isPaid && (
                      <div className="flex items-center">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          Fee: ₹{activity.fee}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!user && canRegister(activity) && (
                      <Button
                        size="sm"
                        onClick={() => openRegistrationForm(activity)}
                        className="w-full sm:w-auto"
                      >
                        Register
                      </Button>
                    )}
                    
                    {!user && !canRegister(activity) && isRegistrationOpen(activity) && (
                      <Button
                        size="sm"
                        disabled
                        className="w-full sm:w-auto"
                      >
                        Registration Full
                      </Button>
                    )}
                    
                    {!user && !isRegistrationOpen(activity) && (
                      <Button
                        size="sm"
                        disabled
                        className="w-full sm:w-auto"
                      >
                        Registration Closed
                      </Button>
                    )}
                    
                    {user && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                          disabled={activity.isOptimistic}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewRegistrations(activity)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportRegistrations(activity.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(activity.id)}
                          disabled={activity.isOptimistic}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {optimisticActivities.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming activities found.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Activity Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingActivity ? "Edit Activity" : "Add Activity"}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { id: "basic", label: "Basic Info" },
              { id: "form", label: "Registration Form" },
              { id: "payment", label: "Payment Settings" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {activeTab === "basic" && (
              <div className="space-y-6">
                <Input
                  label="Activity Title"
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
                    label="Registration Start"
                    type="datetime-local"
                    value={formData.registrationStart}
                    onChange={(e) => setFormData({...formData, registrationStart: e.target.value})}
                    required
                  />
                  <Input
                    label="Registration End"
                    type="datetime-local"
                    value={formData.registrationEnd}
                    onChange={(e) => setFormData({...formData, registrationEnd: e.target.value})}
                    required
                  />
                </div>

                <Input
                  label="Event Date"
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  required
                />

                <Input
                  label="Max Participants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            )}

            {activeTab === "form" && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Registration Form Builder
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Design your registration form by adding, editing, and arranging form fields. 
                    Students will fill out this form to register for your activity.
                  </p>
                </div>
                
                {/* Debug info */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl text-sm">
                  <p><strong>Debug Info:</strong></p>
                  <p>FormSchema length: {formData.formSchema?.length || 0}</p>
                  <p>FormSchema type: {typeof formData.formSchema}</p>
                  <p>FormSchema is array: {Array.isArray(formData.formSchema) ? 'Yes' : 'No'}</p>
                  <p>FormSchema content: {JSON.stringify(formData.formSchema, null, 2)}</p>
                </div>
                
                <div onClick={(e) => e.stopPropagation()}>
                  <FormBuilder
                    formSchema={formData.formSchema || getDefaultFormSchema()}
                    onChange={(schema) => {
                      console.log("FormBuilder onChange called with schema:", schema);
                      console.log("Current formData before update:", formData);
                      if (schema && Array.isArray(schema)) {
                        const updatedFormData = {...formData, formSchema: schema};
                        console.log("Updated formData:", updatedFormData);
                        setFormData(updatedFormData);
                      } else {
                        console.warn("FormBuilder onChange received invalid schema:", schema);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={formData.isPaid}
                    onChange={(e) => setFormData({...formData, isPaid: e.target.checked})}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <label htmlFor="isPaid" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    This is a paid event
                  </label>
                </div>

                {formData.isPaid && (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <Input
                      label="Registration Fee (₹)"
                      type="number"
                      value={formData.fee}
                      onChange={(e) => setFormData({...formData, fee: e.target.value})}
                      placeholder="Enter fee amount"
                      required
                    />
                    
                    <Input
                      label="Payment URL (UPI/QR Code Link)"
                      value={formData.paymentDetails.paymentUrl}
                      onChange={(e) => setFormData({
                        ...formData, 
                        paymentDetails: {...formData.paymentDetails, paymentUrl: e.target.value}
                      })}
                      placeholder="https://example.com/payment-qr or upi://pay?..."
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Payment Instructions
                      </label>
                      <textarea
                        value={formData.paymentDetails.instructions}
                        onChange={(e) => setFormData({
                          ...formData, 
                          paymentDetails: {...formData.paymentDetails, instructions: e.target.value}
                        })}
                        rows={3}
                        placeholder="Instructions for payment (e.g., scan QR code, enter UPI ID, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button type="submit" loading={submitting} className="flex-1">
                {editingActivity ? "Update" : "Create"} Activity
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  console.log("Manual test - Current formData:", formData);
                  console.log("Manual test - FormSchema:", formData.formSchema);
                  console.log("Manual test - User:", user);
                  
                  // Test with minimal data
                  const testData = {
                    title: "Test Activity",
                    description: "Test Description",
                    registrationStart: "2025-08-10T10:00",
                    registrationEnd: "2025-08-15T10:00",
                    eventDate: "2025-08-20T10:00",
                    maxParticipants: "10",
                    isPaid: false,
                    fee: "",
                    formSchema: getDefaultFormSchema(),
                    paymentDetails: {
                      paymentUrl: "",
                      instructions: ""
                    }
                  };
                  console.log("Test data:", testData);
                  setFormData(testData);
                }}
              >
                Debug Form
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Registration Form Modal */}
      <Modal
        isOpen={showRegistrationForm}
        onClose={() => setShowRegistrationForm(false)}
        title={`Register for ${selectedActivity?.title}`}
        size="lg"
      >
        <div className="space-y-6">
          {selectedActivity?.description && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                About this Activity
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedActivity.description}
              </p>
              <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                <p><strong>Event Date:</strong> {new Date(selectedActivity.eventDate).toLocaleDateString()}</p>
                <p><strong>Registration Deadline:</strong> {new Date(selectedActivity.registrationEnd).toLocaleDateString()}</p>
                {selectedActivity.maxParticipants && (
                  <p><strong>Max Participants:</strong> {selectedActivity.maxParticipants}</p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            {(selectedActivity?.formSchema || getDefaultFormSchema()).map((field) => {
              if (field.type === "label" || field.type === "image" || field.type === "link") {
                return renderContentField(field);
              }
              return renderFormField(field);
            })}

            {selectedActivity?.isPaid && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  Payment Required: ₹{selectedActivity.fee}
                </h4>
                
                {selectedActivity.paymentDetails?.paymentUrl && (
                  <div className="mb-3">
                    <a
                      href={selectedActivity.paymentDetails.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Payment Link
                    </a>
                  </div>
                )}
                
                {selectedActivity.paymentDetails?.instructions && (
                  <div className="mb-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">
                      <strong>Instructions:</strong>
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {selectedActivity.paymentDetails.instructions}
                    </p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                      Payment Screenshot *
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setRegistrationData({...registrationData, paymentProof: e.target.files[0]})}
                      required
                      className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                      UPI Transaction ID *
                    </label>
                    <input
                      type="text"
                      value={registrationData.upiTransactionId || ""}
                      onChange={(e) => setRegistrationData({...registrationData, upiTransactionId: e.target.value})}
                      placeholder="Enter UPI transaction ID"
                      required
                      className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" loading={submitting} className="flex-1">
                Submit Registration
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRegistrationForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* View Registrations Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Registrations for ${selectedActivity?.title}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Total Registrations: {registrations[selectedActivity?.id]?.length || 0}
            </p>
            <Button
              size="sm"
              onClick={() => exportRegistrations(selectedActivity?.id)}
            >
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {registrations[selectedActivity?.id]?.map((registration) => (
                  <tr key={registration.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{registration.name}</td>
                    <td className="px-4 py-2">{registration.email}</td>
                    <td className="px-4 py-2">{registration.phone}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        registration.status === "confirmed" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}>
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(registration.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
            Are you sure you want to delete this activity? This will also delete all registrations. This action cannot be undone.
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

export default UpcomingActivities;