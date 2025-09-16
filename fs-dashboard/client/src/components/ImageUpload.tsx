import React, { useState } from "react";
import "./ImageUpload.css";

interface UploadResponse {
  success: boolean;
  data?: {
    message: string;
    size_bytes: number;
  };
  message?: string;
  error?: string;
  details?: string;
}

const ImageUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Input, setBase64Input] = useState<string>(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const [result, setResult] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const SERVER_URL = "http://localhost:3000";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setResult({ message: "Please select a file", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setUploading(true);
      setResult({ message: "Uploading...", type: "info" });

      const response = await fetch(`${SERVER_URL}/images/upload`, {
        method: "POST",
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (response.ok && result.success) {
        setResult({
          message: `Success: ${result.data?.message} (${result.data?.size_bytes} bytes)`,
          type: "success",
        });
      } else {
        setResult({
          message: `Error: ${result.error || "Upload failed"}`,
          type: "error",
        });
      }
    } catch (error) {
      setResult({
        message: `Network Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadBase64 = async () => {
    if (!base64Input.trim()) {
      setResult({ message: "Please enter base64 image data", type: "error" });
      return;
    }

    try {
      setUploading(true);
      setResult({ message: "Uploading...", type: "info" });

      const response = await fetch(`${SERVER_URL}/images/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Input }),
      });

      const result: UploadResponse = await response.json();

      if (response.ok && result.success) {
        setResult({
          message: `Success: ${result.data?.message} (${result.data?.size_bytes} bytes)`,
          type: "success",
        });
      } else {
        setResult({
          message: `Error: ${result.error || "Upload failed"}`,
          type: "error",
        });
      }
    } catch (error) {
      setResult({
        message: `Network Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <h2>Image Upload for Face Detection</h2>

      <div className="upload-section">
        <h3>Upload Image File</h3>
        <div className="file-input-container">
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          {selectedFile && <span className="file-name">{selectedFile.name}</span>}
        </div>
        <button onClick={uploadFile} disabled={uploading || !selectedFile} className="upload-btn">
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      <div className="upload-section">
        <h3>Upload Base64 Image</h3>
        <textarea
          value={base64Input}
          onChange={(e) => setBase64Input(e.target.value)}
          placeholder="Paste base64 image data here..."
          rows={5}
          disabled={uploading}
          className="base64-input"
        />
        <button onClick={uploadBase64} disabled={uploading || !base64Input.trim()} className="upload-btn">
          {uploading ? "Uploading..." : "Upload Base64"}
        </button>
      </div>

      {result && <div className={`result ${result.type}`}>{result.message}</div>}
    </div>
  );
};

export default ImageUpload;
