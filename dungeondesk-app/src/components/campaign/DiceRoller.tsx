import { FC, useState } from 'react';
import { useSystemMessage } from '../../contexts/SystemMessageContext';


const rollDice = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
}

  
const DiceRoller: FC = () => {
    const [result, setResult] = useState<number | null>(null);
    const { sendSystemMessage } = useSystemMessage();
    

    const handleRoll = (sides: number) => {
        const rollResult = rollDice(sides);
        setResult(rollResult);
        sendSystemMessage(`Rolled d${sides}: ${rollResult}`);
        // Add any animations or feedback here
    };

    return (
        <div className="p-4 space-y-4">
        <div className="flex space-x-2">
            <button onClick={() => handleRoll(4)} className="py-2 px-4 bg-blue-500 text-white rounded">D4</button>
            <button onClick={() => handleRoll(6)} className="py-2 px-4 bg-blue-500 text-white rounded">D6</button>
            <button onClick={() => handleRoll(8)} className="py-2 px-4 bg-blue-500 text-white rounded">D8</button>
            <button onClick={() => handleRoll(10)} className="py-2 px-4 bg-blue-500 text-white rounded">D10</button>
            <button onClick={() => handleRoll(12)} className="py-2 px-4 bg-blue-500 text-white rounded">D12</button>
            <button onClick={() => handleRoll(20)} className="py-2 px-4 bg-blue-500 text-white rounded">D20</button>
        </div>
        <div className="text-4xl font-bold">
            {result ? `You rolled: ${result}` : 'Roll a die!'}
        </div>
        </div>
    );
};

export default DiceRoller;
