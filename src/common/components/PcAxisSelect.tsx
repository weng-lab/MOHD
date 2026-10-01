import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { PC_OPTIONS, PcField, PcVarianceMap, formatPcLabel } from "./pcAxis";

type PcAxisSelectProps = {
  label: string;
  value: PcField;
  onChange: (value: PcField) => void;
  disabledValue: PcField;
  /** Each PC's percent of variance explained, listed in the menu. Bare PCs while it loads. */
  pve?: PcVarianceMap;
};

/** The menu lists each PC with its variance; the field shows the bare PC, as the axis label has the percentage. */
export const PcAxisSelect = ({ label, value, onChange, disabledValue, pve }: PcAxisSelectProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as PcField);
  };

  return (
    <FormControl sx={{ alignSelf: "flex-start", minWidth: 100 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={handleChange}
        MenuProps={{ disableScrollLock: true }}
        size="small"
        renderValue={(pc) => formatPcLabel(pc)}
        // White against a plot header's shading.
        sx={{ bgcolor: "background.paper" }}
      >
        {PC_OPTIONS.map((pc) => (
          <MenuItem key={pc} value={pc} disabled={pc === disabledValue}>
            {formatPcLabel(pc, pve)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
