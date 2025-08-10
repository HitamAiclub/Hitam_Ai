import React, { useState } from "react";
import { uploadToCloudinary } from "../../utils/cloudinary";

const CloudinaryUpload = ({ onUpload, folder = "", buttonLabel = "Upload Image", showPreview = false }) => {
	const [file, setFile] = useState(null);
	const [preview, setPreview] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState("");

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		setFile(selectedFile);
		setPreview(selectedFile ? URL.createObjectURL(selectedFile) : null);
		setError("");
	};

	const handleUpload = async () => {
		if (!file) {
			setError("Please select a file to upload.");
			return;
		}
		setUploading(true);
		setError("");

		try {
			const uploadData = await uploadToCloudinary(file, folder);
			onUpload && onUpload(uploadData);
			setFile(null);
			setPreview(null);
		} catch (err) {
			setError("Upload error. Please try again.");
			console.error('Upload error:', err);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Select Image
				</label>
				<input 
					type="file" 
					accept="image/*" 
					onChange={handleFileChange}
					className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			
			{showPreview && preview && (
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Preview
					</label>
					<img 
						src={preview} 
						alt="Preview" 
						className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600" 
					/>
				</div>
			)}
			
			{error && (
				<div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
					<p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
				</div>
			)}
			
			<button 
				onClick={handleUpload} 
				disabled={uploading || !file}
				className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
			>
				{uploading ? "Uploading..." : buttonLabel}
			</button>
		</div>
	);
};

export default CloudinaryUpload;
