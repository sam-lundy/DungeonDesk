import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Modal } from '@mui/material'
import axios from 'axios';
import 'daisyui/dist/full.css';
import DiceRoller from './DiceRoller';
import Chat from '../social/Chat';

const GameSession = () => {
    const { campaignId } = useParams();
    const [characters, setCharacters] = useState<any[]>([]);
    const [files, setFiles] = useState<{ id: number, filename: string, uploaded_at: string, s3_url: string }[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);



    useEffect(() => {
        if (campaignId) {
            fetchCharacters(campaignId);
            fetchFiles(campaignId);
        }
    }, [campaignId]);


    const fetchCharacters = (campaignId: string) => {
        axios.get(`http://localhost:5000/api/campaigns/${campaignId}/characters`)
        .then(response => {
            setCharacters(response.data);
        })
        .catch(error => {
            console.error("Error fetching characters:", error);
        });
    };


    const fetchFiles = (campaignId: string) => {
        axios.get(`http://localhost:5000/api/campaigns/${campaignId}/files`)
        .then(response => {
            setFiles(response.data);
        })
        .catch(error => {
            console.error("Error fetching files:", error);
        });
    };


    const Modal = ({ content, onClose }) => {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded">
                    {content}
                    <button onClick={onClose} className="mt-4">Close</button>
                </div>
            </div>
        );
    }
    

    return (
        <div className="h-screen p-4 bg-coolGray-200 grid grid-cols-3 gap-4" style={{ gridTemplateColumns: "auto 1fr auto" }}>    
            {/* Left: Party and Files */}
            <div className="bg-coolGray-300 rounded p-4">
                <div>
                    <h2 className="text-xl font-bold">Party</h2>
                    <ul className="mt-2 space-y-2">
                        {characters.map(character => (
                            <li key={character.id} className="p-2 bg-coolGray-400 rounded">
                                {character.name} - Lvl {character.level}
                                <br />
                                <a href={`/character-sheet/${character.id}`} target="_blank" rel="noopener noreferrer">View Character Sheet</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="text-xl font-bold">Files</h2>
                    <ul className="mt-2 space-y-2">
                        {files.map(file => (
                            <li 
                                key={file.id} 
                                className="p-2 bg-coolGray-400 rounded cursor-pointer"
                                onClick={() => setSelectedFile(file.filename)}
                            >
                                {file.filename}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* Center: File Display and Dice Roller */}
            <div className="bg-coolGray-300 rounded p-4 flex flex-col">
                <div className="flex-grow bg-coolGray-400 rounded p-4">
                <div className="relative">
                {selectedFile ? (
                    <>
                        <div 
                            onClick={() => setIsZoomed(true)} 
                            className="cursor-pointer"
                        >
                            {/* Check if the file is an image based on its extension */}
                            {['.jpg', '.jpeg', '.png', '.gif'].some(ext => selectedFile.endsWith(ext)) ? (
                                <img src={selectedFile} alt="Selected content" className="max-w-full max-h-full" />
                            ) : (
                                <iframe src={selectedFile} title="Selected content" className="w-full h-full" />
                            )}
                        </div>
                        <button 
                            onClick={() => setSelectedFile(null)}
                            className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full"
                            aria-label="Close file"
                        >
                            X
                        </button>
                    </>
                ) : (
                    <div className="mt-4">
                        Select a file to display.
                    </div>
                )}
            </div>

                {isZoomed && (
                    <Modal 
                        content={<img src={selectedFile} alt="Selected content" className="max-w-screen-lg max-h-screen-lg" />}
                        onClose={() => setIsZoomed(false)}
                    />
                )}

                </div>
                <div className="mt-4">
                    <DiceRoller />
                </div>
            </div>
            {/* Right: Chat */}
            <div className="bg-coolGray-300 rounded p-4">
                <h2 className="text-xl font-bold">Party Chat</h2>
                <Chat />
            </div>
        </div>
    );
}

export default GameSession;
