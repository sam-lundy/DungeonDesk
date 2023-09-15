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
import { SelectChangeEvent } from '@mui/material';

type Ability = 'STR' | 'CON' | 'DEX' | 'INT' | 'WIS' | 'CHA';

const CharAbilities: React.FC = () => {
    const [availablePoints, setAvailablePoints] = useState<number>(27);
    const navigate = useNavigate();

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
        onSubmit: () => {
            navigate('/character-create/equipment');
        }
    });
    

    const usedScores = Object.values(formik.values.selectedScores);

    useEffect(() => {
        formik.resetForm();
        if (formik.values.generationType === 'pointBuy') {
            setAvailablePoints(27);
        }
    }, [formik.values.generationType]);

    const calculatePointCost = (currentScore: number, desiredScore: number): number => {
        let totalCost = 0;
        for (let i = currentScore + 1; i <= desiredScore; i++) {
            totalCost += i <= 13 ? 1 : 2;
        }
        return totalCost;
    };

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
    };

    const increaseScore = (ability: Ability) => {
        const currentScore = formik.values.selectedScores[ability];
        if (currentScore < 15) {
            const pointCost = currentScore >= 13 ? 2 : 1;
            if (availablePoints - pointCost >= 0) {
                formik.setFieldValue(`selectedScores.${ability}`, currentScore + 1);
                setAvailablePoints(prev => prev - pointCost);
            }
        }
    };

    const decreaseScore = (ability: Ability) => {
        const currentScore = formik.values.selectedScores[ability];
        if (currentScore > 8) {
            const pointRefund = currentScore > 13 ? 2 : 1;
            formik.setFieldValue(`selectedScores.${ability}`, currentScore - 1);
            setAvailablePoints(prev => prev + pointRefund);
        }
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
                            onChange={formik.handleChange}
                            label="Generation Type"
                        >
                            <MenuItem value="standard">Standard Array</MenuItem>
                            <MenuItem value="pointBuy">Point Buy</MenuItem>
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
                            <FormControl key={ability} variant="outlined" sx={{ minWidth: 120, width: '30%' }}>
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
        
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <Button type="submit" variant="contained" color="primary">
                        Next: Equipment
                    </Button>
                </Box>
            </form>
        </Container>
    ); 
    
}

export default CharAbilities;
