import React, { useState } from 'react';

const CharacterMainSection: React.FC = () => {
    const [currentSection, setCurrentSection] = useState<string>('Actions');

    return (
        <div className="bg-indigo-100 p-4 rounded w-full">
            {/* Menu */}
            <div className="mb-4 flex space-x-4">
                {['Actions', 'Spells', 'Inventory', 'Features & Traits'].map(section => (
                    <button 
                        key={section}
                        className={`px-4 py-2 ${currentSection === section ? 'bg-indigo-500 text-white' : 'bg-indigo-300'}`}
                        onClick={() => setCurrentSection(section)}
                    >
                        {section}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4 border border-indigo-300 rounded">
                {currentSection === 'Actions' && <div>Actions Content</div>}
                {currentSection === 'Spells' && <div>Spells Content</div>}
                {currentSection === 'Inventory' && <div>Inventory Content</div>}
                {currentSection === 'Features & Traits' && <div>Features & Traits Content</div>}
            </div>
        </div>
    );
}

export default CharacterMainSection;
