import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { PC_OPTIONS, PcField, formatPcLabel } from "./pcAxis";

type PcAxisSelectProps = {
  label: string;
  value: PcField;
  onChange: (value: PcField) => void;
  disabledValue: PcField;
};

export const PcAxisSelect = ({ label, value, onChange, disabledValue }: PcAxisSelectProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as PcField);
  };

  return (
    <FormControl sx={{ alignSelf: "flex-start", minWidth: 100 }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={handleChange} MenuProps={{ disableScrollLock: true }} size="small">
        {PC_OPTIONS.map((pc) => (
          <MenuItem key={pc} value={pc} disabled={pc === disabledValue}>
            {formatPcLabel(pc)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
