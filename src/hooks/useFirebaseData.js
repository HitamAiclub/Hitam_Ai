import { useState, useEffect } from "react";
import { database } from "../firebase/config";
import { ref, onValue, off } from "firebase/database";

export const useFirebaseData = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dataRef = ref(database, path);
    
    const unsubscribe = onValue(dataRef, 
      (snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          setData(snapshot.val());
        } else {
          setData(null);
        }
        setError(null);
      },
      (error) => {
        setLoading(false);
        setError(error);
        setData(null);
      }
    );

    return () => off(dataRef, "value", unsubscribe);
  }, [path]);

  return { data, loading, error };
};

export const useEvents = () => {
  return useFirebaseData("events");
};

export const useClubMembers = () => {
  return useFirebaseData("clubMembers");
};

export const useCommunityMembers = () => {
  return useFirebaseData("communityMembers");
};