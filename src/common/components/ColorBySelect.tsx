import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

type ColorBySelectProps = {
  colorScheme: "sex" | "status" | "site" | "protocol";
  handleColorSchemeChange: (event: SelectChangeEvent) => void;
};

export const ColorBySelect = ({ colorScheme, handleColorSchemeChange }: ColorBySelectProps) => (
  <FormControl sx={{ alignSelf: "flex-start" }}>
    <InputLabel>Color By</InputLabel>
    <Select
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={colorScheme}
      label="Color By"
      onChange={handleColorSchemeChange}
      MenuProps={{ disableScrollLock: true }}
      size="small"
    >
      <MenuItem value={"status"}>Status</MenuItem>
      <MenuItem value={"site"}>Site</MenuItem>
      <MenuItem value={"sex"}>Sex</MenuItem>
      <MenuItem value={"protocol"}>Protocol</MenuItem>
    </Select>
  </FormControl>
);
