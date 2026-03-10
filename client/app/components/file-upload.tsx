'use client';

import * as React from "react";
import { CloudUpload } from "lucide-react";

const FileUploadComponent: React.FC = () => {

    const handleFileUploadButtonClick = () => {
        // Create a hidden file input element
        const inputFile = document.createElement("input");
        inputFile.type = "file";
        inputFile.accept = ".pdf"; // Accept only PDF files

        // Add an event listener to handle the file selection
        inputFile.addEventListener("change", async (event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const selectedFile = target.files[0];
                console.log("Selected file:", selectedFile);
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append("pdf", selectedFile);
                    await fetch('http://localhost:8000/upload/pdf', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log("Upload response:", data);
                    })
                    .catch(error => {
                        console.error("Error uploading file:", error);
                    }); 
                }
               
                
            }
        });

        // Trigger the click event on the hidden file input to open the file dialog
        inputFile.click();
    };

    return (
      <div className="bg-slate-900 text-white shadow-2xl flex justify-center item-center p-4 border-white border-2 rounded-lg">
        <div onClick={handleFileUploadButtonClick} className="flex justify-center items-center flex-col">
          <h3 className="text-white">Upload PDF File</h3>
          <CloudUpload />
        </div>
      </div>
    );
}

export default FileUploadComponent;
