import React, { useState } from 'react';
import { 
    Container, Typography, Select, MenuItem, 
    Modal, Box, Button, FormControl, InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material';
import { gql, useLazyQuery } from '@apollo/client';
import { useEffect } from 'react';


interface Trait {
    name: string;
    desc: string;
}

interface Subrace {
    name: string;
    racial_traits: Trait[];
}

interface Race {
    name: string;
    traits: Trait[];
    subraces: Subrace[];
}


const CharRace: React.FC = () => {
    const [selectedRace, setSelectedRace] = useState<Record<string, string | null> | null>({});
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [raceDetails, setRaceDetails] = useState<{ name?: string, traits: Trait[] } | null>(null);
    const navigate = useNavigate();


    const GET_RACE_DETAILS = gql`
    query GetRaceDetails($name: String) {
        races(name: $name) {
            name
            traits {
                name
                desc
            }
            subraces {
                name
                racial_traits {
                    name
                    desc
                }
            }
        }
    }
    `;

    const [getRaceDetails, { data, loading, error }] = useLazyQuery(GET_RACE_DETAILS);

    useEffect(() => {
        console.log('Fetched data:', data);
        if (data && data.races && selectedRace) {
            for (const [raceName, detailName] of Object.entries(selectedRace)) {
                if (!detailName) continue;
        
                let foundRace: Race | undefined = data.races.find((race: Race) => race.name === detailName);
                
                if (foundRace) {
                    console.log('Found main race:', foundRace);
                    setRaceDetails({ name: foundRace.name, traits: foundRace.traits });
                    break;
                } else {
                    console.log('Checking for subrace...');
                    for (let race of data.races) {
                        let foundSubrace: Subrace | undefined = race.subraces.find((subrace: Subrace) => subrace.name === detailName);
                        if (foundSubrace) {
                            setRaceDetails({ name: foundSubrace.name, traits: [...race.traits, ...foundSubrace.racial_traits] });
                            console.log('Setting race details:', raceDetails);
                            break;
                        }
                    }
                }
            }
        }        
    }, [data, selectedRace]);
    

    // Loading state
    if (loading) return <p>Loading...</p>;

    // Error state
    if (error) return <p>Error: {error.message}</p>;


    const races = [
        { race: "Dwarf", subrace: "Hill Dwarf" },
        { race: "Elf", subrace: "High Elf" },
        { race: "Halfling", subrace: "Lightfoot" },
        { race: "Human" },
        { race: "Dragonborn" },
        { race: "Gnome", subrace: "Rock Gnome" },
        { race: "Half-Elf" },
        { race: "Half-Orc" },
        { race: "Tiefling" }
    ];

    const handleDropdownOpen = (raceName: string) => {
        setActiveDropdown(raceName);
    };

    const handleDropdownClose = () => {
        setActiveDropdown(null);
    };

    const handleRaceChange = (event: SelectChangeEvent, raceName: string) => {
        const selectedValue = event.target.value as string;
    
        let queryName = selectedValue;
    
        // If a subrace is selected, query for the main race instead
        const raceItem = races.find(r => r.subrace === selectedValue);
        if (raceItem) {
            queryName = raceItem.race;
        }
    
        setSelectedRace(prev => ({ ...prev, [raceName]: selectedValue }));
        getRaceDetails({ variables: { name: queryName } });
        setShowModal(true);
    };
    

    const handleCancel = () => {
        setSelectedRace(null);  // Reset the selected race
        setShowModal(false);
    };

    const handleChooseRace = () => {
        setShowModal(false);
        navigate('/character-class');
    };

    return (
        <Container sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh' 
            }}
            >
            <Typography variant="h5" mb={2}>Choose Race</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {races.map(item => (
                <FormControl key={item.race} fullWidth variant="outlined" sx={{ width: '300px' }}>
                    <InputLabel id={`${item.race}-label`}>{item.race}</InputLabel>
                    <Select 
                        labelId={`${item.race}-label`}
                        label={item.race}
                        onChange={(e) => handleRaceChange(e, item.race)}
                        onOpen={() => handleDropdownOpen(item.race)}
                        onClose={handleDropdownClose}
                        open={activeDropdown === item.race}
                        value={selectedRace?.[item.race] || ''}

                    >
                        {item.subrace 
                            ? <MenuItem value={item.subrace}>{item.subrace}</MenuItem>
                            : <MenuItem value={item.race}>{item.race}</MenuItem>}
                    </Select>
                </FormControl>
            ))}
            </Box>

            {showModal && (
                <Modal 
                open={showModal} 
                onClose={handleCancel}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                >
                    <Box 
                        sx={{
                            bgcolor: 'background.paper', 
                            boxShadow: 24, 
                            p: 4, 
                            width: '80vw', 
                            maxWidth: '400px', 
                            borderRadius: '8px',
                            overflowY: 'auto',  // Allow vertical scrolling
                            maxHeight: '70vh'  // Set a maximum height
                        }}
                    >
                    <Typography variant="h6">{raceDetails?.name}</Typography>

                    <Typography variant="subtitle1">Traits:</Typography>
                    {raceDetails?.traits.map((trait: Trait) => (
                        <div key={trait.name}>
                            <Typography variant="h6">{trait.name}</Typography>
                            <Typography variant="body2">{trait.desc}</Typography>
                        </div>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={handleChooseRace}>Choose Race</Button>
                    </Box>
                </Box>
            </Modal>
            )}
        </Container>
    );
}

export default CharRace;
