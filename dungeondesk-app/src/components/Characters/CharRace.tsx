import { useState, useEffect } from "react";
import { Container, Typography, Modal, Box, Button } from "@mui/material";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { gql, useLazyQuery } from "@apollo/client";
import { useCharacterCreation } from "../../contexts/CharCreationContext"


interface Trait {
  name: string;
  desc: string;
}


type Subrace = {
  name: string;
  racial_traits: Trait[];
};


interface SubraceToMainRaceMapping {
  "Hill Dwarf": string;
  "High Elf": string;
  "Lightfoot": string;
  "Rock Gnome": string;
}


const CharRace: React.FC = () => {
  const { characterData, setCharacterData } = useCharacterCreation();
  const [selectedRace, setSelectedRace] = useState<Record<
    string,
    string | null
  > | null>({});
  const [showModal, setShowModal] = useState(false);
  const [raceDetails, setRaceDetails] = useState<{
    name?: string;
    traits: Trait[];
  } | null>(null);
  const navigate = useNavigate();


  const GET_RACE_DETAILS = gql`
    query GetRaceDetails($raceName: String!) {
      races(name: $raceName) {
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


const formik = useFormik({
  initialValues: {
      selectedRace: selectedRace || {},
  },
    onSubmit: (values) => {
      const raceValue = Object.values(values.selectedRace)[0] || '';
      console.log("Setting race in context:", raceValue);
      setCharacterData((prevData) => ({
        ...prevData,
        race: raceValue
      }));
      navigate("/character-create/class");
    },
    
});


  const [getRaceDetails, { data, loading, error }] = useLazyQuery(GET_RACE_DETAILS);


  useEffect(() => {
    if (data && data.races && data.races.length > 0) {
      const raceData = data.races[0]; // Get the first (and only) race from the data

      let combinedTraits = raceData.traits; // Start with main race traits

      // If the selectedRace exists
      if (selectedRace) {
        // Extract the actual selected race name from the selectedRace object
        const actualSelectedRaceName = Object.values(selectedRace)[0];

        if (
          actualSelectedRaceName &&
          subraceToMainRaceMapping[
            actualSelectedRaceName as keyof SubraceToMainRaceMapping
          ]
        ) {
          const subraceDetails = raceData.subraces.find(
            (sub: Subrace) => sub.name === actualSelectedRaceName
          );
          if (subraceDetails && subraceDetails.racial_traits) {
            combinedTraits = [
              ...combinedTraits,
              ...subraceDetails.racial_traits,
            ];
          }
        }
      }
      setRaceDetails({ name: raceData.name, traits: combinedTraits });
      console.log("Processing GraphQL Data for:", data?.races[0]?.name);
    }
  }, [data]);


  if (loading) return <p>Loading...</p>;
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
    { race: "Tiefling" },
  ];


  const subraceToMainRaceMapping: SubraceToMainRaceMapping = {
    "Hill Dwarf": "Dwarf",
    "High Elf": "Elf",
    "Lightfoot": "Halfling",
    "Rock Gnome": "Gnome",
  };


  const handleCancel = () => {
    setRaceDetails(null);
    setShowModal(false);
  };


  const handleRaceButtonClick = (raceName: string) => {
    let queryRaceName = raceName;
  
    if (subraceToMainRaceMapping[raceName as keyof SubraceToMainRaceMapping]) {
      queryRaceName = subraceToMainRaceMapping[raceName as keyof SubraceToMainRaceMapping];
    }
  
  
    // Always refetch details and show the modal
    setSelectedRace({ [raceName]: raceName });
    formik.setFieldValue("selectedRace", { [raceName]: raceName });
    setRaceDetails(null);
    getRaceDetails({ variables: { raceName: queryRaceName } });
    setShowModal(true);
  };
  
  const handleModalClose = () => {
    setSelectedRace({});
    setRaceDetails(null);
    setShowModal(false);
  };
  
  

  return (
    <Container
      sx={{
        display: "flex",
        marginBottom: "100px",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        height: "100vh",
      }}
    >
      <Typography variant="h5" mb={2}>
        Choose Race
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {races.map((item) => (
            <Button
              key={item.race}
              variant="outlined"
              onClick={() => handleRaceButtonClick(item.subrace || item.race)}
              sx={{
                backgroundColor: '#0C0A26',
                color: 'white',
                '&:hover': {
                    backgroundColor: '#0C0A26',
                    opacity: 0.8
                }
            }}
            >
              {item.subrace || item.race}
            </Button>
          ))}
        </Box>
      </form>

      {showModal && (
        <Modal
          open={showModal}
          onClose={handleModalClose}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              width: "80vw",
              maxWidth: "400px",
              borderRadius: "8px",
              overflowY: "auto",
              maxHeight: "70vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem"
            }}
          >
            <Typography variant="h6" textAlign="center">{raceDetails?.name}</Typography>

            <Typography variant="subtitle1" textAlign="center">Traits:</Typography>
            {raceDetails?.traits.map((trait: Trait) => (
              <div key={trait.name}>
                <Typography variant="h6" textAlign="center">{trait.name}</Typography>
                <Typography variant="body2" textAlign="center">{trait.desc[0]}</Typography>
              </div>
            ))}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
                width: '100%', 
              }}
            >
              <Button 
                  variant="outlined" 
                  onClick={handleCancel}
                  sx={{
                    backgroundColor: '#0C0A26',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'red',
                        opacity: 0.8
                    }
                  }}
                  >
                  Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                type="submit" 
                onClick={formik.submitForm}
                sx={{
                  backgroundColor: '#0C0A26',
                  color: 'white',
                  '&:hover': {
                      backgroundColor: '#0C0A26',
                      opacity: 0.8
                  }
              }}
            >
                Choose Race
            </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Container>
  );
};

export default CharRace;
