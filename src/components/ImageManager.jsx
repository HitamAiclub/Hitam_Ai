import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";

function ImageManager({ storagePath }) {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storage = getStorage();
    const imageRef = ref(storage, storagePath);
    getDownloadURL(imageRef)
      .then((url) => setImageUrl(url))
      .catch(() => setImageUrl(""));
  }, [storagePath]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const storage = getStorage();
    const imageRef = ref(storage, storagePath);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    setImageUrl(url);
    setUploading(false);
  };

  const handleDelete = async () => {
    const storage = getStorage();
    const imageRef = ref(storage, storagePath);
    await deleteObject(imageRef);
    setImageUrl("");
  };

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div>
          <img src={imageUrl} alt="Uploaded" className="max-w-xs mb-2" />
          <button onClick={handleDelete} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
        </div>
      ) : (
        <div>No image uploaded.</div>
      )}
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
      {uploading && <div>Uploading...</div>}
    </div>
  );
}

export default ImageManager;
