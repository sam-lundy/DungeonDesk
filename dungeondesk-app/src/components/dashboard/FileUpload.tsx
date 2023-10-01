import { useState, FC } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';
import axios from 'axios';

interface FileUploadProps {
    campaignId?: number | null;
}

const FileUpload: FC<FileUploadProps> = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const { campaignId: campaignIdString } = useParams<{ campaignId: string }>();
    const campaignId = Number(campaignIdString);


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
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            m: '16px'
        }}>
            
            <input 
                type="file" 
                onChange={handleFileChange}
            />

            {selectedFile && 
                <Button 
                    type="button"
                    variant="contained" 
                    color="primary" 
                    onClick={handleUpload}
                    sx={{ alignSelf: 'center', mt: 2 }}
                >
                    Upload
                </Button>
            }
    
            {uploadMessage && 
                <Typography 
                    variant="body1" 
                    sx={{ mt: 2, color: uploadMessage.includes("Error") ? 'red' : 'green' }}
                >
                    {uploadMessage}
                </Typography>
            }
        </Box>
    );
    
}

export default FileUpload;
