import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

export const PC_OPTIONS = ["pc1", "pc2", "pc3", "pc4", "pc5", "pc6", "pc7", "pc8", "pc9", "pc10"] as const;
export type PcField = typeof PC_OPTIONS[number];

export const formatPcLabel = (field: PcField) => `PC-${field.slice(2)}`;

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
      <Select
        value={value}
        label={label}
        onChange={handleChange}
        MenuProps={{ disableScrollLock: true }}
        size="small"
      >
        {PC_OPTIONS.map((pc) => (
          <MenuItem key={pc} value={pc} disabled={pc === disabledValue}>
            {formatPcLabel(pc)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
