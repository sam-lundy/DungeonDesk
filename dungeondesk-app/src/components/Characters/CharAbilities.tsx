import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import {
    Container, Typography, Box, Button,
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCharacterCreation } from './CharCreationContext';
import { SelectChangeEvent } from '@mui/material';
import * as Yup from 'yup';


type Ability = 'STR' | 'CON' | 'DEX' | 'INT' | 'WIS' | 'CHA';


const calculatePointCost = (currentScore: number, desiredScore: number): number => {
    let totalCost = 0;
    for (let i = currentScore + 1; i <= desiredScore; i++) {
        totalCost += i <= 13 ? 1 : 2;
    }
    return totalCost;
};


const createValidationSchema = (availablePoints: number) => {
    return Yup.object().shape({
        selectedScores: Yup.object().test(
            'valid-score-assignment',
            'Invalid ability scores assignment.',
            function (selectedScores) {
                const { generationType } = this.parent;
                const sum = Object.values(selectedScores as { [key: string]: number }).reduce((acc: number, curr: number) => acc + curr, 0);

                if (generationType === 'standard') {
                    return sum === 72;
                } else if (generationType === 'pointBuy') {
                    return availablePoints === 0;
                }
                return false;
            }
        )
    });
};


const CharAbilities: React.FC = () => {
    const [availablePoints, setAvailablePoints] = useState<number>(27);
    const { characterData, setCharacterData } = useCharacterCreation();
    const navigate = useNavigate();
    console.log(characterData)

    const abilities: Ability[] = ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'];

    const formik = useFormik({
        initialValues: {
            generationType: 'standard',
            selectedScores: {
                STR: 8,
                CON: 8,
                DEX: 8,
                INT: 8,
                WIS: 8,
                CHA: 8
            }
        },
        validationSchema: createValidationSchema(availablePoints),
        onSubmit: () => {
            navigate('/character-create/equipment');
        }
    });
    

    const usedScores = Object.values(formik.values.selectedScores);

    useEffect(() => {
        // formik.resetForm();
        if (formik.values.generationType === 'pointBuy') {
            setAvailablePoints(27);
        }
    }, [formik.values.generationType]);



    
    const getOptionsForAbility = (type: 'standard' | 'pointBuy', currentAbility: Ability) => {
        const currentAbilityScore = formik.values.selectedScores[currentAbility];
        if (type === 'standard') {
            const standardOptions = [15, 14, 13, 12, 10, 8];
            return standardOptions.filter(score => !usedScores.includes(score) || score === currentAbilityScore);
        } else if (type === 'pointBuy') {
            return [8, 9, 10, 11, 12, 13, 14, 15];
        }
        return [];
    };

    const handleScoreChange = (event: SelectChangeEvent<number>, ability: Ability) => {
        const newScore = event.target.value as number;
        const oldScore = formik.values.selectedScores[ability];
    
        if (formik.values.generationType === 'pointBuy') {
            const costDifference = calculatePointCost(8, newScore) - calculatePointCost(8, oldScore);
            const newAvailablePoints = availablePoints - costDifference;
    
            if (newAvailablePoints >= 0) {
                formik.setFieldValue(`selectedScores.${ability}`, newScore);
                setAvailablePoints(newAvailablePoints);
            }
        } else {
            formik.setFieldValue(`selectedScores.${ability}`, newScore);
        }

        const abilitiesArray = Object.values(formik.values.selectedScores);
    
        // Update the characterData with the latest abilities from Formik
        setCharacterData(prevData => ({
            ...prevData,
            abilities: abilitiesArray
        }));
    };
    

    const increaseScore = (ability: Ability) => {
        const currentScore = formik.values.selectedScores[ability];
        if (currentScore < 15) {
            const pointCost = currentScore >= 13 ? 2 : 1;
            if (availablePoints - pointCost >= 0) {
                formik.setFieldValue(`selectedScores.${ability}`, currentScore + 1);
                setAvailablePoints(prev => prev - pointCost);
            }
            const abilitiesArray = Object.values(formik.values.selectedScores);

            setCharacterData(prevData => ({
                ...prevData,
                abilities: abilitiesArray
            }));
        }
    };

    const decreaseScore = (ability: Ability) => {
        const currentScore = formik.values.selectedScores[ability];
        if (currentScore > 8) {
            const pointRefund = currentScore > 13 ? 2 : 1;
            formik.setFieldValue(`selectedScores.${ability}`, currentScore - 1);
            setAvailablePoints(prev => prev + pointRefund);
        }
        const abilitiesArray = Object.values(formik.values.selectedScores);

        setCharacterData(prevData => ({
            ...prevData,
            abilities: abilitiesArray
        }));
    };

    const handleGenerationTypeChange = (event: SelectChangeEvent<string>) => {
        formik.setFieldValue("generationType", event.target.value);
        // Any other logic can go here
    };


    return (
        <Container>
            <Typography variant="h5">Choose Abilities</Typography>
            <form onSubmit={formik.handleSubmit}>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
                    
                    <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                        <InputLabel>Generation Type</InputLabel>
                        <Select 
                            name="generationType"
                            value={formik.values.generationType}
                            onChange={handleGenerationTypeChange}
                            label="Generation Type"
                        >
                            <MenuItem value="standard">Standard Array</MenuItem>
                            <MenuItem value="pointBuy">Point Buy</MenuItem>
                            <form key={formik.values.generationType} onSubmit={formik.handleSubmit}></form>
                        </Select>
                    </FormControl>
                </Box>


                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: 2 }}>
                    {formik.values.generationType === 'pointBuy' && (
                        <>
                            <Typography variant="subtitle1" color={availablePoints < 0 ? 'error' : 'inherit'}>
                                Available Points: {availablePoints}
                            </Typography>
                            <Button variant="outlined" color="secondary" onClick={() => formik.resetForm()}>
                                Reset
                            </Button>
                        </>
                    )}
                </Box>

                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',  
                    gap: 2, 
                    marginTop: '1rem' 
                }}>
                    
                    {abilities.map(ability => (
                        formik.values.generationType === 'standard' ?
                            <FormControl 
                                key={ability} 
                                variant="outlined" 
                                sx={{ 
                                    minWidth: 120, 
                                    width: '30%',
                                    ...(formik.errors.selectedScores && { '& .MuiOutlinedInput-root': { borderColor: 'red' } })  // Add this line
                                }}
                            >
                                <InputLabel>{ability}</InputLabel>
                                <Select 
                                    name={`selectedScores.${ability}`} 
                                    value={formik.values.selectedScores[ability]}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        handleScoreChange(e, ability);
                                    }}
                                    label={ability}
                                >
                                    {getOptionsForAbility(formik.values.generationType, ability).map(option => (
                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        :
                            <Box key={ability} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, width: '100%' }}>
                                <Typography variant="h6">{ability}</Typography>
                                <IconButton size="small" onClick={() => decreaseScore(ability)}>
                                    <RemoveIcon />
                                </IconButton>
                                <Typography>{formik.values.selectedScores[ability]}</Typography>
                                <IconButton size="small" onClick={() => increaseScore(ability)}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                    ))}
                </Box>

                {formik.errors.selectedScores && 
                    <div>{formik.errors.selectedScores as string}</div>
                }


        
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        sx={{
                            backgroundColor: '#0C0A26',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#0C0A26',
                                opacity: 0.8
                            }
                        }}
                        >
                        Next: Equipment
                    </Button>
                </Box>
            </form>
        </Container>
    ); 
    
}

export default CharAbilities;
