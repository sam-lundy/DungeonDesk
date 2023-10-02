import { useParams } from 'react-router-dom';
import 'daisyui/dist/full.css';
import DiceRoller from './DiceRoller';
import Chat from '../social/Chat';


const GameSession = () => {
    const { campaignId } = useParams();
      
    return (
        <div className="p-4 h-screen bg-coolGray-200">
            <div className="grid grid-cols-3 gap-4">
                {/* Left: Player List & Character Stats */}
                <div className="col-span-1 p-4 bg-coolGray-300 rounded">
                    <h2 className="text-xl font-bold">Players</h2>
                    {/* Player list goes here */}
                    <h2 className="mt-4 text-xl font-bold">Character Stats</h2>
                    {/* Character stats go here */}
                </div>

                {/* Center: Chat Window & Dice Roller */}
                <div className="col-span-2 p-4 bg-coolGray-300 rounded">
                    <h2 className="text-xl font-bold">Party Chat</h2>
                    <Chat /> {/* Embedding your Chat component here */}
                
                    <div className="mt-4">
                        <h2 className="text-xl font-bold">Dice Roller</h2>
                        <DiceRoller /> {/* Embedding your DiceRoller component here */}
                    </div>
                </div>

                {/* Right (overlay or separate section): Session Notes & Actions */}
                <div className="fixed right-0 top-0 p-4 bg-coolGray-300 rounded">
                    <h2 className="text-xl font-bold">Session Notes</h2>
                    {/* Session notes go here */}
                    <div className="mt-4">
                        <h2 className="text-xl font-bold">Actions</h2>
                        {/* Action buttons go here */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameSession;
