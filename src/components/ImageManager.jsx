import React, { useState, useEffect } from "react";
import { uploadToCloudinary } from "../utils/cloudinary";

function ImageManager({ storagePath, folder = "hitam_ai" }) {
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // If storagePath is a URL, use it directly
    if (storagePath && storagePath.startsWith('http')) {
      setImageUrl(storagePath);
    } else {
      setImageUrl("");
    }
  }, [storagePath]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    
    try {
      const uploadResult = await uploadToCloudinary(file, folder);
      setImageUrl(uploadResult.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    // Note: Cloudinary deletion requires server-side implementation
    // For now, we'll just clear the local state
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
