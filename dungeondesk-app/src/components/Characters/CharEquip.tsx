import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Container, Typography, Box, Button, List, ListItem, ListItemButton, ListItemText, Checkbox
} from '@mui/material';
import { useFormik } from 'formik';
import { gql, useQuery } from '@apollo/client';
import { CharacterCreationProvider } from './CharCreationContext';


const GET_STARTING_EQUIPMENT_OPTIONS = gql`
  query Starting_equipment_options($name: String!) {
    classes(name: $name) {
      starting_equipment_options {
        choose
        desc
      }
      starting_equipment {
        equipment {
          name
        }
      }
    }
  }
`;

type EquipmentOption = {
    choose: number;
    desc: string;
};

interface FormValues {
    selectedEquipment: string[];
}

const CharEquip: React.FC = () => {
    const { className } = useParams<{ className: string }>();
    const { data, loading, error } = useQuery(GET_STARTING_EQUIPMENT_OPTIONS, {
      variables: { name: className } // Make sure className contains a valid string
    });

    const [equipmentOptions, setEquipmentOptions] = useState<EquipmentOption[]>([]);

    const formik = useFormik({
        initialValues: {
            selectedEquipment: [] as string[]
        },
        onSubmit: (values) => {
            console.log(values.selectedEquipment);
            // You can proceed with further actions after selecting equipment here
        }
    });

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
       if (formik.values.selectedEquipment.includes(value)) {
           formik.setFieldValue('selectedEquipment', formik.values.selectedEquipment.filter(item => item !== value));
       } else {
           formik.setFieldValue('selectedEquipment', [...formik.values.selectedEquipment, value]);
       }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <Container>
            <Typography variant="h5">Choose Equipment</Typography>
            <form onSubmit={formik.handleSubmit}>
                {data && (
                    <>
                        <Typography variant="h6">Default Starting Equipment:</Typography>
                        <List>
                            {data.classes[0].starting_equipment.map((item: { equipment: { name: string } }, index: number) => (
                            <ListItem key={index}>
                                <ListItemText primary={item.equipment.name} />
                            </ListItem>
                            ))}
                        </List>

                        {data.classes[0].starting_equipment_options.map((option: EquipmentOption, index: number) => (
                            <Box key={index} sx={{ margin: '1rem 0' }}>
                                <Typography variant="h6">Choose {option.choose} from:</Typography>
                                <List dense>
                                    {splitEquipmentChoices(option.desc).map((item: string) => (
                                        <ListItemButton key={item} onClick={() => handleEquipmentToggle(item)}>
                                            <Checkbox
                                                edge="start"
                                                checked={formik.values.selectedEquipment.includes(item)}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                            <ListItemText primary={item} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Box>
                        ))}
                    </>
                )}
                <Box sx={{ marginTop: '2rem' }}>
                    <Button type="submit" variant="contained" color="primary">
                        Create Character
                    </Button>
                </Box>
            </form>
        </Container>
    );
}

export default CharEquip;
