import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, Button, Table, TableBody, TableCell, 
    TableRow, Select, MenuItem, FormControl, InputLabel, Paper
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material';

const CharAbilities: React.FC = () => {
    const navigate = useNavigate();

    const [generationType, setGenerationType] = useState<'standard' | 'pointBuy'>('standard');
    const [usedScores, setUsedScores] = useState<number[]>([]);
    const [availableScores, setAvailableScores] = useState<number[]>([15, 14, 13, 12, 10, 8]);
    const [availablePoints, setAvailablePoints] = useState<number>(27);


    const abilities = ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'];

    const calculatePointCost = (currentScore: number, desiredScore: number): number => {
        let totalCost = 0;

        for (let i = currentScore + 1; i <= desiredScore; i++) {
            if (i <= 13) {
                totalCost += 1;
            } else {
                totalCost += 2;
            }
        }

        return totalCost;
    };
    
    useEffect(() => {
        if (generationType === 'pointBuy') {
            setSelectedScores({
                STR: 8,
                CON: 8,
                DEX: 8,
                INT: 8,
                WIS: 8,
                CHA: 8
            });
            setAvailablePoints(27);
        } else {
            // Reset for standard array
            setSelectedScores({
                STR: 8,
                CON: 8,
                DEX: 8,
                INT: 8,
                WIS: 8,
                CHA: 8
            });
            setAvailableScores([15, 14, 13, 12, 10, 8]);
        }
    }, [generationType]);


    const resetPointBuy = () => {
        setSelectedScores({
            STR: 8,
            CON: 8,
            DEX: 8,
            INT: 8,
            WIS: 8,
            CHA: 8
        });
        setAvailablePoints(27);
    };
    

    const [selectedScores, setSelectedScores] = useState<Record<string, number>>({
        STR: 8,
        CON: 8,
        DEX: 8,
        INT: 8,
        WIS: 8,
        CHA: 8
    });

    const getOptionsForAbility = (type: 'standard' | 'pointBuy', currentAbility: string) => {
        const currentAbilityScore = selectedScores[currentAbility];
        if (type === 'standard') {
            const standardOptions = [15, 14, 13, 12, 10, 8];
            // Filter the options to exclude used scores, but always include the current ability's score
            return standardOptions.filter(score => score === currentAbilityScore || !usedScores.includes(score));
        } else if (type === 'pointBuy') {
            return [8, 9, 10, 11, 12, 13, 14, 15];
        }
        return [];
    };
    

    const handleScoreChange = (event: SelectChangeEvent<number>, ability: string) => {
        const newScore = event.target.value as number;
        const oldScore = selectedScores[ability];
    
        if (generationType === 'pointBuy') {
            const costDifference = calculatePointCost(8, newScore) - calculatePointCost(8, oldScore); 
            const newAvailablePoints = availablePoints - costDifference;
    
            if (newAvailablePoints >= 0) {
                setSelectedScores(prev => ({ ...prev, [ability]: newScore }));
                setAvailablePoints(newAvailablePoints);
            }
        } else {
            // For standard array, just update the score and manage used scores
            setSelectedScores(prev => ({ ...prev, [ability]: newScore }));
            if (usedScores.includes(oldScore)) {
                setUsedScores(prev => prev.filter(score => score !== oldScore));
            }
            if (!usedScores.includes(newScore)) {
                setUsedScores(prev => [...prev, newScore]);
            }
        }
    };
    

    const handleNext = () => {
        navigate('/character-equipment');
    };

    {generationType === 'pointBuy' && (
        <Typography variant="subtitle1">Available Points: {availablePoints}</Typography>
    )}

    const increaseScore = (ability: string) => {
        const currentScore = selectedScores[ability];
        if (currentScore < 15) {
            const pointCost = currentScore >= 13 ? 2 : 1;
            if (availablePoints - pointCost >= 0) {
                setSelectedScores(prev => ({ ...prev, [ability]: currentScore + 1 }));
                setAvailablePoints(prev => prev - pointCost);
            }
        }
    };
    
    const decreaseScore = (ability: string) => {
        const currentScore = selectedScores[ability];
        if (currentScore > 8) {
            const pointRefund = currentScore > 13 ? 2 : 1;
            setSelectedScores(prev => ({ ...prev, [ability]: currentScore - 1 }));
            setAvailablePoints(prev => prev + pointRefund);
        }
    };
    

    return (
        <Container>
            <Typography variant="h5">Choose Abilities</Typography>
            
            {/* Dropdown to choose the generation type */}
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel>Generation Type</InputLabel>
                    <Select 
                        value={generationType}
                        onChange={(event: SelectChangeEvent) => setGenerationType(event.target.value as 'standard' | 'pointBuy')}
                        label="Generation Type"
                    >
                        <MenuItem value="standard">Standard Array</MenuItem>
                        <MenuItem value="pointBuy">Point Buy</MenuItem>
                    </Select>
                </FormControl>
            </Box>
    
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: 2 }}>
                {generationType === 'pointBuy' && (
                    <>
                        <Typography variant="subtitle1" color={availablePoints < 0 ? 'error' : 'inherit'}>
                            Available Points: {availablePoints}
                        </Typography>
                        <Button variant="outlined" color="secondary" onClick={resetPointBuy}>
                            Reset
                        </Button>
                    </>
                )}
            </Box>
    
    
            {/* Ability Dropdowns */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',  // Change this to column for vertical layout
                alignItems: 'center',     // Center align the items
                gap: 2, 
                marginTop: '1rem' 
            }}>
                {generationType === 'standard' && abilities.map(ability => (
                    <FormControl key={ability} variant="outlined" sx={{ minWidth: 120, width: '30%' }}>
                        <InputLabel>{ability}</InputLabel>
                        <Select 
                            value={selectedScores[ability]}
                            onChange={(e) => handleScoreChange(e, ability)}
                            label={ability}
                        >
                            {getOptionsForAbility(generationType, ability).map(option => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                ))}
    
                    {generationType === 'pointBuy' && abilities.map(ability => (
                    <Box key={ability} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, width: '100%' }}>
                        <Typography variant="h6">{ability}</Typography>
                        <IconButton size="small" onClick={() => decreaseScore(ability)}>
                            <RemoveIcon />
                        </IconButton>
                        <Typography>{selectedScores[ability]}</Typography>
                        <IconButton size="small" onClick={() => increaseScore(ability)}>
                            <AddIcon />
                        </IconButton>
                    </Box>
                ))}
            </Box>
        
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <Button variant="contained" color="primary" onClick={handleNext}>
                    Next: Equipment
                </Button>
            </Box>
        </Container>
    
    );    
    
}

export default CharAbilities;
