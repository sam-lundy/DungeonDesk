import { FC, useState, useContext } from 'react';
import { getAuth } from 'firebase/auth';
import { UsernamesContext } from '../../contexts/UsernameContext';
import { useSystemMessage } from '../../contexts/SystemMessageContext';

const rollDice = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
}

const DiceRoller: FC = () => {
    const [result, setResult] = useState<number | null>(null);
    const { sendSystemMessage } = useSystemMessage();

    // Fetch the current username
    const contextValue = useContext(UsernamesContext);
    if (!contextValue) {
        throw new Error("DiceRoller component must be used within a UsernamesProvider");
    }
    const { usernames } = contextValue;
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;
    const currentUsername = currentUserId ? usernames[currentUserId] || 'Unknown User' : 'Unknown User';

    const handleRoll = (sides: number) => {
        const rollResult = rollDice(sides);
        setResult(rollResult);
        // Modify the system message to start with "System:"
        sendSystemMessage(`System: ${currentUsername} rolled a d${sides}: ${rollResult}`);
    };    

    return (
        <div className="p-4 space-y-2 mb-40">
            <div className="text-2xl font-bold text-center">
                {result ? `You rolled: ${result}` : 'Roll a die!'}
            </div>
            <div className="flex flex-col space-y-2">
                <div className="flex justify-center space-x-2">
                    <button onClick={() => handleRoll(4)} className="py-2 px-4 bg-blue-500 text-white rounded">D4</button>
                    <button onClick={() => handleRoll(6)} className="py-2 px-4 bg-blue-500 text-white rounded">D6</button>
                    <button onClick={() => handleRoll(8)} className="py-2 px-4 bg-blue-500 text-white rounded">D8</button>
                </div>
                <div className="flex justify-center space-x-2">
                    <button onClick={() => handleRoll(10)} className="py-2 px-4 bg-blue-500 text-white rounded">D10</button>
                    <button onClick={() => handleRoll(12)} className="py-2 px-4 bg-blue-500 text-white rounded">D12</button>
                    <button onClick={() => handleRoll(20)} className="py-2 px-4 bg-blue-500 text-white rounded">D20</button>
                </div>
            </div>
        </div>
    );
    
    
};

export default DiceRoller;
