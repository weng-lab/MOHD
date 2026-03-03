import { Box, Grid, Link, Typography } from "@mui/material";
import ContactForm from "./ContactUsForm";

export default function About() {
  return (
    <main>
      <Grid
        container
        spacing={3}
        sx={{ maxWidth: "min(70%, 1000px)", minWidth: "600px", marginX: "auto", marginY: "3rem" }}
      >
          {/* Contact Us */}
          <Grid id="contact-us" size={12}>
            <Typography variant="h5" fontWeight={600}>
              Contact Us
            </Typography>
            <Typography mb={1} variant="body1">
              Send us a message and we&apos;ll be in touch!
            </Typography>
            <Typography mb={1} variant="body1">
              As this is a beta site, we would greatly appreciate any feedback you may have. Knowing how our users are
              using the site and documenting issues they may have are important to make this resource better and easier
              to use.
            </Typography>
            <Box mb={1}>
              <Typography display={"inline"} variant="body1">
                If you&apos;re experiencing an error/bug, feel free to&nbsp;
              </Typography>
              <Link
                display={"inline"}
                href="https://github.com/weng-lab/MOHD/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                submit an issue on Github.
              </Link>
            </Box>
            <Box mb={2}>
              <Typography display={"inline"} variant="body1">
                If you would like to send an attachment, feel free to email us directly at&nbsp;
              </Typography>
              <Link
                display={"inline"}
                href="mailto:encode-screen@googlegroups.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                encode&#8209;screen@googlegroups.com
              </Link>
            </Box>
            <ContactForm />
          </Grid>
      </Grid>
    </main>
  );
}
