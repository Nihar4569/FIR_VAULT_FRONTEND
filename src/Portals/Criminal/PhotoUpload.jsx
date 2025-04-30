import React, { useState } from 'react';

const PhotoUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      // Use a service to upload the file and get a URL
      const uploadedUrl = await fileUploadService.uploadImage(file);
      onUpload(uploadedUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-medium mb-2">Criminal Photo</label>
      <div className="flex items-center space-x-4">
        {previewUrl && (
          <div className="h-24 w-24 rounded-lg overflow-hidden">
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};