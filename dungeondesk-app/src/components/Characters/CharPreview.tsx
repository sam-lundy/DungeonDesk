import { Container, Typography, Button, List, ListItem } from '@mui/material';
import { useCharacterCreation } from './CharCreationContext';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

type EquipmentMapping = { [name: string]: number };


const CharPreview: React.FC = () => {
    const { characterData } = useCharacterCreation();
    const navigate = useNavigate();


    const fetchEquipmentIds = async (equipmentNames: string[]): Promise<EquipmentMapping> => {
        const url = "http://localhost:5000/api/get-equip";
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ names: equipmentNames }), 
        });
        console.log("Sending to /get-equip:", JSON.stringify({ names: equipmentNames }));
        const data: EquipmentMapping = await response.json();
        console.log("Received from /get-equip:", data);
        return data;
    };


    const handleSave = async () => {
        const auth = getAuth();
        const user = auth.currentUser;


        if (!user) throw new Error("User is not authenticated.");

        const url = "http://localhost:5000/api/save-character";
        
        const requestBody = {
            name: characterData.name,
            race_name: characterData.race,
            class_name: characterData.class,
            level: 1,
            strength: characterData.abilities[0],
            dexterity: characterData.abilities[1],
            constitution: characterData.abilities[2],
            intelligence: characterData.abilities[3],
            wisdom: characterData.abilities[4],
            charisma: characterData.abilities[5],
            user_uid: user.uid
        };


        try {   
            const idToken = await user.getIdToken(true);

            const equipmentIdsMapping: EquipmentMapping = await fetchEquipmentIds(characterData.equipment);

            console.log("Sending character data to backend:", JSON.stringify(requestBody));

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + idToken
                },
                body: JSON.stringify(requestBody),
            });
    

            const responseData = await response.json(); // Extract the response data
            
    
            if (response.ok) {
                console.log("Character saved successfully!");
    
                const characterId = responseData.characterId;

                if (!characterId) {
                throw new Error("Character ID is missing from the server response.");
                }


                if (characterData.profilePic) {
                    const avatarUploadUrl = "http://localhost:5000/api/character-avatar-upload";
                    
                    const formData = new FormData();
                    formData.append('file', characterData.profilePic);
                    
                    const avatarResponse = await fetch(avatarUploadUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + idToken,
                            'character_id': characterId  // Assuming backend expects character_id in headers
                        },
                        body: formData
                    });
            
                    if (!avatarResponse.ok) {
                        const avatarResponseData = await avatarResponse.json();
                        throw new Error("Failed to upload character avatar: " + avatarResponseData.message);
                    }
                }

                console.log("Character Equipment:", characterData.equipment);
                console.log("Equipment IDs Mapping:", equipmentIdsMapping);
                console.log("Character ID:", characterId);

                const equipmentData = characterData.equipment
                    .map(equipmentName => ({
                        character_id: characterId,
                        equipment_id: equipmentIdsMapping[equipmentName.toLowerCase()]
                    }))
                    .filter(item => item.equipment_id !== undefined);


                console.log("Sending equipment data:", JSON.stringify(equipmentData));

                const equipmentUrl = "http://localhost:5000/api/save-equipment";
                const equipmentResponse = await fetch(equipmentUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + idToken
                    },
                    body: JSON.stringify(equipmentData),
                });

                if (!equipmentResponse.ok) {
                    const equipmentResponseData = await equipmentResponse.json();
                    console.log("Response from /save-equipment:", equipmentResponseData);
                    throw new Error("Failed to save equipment: " + equipmentResponseData.message);
                }

                navigate('/dashboard');

            
            } else {
                console.error("Failed to save character:", responseData.message);
            }
    
        } catch (error) {
            if (error instanceof Error) {
                console.error("There was a problem with the fetch operation:", error.message);
            } else {
                console.error("There was an unknown problem:", error);
            }
        }
    };
    

    return (
        <Container>
            <Typography variant="h4">Review Your Character</Typography>
            <List>
                <ListItem>Name: {characterData.name}</ListItem>
                <ListItem>Race: {characterData.race}</ListItem>
                <ListItem>Class: {characterData.class}</ListItem>
                <ListItem>Abilities: {characterData.abilities.join(", ")}</ListItem>
                <ListItem>Equipment: {characterData.equipment.join(", ")}</ListItem>
            </List>
            <Button variant="contained" color="primary" onClick={handleSave}>
                Confirm & Save
            </Button>
        </Container>
    );
}

export default CharPreview;
