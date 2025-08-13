import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { uploadFormFile , } from "../utils/cloudinary";
import { useAuth } from "../contexts/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import FormBuilder from "../components/FormBuilder/FormBuilder";
import { Calendar, Users, Plus, Edit, Trash2, Download, Eye, ExternalLink } from "lucide-react";

const UpcomingActivities = () => {
  console.log("🚀 UpcomingActivities component is loading...");
  
  // Add error handling for useAuth
  let user = null;
  try {
    const authResult = useAuth();
    user = authResult?.user;
    console.log("✅ useAuth hook successful, user:", user);
  } catch (authError) {
    console.error("❌ useAuth hook failed:", authError);
    user = null;
  }
  
  const [activities, setActivities] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [componentError, setComponentError] = useState(null);
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

  // Test Firebase connectivity and permissions
  const testFirebaseConnection = async () => {
    try {
      console.log("Testing Firebase connection...");
      console.log("User authentication status:", !!user);
      console.log("User details:", user);
      
      // Test basic read access
      const testRead = await getDocs(collection(db, "upcomingActivities"));
      console.log("✅ Read access to upcomingActivities: OK");
      
      // Test write access to allRegistrations (this is where registrations should be saved)
      const testWrite = await addDoc(collection(db, "allRegistrations"), {
        test: true,
        timestamp: new Date().toISOString(),
        message: "Testing write permissions"
      });
      console.log("✅ Write access to allRegistrations: OK", testWrite.id);
      
      // Clean up test document
      await deleteDoc(doc(db, "allRegistrations", testWrite.id));
      console.log("✅ Delete access to allRegistrations: OK");
      
      return true;
    } catch (error) {
      console.error("❌ Firebase connection test failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      return false;
    }
  };

  // Test function to verify form functionality
  const testFormFunctionality = async () => {
    try {
      console.log("=== TESTING FORM FUNCTIONALITY ===");
      
      // Test 1: Check form data structure
      console.log("1. Testing form data structure...");
      console.log("Current formData:", formData);
      console.log("FormSchema:", formData.formSchema);
      console.log("FormSchema is array:", Array.isArray(formData.formSchema));
      
      // Test 2: Check default schema
      console.log("2. Testing default schema...");
      const defaultSchema = getDefaultFormSchema();
      console.log("Default schema:", defaultSchema);
      console.log("Default schema length:", defaultSchema.length);
      console.log("Content elements in default:", defaultSchema.filter(f => ["label", "image", "link"].includes(f.type)));
      
      // Test 3: Check Firebase connection
      console.log("3. Testing Firebase connection...");
      const testResult = await testFirebaseConnection();
      console.log("Firebase test result:", testResult);
      
      // Test 4: Check form validation
      console.log("4. Testing form validation...");
      const testFormData = {
        title: "Test Activity",
        description: "Test Description",
        registrationStart: new Date().toISOString(),
        registrationEnd: new Date(Date.now() + 86400000).toISOString(),
        eventDate: new Date(Date.now() + 172800000).toISOString(),
        formSchema: defaultSchema
      };
      console.log("Test form data:", testFormData);
      
      // Test 5: Check maxParticipants handling
      console.log("5. Testing maxParticipants handling...");
      const testMaxParticipants = "50";
      const parsedMaxParticipants = testMaxParticipants && testMaxParticipants !== "" 
        ? parseInt(testMaxParticipants, 10) 
        : undefined;
      console.log("Original:", testMaxParticipants, "Parsed:", parsedMaxParticipants, "Type:", typeof parsedMaxParticipants);
      
      console.log("=== FORM FUNCTIONALITY TEST COMPLETE ===");
      return true;
    } catch (error) {
      console.error("Form functionality test failed:", error);
      return false;
    }
  };

  // Debug information display
  const DebugInfo = () => {
    if (!user) return null;
    
    const testRegistration = async () => {
      try {
        console.log("Testing basic registration...");
        const testData = {
          name: "Test User",
          email: "test@hitam.org",
          phone: "1234567890",
          rollNo: "TEST001",
          year: "1st Year",
          branch: "Computer Science Engineering",
          activityId: "test-activity",
          activityTitle: "Test Activity",
          submittedAt: new Date().toISOString(),
          status: "confirmed",
          test: true
        };
        
        console.log("Test data:", testData);
        
        // Try to save to allRegistrations first
        const result = await addDoc(collection(db, "allRegistrations"), testData);
        console.log("✅ Test registration saved successfully:", result.id);
        
        // Clean up test data
        await deleteDoc(doc(db, "allRegistrations", result.id));
        console.log("✅ Test registration cleaned up");
        
        alert("✅ Test registration successful! Firebase write permissions are working.");
      } catch (error) {
        console.error("❌ Test registration failed:", error);
        alert(`❌ Test registration failed: ${error.message}\n\nError code: ${error.code}`);
      }
    };
    
    return (
      <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
          🔧 Debug Information
        </h4>
        <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <p><strong>User ID:</strong> {user.uid}</p>
          <p><strong>User Email:</strong> {user.email}</p>
          <p><strong>Firebase Project:</strong> {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}</p>
          <p><strong>Cloudinary Cloud:</strong> {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'Not set'}</p>
          <p><strong>Activities Count:</strong> {activities.length}</p>
          <p><strong>Total Registrations:</strong> {Object.values(registrations).flat().length}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={testFirebaseConnection}
            className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
          >
            Test Connection
          </button>
          <button 
            onClick={testRegistration}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Test Registration
          </button>
          <button 
            onClick={testFormFunctionality}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
          >
            Test Form
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    console.log("🔄 useEffect triggered - starting initialization");
    const initializeComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔥 Testing Firebase connection...");
        // Test Firebase connection
        await testFirebaseConnection();
        console.log("✅ Firebase connection test completed");
        
    // Initialize formSchema with default schema
        try {
          console.log("📋 Getting default schema...");
          // Don't call getDefaultFormSchema here - it's not defined yet
          const defaultSchema = []; // Start with empty array
          console.log("📋 Default schema initialized as empty array");
          setFormData(prev => ({
            ...prev,
            formSchema: defaultSchema
          }));
          console.log("✅ Form schema initialized");
        } catch (schemaError) {
          console.error("❌ Error initializing default schema:", schemaError);
          setError("Failed to initialize form schema");
        }
        
        setLoading(false);
        console.log("✅ Component initialization completed successfully");
      } catch (error) {
        console.error("❌ Component initialization failed:", error);
        setError("Failed to initialize component");
        setLoading(false);
      }
    };
    
    console.log("🚀 Calling initializeComponent...");
    initializeComponent();
  }, []);

  // Set default form schema after component is fully mounted
  useEffect(() => {
    try {
      console.log("📋 Setting default form schema after mount...");
    const defaultSchema = getDefaultFormSchema();
      console.log("📋 Default schema set:", defaultSchema.length, "items");
    setFormData(prev => ({
      ...prev,
      formSchema: defaultSchema
    }));
    } catch (error) {
      console.error("❌ Error setting default schema:", error);
    }
  }, []);

  useEffect(() => {
    console.log("🔄 Second useEffect triggered - setting up Firebase listener");
    const unsubscribe = onSnapshot(
      collection(db, "upcomingActivities"), 
      async (snapshot) => {
        console.log("📊 Firebase snapshot received:", snapshot.docs.length, "documents");
        try {
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
          console.log("📋 Activities data processed:", activitiesData.length, "activities");
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
          console.log("✅ Firebase listener setup completed");
        } catch (error) {
          console.error("❌ Error processing activities data:", error);
          setError("Failed to load activities data");
          setLoading(false);
        }
      }, 
      (error) => {
        console.error("❌ Activities listener error:", error);
        setError("Failed to connect to database");
        setActivities([]);
        setOptimisticActivities([]);
        setLoading(false);
      }
    );

    return () => {
      console.log("🧹 Cleaning up Firebase listener");
      unsubscribe();
    };
  }, []);

  // Function to fetch registrations for a specific activity
  const fetchRegistrations = async (activityId) => {
    try {
      console.log(`Fetching registrations for activity: ${activityId}`);
      const registrationsSnapshot = await getDocs(collection(db, "upcomingActivities", activityId, "registrations"));
      const registrationsData = registrationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRegistrations(prev => ({
        ...prev,
        [activityId]: registrationsData
      }));
      
      console.log(`Fetched ${registrationsData.length} registrations for activity ${activityId}`);
    } catch (error) {
      console.error(`Error fetching registrations for activity ${activityId}:`, error);
      // Try to fetch from allRegistrations as fallback
      try {
        const allRegsSnapshot = await getDocs(collection(db, "allRegistrations"));
        const filteredRegs = allRegsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(reg => reg.activityId === activityId);
        
        setRegistrations(prev => ({
          ...prev,
          [activityId]: filteredRegs
        }));
        
        console.log(`Fetched ${filteredRegs.length} registrations from fallback collection for activity ${activityId}`);
      } catch (fallbackError) {
        console.error(`Fallback fetch also failed for activity ${activityId}:`, fallbackError);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("=== FORM SUBMISSION DEBUG ===");
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
        maxParticipants: formData.maxParticipants && formData.maxParticipants !== "" 
          ? parseInt(formData.maxParticipants, 10) 
          : undefined,
        formSchema: finalFormSchema
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
      console.log("=== REGISTRATION SUBMISSION DEBUG ===");
      console.log("Starting registration submission...");
      console.log("Selected activity:", selectedActivity);
      console.log("Registration data:", registrationData);
      console.log("Registration data keys:", Object.keys(registrationData));
      console.log("Payment proof type:", typeof registrationData.paymentProof);
      console.log("Payment proof instanceof File:", registrationData.paymentProof instanceof File);
      
      const formSchema = selectedActivity?.formSchema || getDefaultFormSchema();
      console.log("Form schema:", formSchema);
      console.log("Form schema length:", formSchema?.length);
      console.log("Content elements:", formSchema?.filter(f => ["label", "image", "link"].includes(f.type)));
      
      const missingFields = [];
      
      formSchema.forEach(field => {
        if (field.required && field.type !== "label" && field.type !== "image" && field.type !== "link") {
          const value = registrationData[field.id];
          console.log(`Field ${field.id} (${field.label}):`, value, "Required:", field.required);
          
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
        console.log("Missing required fields:", missingFields);
        alert(`Please fill in the following required fields: ${missingFields.join(", ")}`);
        setSubmitting(false);
        return;
      }

      // Additional validation for paid events
      if (selectedActivity?.isPaid) {
        if (!registrationData.paymentProof || !(registrationData.paymentProof instanceof File)) {
          alert("Payment proof is required for paid events. Please upload a screenshot or PDF of your payment.");
          setSubmitting(false);
          return;
        }
        if (!registrationData.upiTransactionId || registrationData.upiTransactionId.trim() === "") {
          alert("UPI Transaction ID is required for paid events. Please enter your transaction ID.");
          setSubmitting(false);
          return;
        }
      }

      console.log("All required fields are filled, processing data...");
      const processedData = { ...registrationData };
      
      // Process file uploads from form schema
      for (const field of formSchema) {
        if (field.type === "file" && registrationData[field.id]) {
          try {
            console.log(`Processing file upload for field: ${field.id}`);
            const file = registrationData[field.id];
            if (file instanceof File) {
              // Upload to Cloudinary in form_register folder with activity title
              console.log("Uploading file to Cloudinary:", file.name);
              const uploadResult = await uploadFormFile(file, selectedActivity.title);
              console.log("File upload successful:", uploadResult);
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
            let errorMessage = `Failed to upload file for field "${field.label}". Please try again.`;
            if (error.message) {
              errorMessage += `\n\nError: ${error.message}`;
            }
            if (error.code) {
              errorMessage += `\n\nError Code: ${error.code}`;
            }
            alert(errorMessage);
            setSubmitting(false);
            return;
          }
        }
      }
      
      // Process payment proof file specifically (not part of form schema)
      if (registrationData.paymentProof && registrationData.paymentProof instanceof File) {
        try {
          console.log("Processing payment proof file upload");
          const file = registrationData.paymentProof;
          console.log("Uploading payment proof to Cloudinary:", file.name);
          const uploadResult = await uploadFormFile(file, selectedActivity.title);
          console.log("Payment proof upload successful:", uploadResult);
          processedData.paymentProof = {
            fileName: file.name,
            fileUrl: uploadResult.url,
            fileSize: file.size,
            fileType: file.type,
            cloudinaryPublicId: uploadResult.publicId,
            uploadedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error("Error uploading payment proof:", error);
          let errorMessage = "Failed to upload payment proof. Please try again.";
          if (error.message) {
            errorMessage += `\n\nError: ${error.message}`;
          }
          if (error.code) {
            errorMessage += `\n\nError Code: ${error.code}`;
          }
          alert(errorMessage);
          setSubmitting(false);
          return;
        }
      }

      // Clean the processed data to remove any remaining File objects or non-serializable data
      const cleanDataForFirebase = (data) => {
        const cleaned = {};
        Object.keys(data).forEach(key => {
          const value = data[key];
          if (value instanceof File) {
            console.warn(`Found File object in field ${key}, removing to prevent Firebase error`);
            return; // Skip File objects
          } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Recursively clean nested objects
            cleaned[key] = cleanDataForFirebase(value);
          } else if (Array.isArray(value)) {
            // Clean arrays
            cleaned[key] = value.map(item => 
              item instanceof File ? null : (item && typeof item === 'object' ? cleanDataForFirebase(item) : item)
            ).filter(item => item !== null);
          } else {
            // Keep primitive values
            cleaned[key] = value;
          }
        });
        return cleaned;
      };
      
      const finalProcessedData = cleanDataForFirebase(processedData);
      console.log("Final cleaned data for Firebase:", finalProcessedData);

      const registrationDoc = {
        ...finalProcessedData,
        activityId: selectedActivity.id,
        activityTitle: selectedActivity.title,
        submittedAt: new Date().toISOString(),
        status: selectedActivity.isPaid ? "pending_payment" : "confirmed",
        formVersion: selectedActivity.updatedAt || selectedActivity.createdAt
      };

      console.log("Registration document to save:", registrationDoc);
      console.log("Attempting to save to Firebase...");

      // Try to save to both locations for redundancy
      try {
        console.log("Saving to upcomingActivities subcollection...");
        const subcollectionRef = await addDoc(
          collection(db, "upcomingActivities", selectedActivity.id, "registrations"), 
          registrationDoc
        );
        console.log("Saved to subcollection with ID:", subcollectionRef.id);
      } catch (subcollectionError) {
        console.warn("Failed to save to subcollection:", subcollectionError);
        console.log("This might be due to permission issues, continuing with main collection...");
      }

      try {
        console.log("Saving to allRegistrations collection...");
        const mainCollectionRef = await addDoc(collection(db, "allRegistrations"), registrationDoc);
        console.log("Saved to main collection with ID:", mainCollectionRef.id);
      } catch (mainCollectionError) {
        console.error("Failed to save to main collection:", mainCollectionError);
        throw new Error(`Failed to save registration: ${mainCollectionError.message}`);
      }
      
      console.log("Registration saved successfully!");
      setShowRegistrationForm(false);
      setRegistrationData({});
      alert("Registration submitted successfully!");
      
      // Refresh the registrations data
      if (selectedActivity) {
        fetchRegistrations(selectedActivity.id);
      }
      
    } catch (error) {
      console.error("Error submitting registration:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = "Failed to submit registration. Please try again.";
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Please check if you're logged in or contact an administrator.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
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
    // Content Elements
    { 
      id: "welcome_label", 
      type: "label", 
      label: "Welcome Message",
      content: "Welcome to our event! Please fill out the registration form below.",
      contentType: "text",
      fontSize: "lg",
      textColor: "primary",
      fontWeight: "semibold",
      alignment: "center",
      italic: false,
      underline: false
    },
    
    // Basic Form Fields
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
    },
    
    // Closing Content Element
    { 
      id: "terms_label", 
      type: "label", 
      label: "Terms and Conditions",
      content: "By submitting this form, you agree to our terms and conditions. For questions, contact us at [admin@hitam.org](mailto:admin@hitam.org).",
      contentType: "markdown",
      fontSize: "sm",
      textColor: "muted",
      fontWeight: "normal",
      alignment: "left",
      italic: false,
      underline: false
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
        case "xs": return "text-xs";
        case "sm": return "text-sm";
        case "medium": return "text-base";
        case "lg": return "text-lg";
        case "xl": return "text-xl";
        case "2xl": return "text-2xl";
        case "3xl": return "text-3xl";
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

    const getTextColorClass = (color) => {
      switch (color) {
        case "primary": return "text-blue-600 dark:text-blue-400";
        case "secondary": return "text-gray-700 dark:text-gray-300";
        case "success": return "text-green-600 dark:text-green-400";
        case "warning": return "text-yellow-600 dark:text-yellow-400";
        case "danger": return "text-red-600 dark:text-red-400";
        case "muted": return "text-gray-500 dark:text-gray-400";
        default: return "text-gray-900 dark:text-white";
      }
    };

    const getImageSizeClass = (size) => {
      switch (size) {
        case "small": return "max-w-sm h-auto";
        case "medium": return "max-w-md h-auto";
        case "large": return "max-w-lg h-auto";
        case "full": return "max-w-full h-auto";
        default: return "max-w-full h-auto";
      }
    };

    const getBorderStyleClass = (style) => {
      switch (style) {
        case "rounded": return "rounded-md";
        case "rounded-lg": return "rounded-lg";
        case "rounded-full": return "rounded-full";
        case "square": return "rounded-none";
        default: return "rounded-md";
      }
    };

    const getShadowClass = (shadow) => {
      switch (shadow) {
        case "sm": return "shadow-sm";
        case "md": return "shadow-md";
        case "lg": return "shadow-lg";
        case "xl": return "shadow-xl";
        default: return "shadow-none";
      }
    };

    const getButtonStyleClass = (style) => {
      switch (style) {
        case "primary": return "bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg";
        case "secondary": return "bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-lg";
        case "outline": return "border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg";
        case "link": return "text-blue-600 dark:text-blue-400 hover:underline";
        case "ghost": return "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-lg";
        case "danger": return "bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg";
        case "success": return "bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-lg";
        default: return "bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-lg";
      }
    };

    const getButtonSizeClass = (size) => {
      switch (size) {
        case "xs": return "text-xs px-2 py-1";
        case "sm": return "text-sm px-3 py-1";
        case "md": return "text-base px-4 py-2";
        case "lg": return "text-lg px-5 py-2";
        case "xl": return "text-xl px-6 py-3";
        default: return "text-base px-4 py-2";
      }
    };

    const getButtonWidthClass = (width) => {
      switch (width) {
        case "auto": return "";
        case "full": return "w-full";
        case "fit": return "w-fit";
        default: return "";
      }
    };

    const getIcon = (type) => {
      switch (type) {
        case "arrow": return "→";
        case "external": return "🔗";
        case "download": return "⬇️";
        case "play": return "▶️";
        case "plus": return "➕";
        case "check": return "✓";
        case "info": return "ℹ️";
        default: return "→";
      }
    };

    switch (field.type) {
      case "label":
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-4`}>
            <div 
              className={`${getFontSizeClass(field.fontSize)} ${getTextColorClass(field.textColor)} ${field.fontWeight === "bold" ? "font-bold" : field.fontWeight === "semibold" ? "font-semibold" : field.fontWeight === "medium" ? "font-medium" : ""} ${field.italic ? "italic" : ""} ${field.underline ? "underline" : ""}`}
              dangerouslySetInnerHTML={{ 
                __html: field.contentType === "markdown" ? renderMarkdownLinks(field.content || "") : field.content || "" 
              }}
            />
          </div>
        );

      case "image":
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-4`}>
            {field.imageUrl && (
              <div className="relative">
              <img 
                src={field.imageUrl} 
                alt={field.altText || "Form image"} 
                  className={`${getImageSizeClass(field.imageSize)} ${getBorderStyleClass(field.borderStyle)} ${getShadowClass(field.shadow)} border border-gray-300 dark:border-gray-600 ${field.clickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
                  onClick={() => {
                    if (field.clickable) {
                      const url = field.clickUrl || field.imageUrl;
                      if (url) window.open(url, '_blank');
                    }
                  }}
                />
                {field.clickable && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    🔗
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "link":
        return (
          <div key={field.id} className={`${getAlignmentClass(field.alignment)} mb-4`}>
            <a
              href={field.linkUrl || "#"}
              target={field.openInNewTab ? "_blank" : "_self"}
              rel={field.openInNewTab ? "noopener noreferrer" : ""}
              className={`inline-block transition-colors ${getButtonStyleClass(field.buttonStyle)} ${getButtonSizeClass(field.buttonSize)} ${getButtonWidthClass(field.buttonWidth)} ${field.showIcon ? "inline-flex items-center gap-2" : ""}`}
            >
              {field.showIcon && field.iconPosition === "left" && (
                <span className="text-sm">{getIcon(field.iconType)}</span>
              )}
              {field.linkText || "Click here"}
              {field.showIcon && field.iconPosition === "right" && (
                <span className="text-sm">{getIcon(field.iconType)}</span>
              )}
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Emergency Fallback UI - Should Always Show */}
      <div style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: 'red', 
        color: 'white', 
        padding: '20px', 
        zIndex: 9999,
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        🚨 UPCOMING ACTIVITIES COMPONENT IS RENDERING - IF YOU SEE THIS, COMPONENT IS WORKING
      </div>
      
      {/* Error Display */}
      {componentError && (
        <div style={{
          position: 'fixed',
          top: 80,
          left: 20,
          right: 20,
          background: 'darkred',
          color: 'white',
          padding: '20px',
          zIndex: 9997,
          fontSize: '16px'
        }}>
          <h3>🚨 Component Error:</h3>
          <p>{componentError.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'white',
              color: 'darkred',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Reload Page
          </button>
        </div>
      )}
      
      
      
      {/* Main Component */}
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
                
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>FormBuilder Debug:</strong> Schema length: {formData.formSchema?.length || 0}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Content Elements: {formData.formSchema?.filter(f => ["label", "image", "link"].includes(f.type)).length || 0}
                  </p>
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
    </>
  );
};

export default UpcomingActivities;