import { useState, useEffect } from "react";
import { Container, Typography, Modal, Box, Button } from "@mui/material";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { SelectChangeEvent } from "@mui/material";
import { gql, useLazyQuery } from "@apollo/client";

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
  Lightfoot: string;
  "Rock Gnome": string;
}

const CharRace: React.FC = () => {
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
      // Store the selected race, or do any other operations required
      setSelectedRace(values.selectedRace);

      // Navigate to the next step
      navigate("/character-create/class");
    },
  });


  const [getRaceDetails, { data, loading, error }] =
    useLazyQuery(GET_RACE_DETAILS);


  useEffect(() => {
    console.log("Fetched data:", data);
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
    }
  }, [data]);


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
    { race: "Tiefling" },
  ];

  
  const subraceToMainRaceMapping: SubraceToMainRaceMapping = {
    "Hill Dwarf": "Dwarf",
    "High Elf": "Elf",
    Lightfoot: "Halfling",
    "Rock Gnome": "Gnome",
  };

  const handleRaceChange = (event: SelectChangeEvent, raceName: string) => {
    const selectedValue = event.target.value as string;
    setSelectedRace((prev) => ({ ...prev, [raceName]: selectedValue }));
    setRaceDetails(null);
    getRaceDetails({ variables: { raceName: selectedValue } }); // Trigger the GraphQL query
    setShowModal(true);
  };

  const handleCancel = () => {
    setSelectedRace(null); // Reset the selected race
    setRaceDetails(null); // Reset the race details
    setShowModal(false);
  };

  const handleRaceButtonClick = (raceName: string) => {
    let queryRaceName = raceName; // Default to the selected race name

    if (subraceToMainRaceMapping[raceName as keyof SubraceToMainRaceMapping]) {
      queryRaceName =
        subraceToMainRaceMapping[raceName as keyof SubraceToMainRaceMapping];
    }

    setSelectedRace({ [raceName]: raceName });
    setRaceDetails(null);
    getRaceDetails({ variables: { raceName: queryRaceName } }); // Trigger the GraphQL query with the main race name if needed
    setShowModal(true);
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
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
            >
              {item.subrace || item.race}
            </Button>
          ))}
        </Box>
      </form>

      {showModal && (
        <Modal
          open={showModal}
          onClose={handleCancel}
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
              overflowY: "auto", // Allow vertical scrolling
              maxHeight: "70vh", // Set a maximum height
            }}
          >
            <Typography variant="h6">{raceDetails?.name}</Typography>

            <Typography variant="subtitle1">Traits:</Typography>
            {raceDetails?.traits.map((trait: Trait) => (
              <div key={trait.name}>
                <Typography variant="h6">{trait.name}</Typography>
                <Typography variant="body2">{trait.desc[0]}</Typography>
              </div>
            ))}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
              }}
            >
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={async (e) => {
                  e.preventDefault();
                  await formik.submitForm();
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
