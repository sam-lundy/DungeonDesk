import { useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import 'daisyui/dist/full.css';
import DiceRoller from './DiceRoller';
import Chat from '../social/Chat';
import { useLayoutContext } from '../../contexts/LayoutContext';


const GameSession = () => {
    const { campaignId } = useParams();
    const [characters, setCharacters] = useState<any[]>([]);
    const [files, setFiles] = useState<{ id: number, filename: string, uploaded_at: string, s3_url: string }[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const { drawerOpen } = useLayoutContext();


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


    const Modal = ({ content, onClose }: { content: ReactNode, onClose: () => void }) => {
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
        <div className="h-screen p-4 bg-coolGray-200 flex">
            {/* Left-hand column: Party, Files, Chat, and Dice Roller */}
            <div className={`bg-coolGray-300 rounded p-4 flex flex-col w-64 space-y-4 fixed top-14 -left-5 h-screen ${drawerOpen ? 'ml-64' : 'ml-0'}`}>
                {/* Party */}
                <div>
                    <h2 className="text-xl font-bold">Party</h2>
                    <ul className="mt-2 space-y-2">
                        {characters.map(character => (
                            <li key={character.id} className="p-2 bg-coolGray-400 rounded">
                                {character.name} - Level {character.level}
                                <br />
                                <a href={`/character-sheet/${character.id}`} target="_blank" rel="noopener noreferrer">View Character Sheet</a>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Files */}
                <div>
                    <h2 className="text-xl font-bold">Files</h2>
                    <ul className="mt-2 space-y-2">
                        {files.map(file => {
                            const filenameOnly = file.filename.split('/').pop();
                            return (
                                <li 
                                    key={file.id} 
                                    className="p-2 bg-coolGray-400 rounded cursor-pointer break-words"
                                    onClick={() => setSelectedFile(file.filename)}
                                >
                                    {filenameOnly}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Chat */}
                <div className="flex-grow">
                    <h2 className="text-xl font-bold mt-8">Party Chat</h2>
                    <Chat />
                </div>
                {/* Dice Roller */}
                <div>
                    <DiceRoller />
                </div>
            </div>
    
            {/* Right-hand section: File Display */}
            <div className="bg-coolGray-300 rounded p-4 top-14 flex-grow ml-72 h-screen">
                {selectedFile ? (
                    <>
                        <div 
                            onClick={() => setIsZoomed(true)} 
                            className="cursor-pointer h-full"
                        >
                            {/* Check if the file is an image based on its extension */}
                            {['.jpg', '.jpeg', '.png', '.gif'].some(ext => selectedFile.endsWith(ext)) ? (
                                <img src={selectedFile} alt="Selected content" className="max-w-full max-h-full" />
                            ) : (
                                <iframe 
                                src={`${selectedFile}#view=Fit`} 
                                    title="Selected content" 
                                    className="max-w-full max-h-full items-stretch" 
                                    style={{ display: 'block', width: '800px', height: '90%' }} 
                                />
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
    
                {isZoomed && (
                    <Modal 
                        content={<img src={selectedFile || undefined} alt="Selected content" className="max-w-screen-lg max-h-screen-lg" />}
                        onClose={() => setIsZoomed(false)}
                    />
                )}
            </div>
        </div>
    );
};    


export default GameSession;
