import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

type ColorBySelectProps = {
  colorScheme: "sex" | "status" | "site" | "protocol";
  handleColorSchemeChange: (event: SelectChangeEvent) => void;
  protocol: boolean;
};

export const ColorBySelect = ({ colorScheme, handleColorSchemeChange, protocol }: ColorBySelectProps) => (
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
      <MenuItem value={"site"}>Site</MenuItem>
      <MenuItem value={"status"}>Status</MenuItem>
      <MenuItem value={"sex"}>Sex</MenuItem>
      {protocol && (
        <MenuItem value={"protocol"}>Protocol</MenuItem>
      )}
    </Select>
  </FormControl>
);
