import React, { useState, FC } from 'react';
import { Button, Box, Typography } from '@mui/material';
import axios from 'axios';


interface FileUploadProps {
    campaignId: number | null;
}


const FileUpload: FC<FileUploadProps> = ({ campaignId }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = () => {
        console.log("handleUpload called");
        if (!selectedFile) {
            setUploadMessage("No file selected");
            return;
        }
        if (!campaignId) {
            setUploadMessage("No campaign ID selected");
            return;
        }
        
        const formData = new FormData();
        formData.append('file', selectedFile);
    
        axios.post(`http://localhost:5000/api/campaigns/${campaignId}/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            console.log("File uploaded!", response.data);
            setUploadMessage("File uploaded successfully!");
        })
        .catch(error => {
            console.error("Error:", error);
            setUploadMessage("Error uploading file. Please try again.");
        });
    };    
    

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Upload Campaign Files
            </Typography>
            
            <input 
                type="file" 
                onChange={handleFileChange}
            />
            <Button 
                type="button"
                variant="contained" 
                color="primary" 
                onClick={handleUpload}
                style={{ marginTop: '1rem' }}
            >
                Upload
            </Button>
    
            {uploadMessage && <Typography variant="body1" style={{ marginTop: '1rem', color: uploadMessage.includes("Error") ? 'red' : 'green' }}>
                {uploadMessage}
            </Typography>}
        </Box>
    );
    
}

export default FileUpload;
