import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, { AutocompleteChangeDetails, AutocompleteChangeReason } from "@mui/material/Autocomplete";
import { capitalize, Chip } from "@mui/material";

export type MultiSelectOnChange<T> = (
  event: React.SyntheticEvent,
  value: T[],
  reason: AutocompleteChangeReason,
  details?: AutocompleteChangeDetails<T | T[]>
) => void;

export interface MultiSelectProps<T extends string | { label: string; [key: string]: unknown }> {
  onChange?: MultiSelectOnChange<T>;
  options: T[];
  /** Controlled selection. An unconstrained field passes every option. */
  value: T[];
  placeholder: string;
  limitTags?: number;
  size?: "small" | "medium";
  /**
   * Max width for chip labels when the component is not focused.
   * Chips expand to full width on focus. Set to `undefined` to disable truncation.
   * @default undefined
   */
  chipMaxWidth?: number;
}

function isLabeledObject(value: unknown): value is { label: string; [key: string]: unknown } {
  return value !== null && typeof value === "object" && "label" in value && typeof value.label === "string";
}

const MultiSelect = <T extends string | { label: string; [key: string]: unknown }>({
  onChange,
  options,
  placeholder,
  value,
  limitTags,
  size = "small",
  chipMaxWidth,
}: MultiSelectProps<T>) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <Autocomplete
      sx={{
        minWidth: "260px",
        maxWidth: "650px",
      }}
      multiple
      limitTags={limitTags}
      size={size}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      options={options}
      disableCloseOnSelect
      slotProps={{ popper: { sx: { zIndex: 1 } } }}
      renderInput={(params) => <TextField {...params} placeholder={placeholder} />}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {capitalize(isLabeledObject(option) ? option.label : option)}
          </li>
        );
      }}
      renderValue={(tagValue, getTagProps) =>
        tagValue.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              {...tagProps}
              // override maxWidth through style, selector specificity created through sx didn't beat className from tagProps
              style={!focused && chipMaxWidth != null ? { maxWidth: chipMaxWidth } : undefined}
              size="small"
              key={key}
              label={isLabeledObject(option) ? option.label : option}
            />
          );
        })
      }
    />
  );
};

export default MultiSelect;
