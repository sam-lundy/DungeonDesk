import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Container, Typography, Box, Button, List, ListItemButton, ListItemText, Checkbox
} from '@mui/material';
import { gql, useQuery } from '@apollo/client';


const GET_STARTING_EQUIPMENT_OPTIONS = gql`
  query Starting_equipment_options($name: String!) {
    classes(name: $name) {
      starting_equipment_options {
        choose
        desc
      }
    }
  }
`;


type EquipmentOption = {
    choose: number;
    desc: string;
};


const CharEquip: React.FC = () => {
    const { className } = useParams<{ className: string }>();
    const { data, loading, error } = useQuery(GET_STARTING_EQUIPMENT_OPTIONS, {
      variables: { name: className }
    });

    const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

    useEffect(() => {
        if (!loading && data) {
            setEquipmentOptions(data.classes[0].starting_equipment_options);
        }
    }, [data]);

    const splitEquipmentChoices = (desc: string) => {
        const regex = /\([a-z]\) ([^\(]+)/g;
        const choices: string[] = [];
        let match;
        while ((match = regex.exec(desc)) !== null) {
            choices.push(match[1].trim());
        }
        return choices;
    };

    const handleEquipmentToggle = (value: string) => {
        const currentIndex = selectedEquipment.indexOf(value);
        const newSelectedEquipment = [...selectedEquipment];

        if (currentIndex === -1) {
            newSelectedEquipment.push(value);
        } else {
            newSelectedEquipment.splice(currentIndex, 1);
        }

        setSelectedEquipment(newSelectedEquipment);
    };

    const handleCreateCharacter = () => {
        const characterData = {
            equipment: selectedEquipment,
        };
        console.log("Created Character with Data:", characterData);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <Container>
            <Typography variant="h5">Choose Equipment</Typography>

            {equipmentOptions.map((option, index) => (
                <Box key={index} sx={{ margin: '1rem 0' }}>
                    <Typography variant="h6">Choose {option.choose} from:</Typography>
                    <List dense>
                        {splitEquipmentChoices(option.desc).map(item => (
                            <ListItemButton key={item} onClick={() => handleEquipmentToggle(item)}>
                                <Checkbox
                                    edge="start"
                                    checked={selectedEquipment.indexOf(item) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                />
                                <ListItemText primary={item} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            ))}

            <Box sx={{ marginTop: '2rem' }}>
                <Button variant="contained" color="primary" onClick={handleCreateCharacter}>
                    Create Character
                </Button>
            </Box>
        </Container>
    );
}

export default CharEquip;
