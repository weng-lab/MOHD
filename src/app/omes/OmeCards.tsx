"use client";
import { Grid, Grow, Box, Stack, Typography, Button } from "@mui/material";
import Link from "next/link";
import { useGrowOnScroll } from "@/common/hooks/useGrowOnScroll";
import { OmesList } from "@/common/types/globalTypes";
import Image from "next/image";

const OmeCards = () => {
  const { visible: omesVisible, refs: omeRefs } = useGrowOnScroll(OmesList.length);

  return (
    <Grid container spacing={5} justifyContent="flex-start" marginTop={6} width={"100%"}>
      {OmesList.map((ome, index) => (
        <Grow
          in={omesVisible[index]}
          timeout={800 + index * 300}
          key={`${ome}-${index}`}
        >
          <Grid
            ref={(el) => {
              omeRefs.current[index] = el;
            }}
            data-index={index}
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Box
              component={Link}
              href={`/omes/${ome}/dimensionalityReduction`}
              scroll={true}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 3,
                backgroundColor: "primary.main",
                color: "white",
                height: 160,
                p: 1.5,
                boxShadow: 3,
                textDecoration: "none",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                transformOrigin: "center",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: 6,
                  zIndex: 2,
                },
              }}
            >
              <Stack height={"100%"} justifyContent={"space-between"}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    textTransform: "capitalize",
                  }}
                >
                  {ome}
                </Typography>
                <Button variant="contained" size="small" sx={{backgroundColor: "primary.light", color: "black", width: "fit-content"}}>
                  Explore
                </Button>
              </Stack>
              <Image 
                src={`/OmeIcons/${ome.toLowerCase()}.png`}
                alt={`${ome} icon`}
                width={100}
                height={100}
                style={{
                  position: "absolute",
                    right: 0,
                }}
              />
            </Box>
          </Grid>
        </Grow>
      ))}
    </Grid>
  );
};

export default OmeCards;
