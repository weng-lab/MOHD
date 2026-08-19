import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

type ColorBySelectProps = {
  colorScheme: "sex" | "status" | "site" | "protocol" | "age";
  handleColorSchemeChange: (event: SelectChangeEvent) => void;
  protocol: boolean;
  age?: boolean;
};

export const ColorBySelect = ({ colorScheme, handleColorSchemeChange, protocol, age = false }: ColorBySelectProps) => (
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
      {age && (
        <MenuItem value={"age"}>Age</MenuItem>
      )}
    </Select>
  </FormControl>
);
