import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export const useFirebaseData = (collectionName) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, orderBy('createdAt', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setLoading(false);
        const documents = {};
        snapshot.forEach((doc) => {
          documents[doc.id] = { id: doc.id, ...doc.data() };
        });
        setData(documents);
        setError(null);
      },
      (error) => {
        setLoading(false);
        setError(error);
        setData(null);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading, error };
};

export const useEvents = () => {
  return useFirebaseData("events");
};

export const useClubMembers = () => {
  return useFirebaseData("committeeMembers");
};

export const useCommunityMembers = () => {
  return useFirebaseData("clubJoins");
};