import * as React from "react";
import TextField from "@mui/material/TextField";
import Autocomplete, {
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
} from "@mui/material/Autocomplete";
import { capitalize, Chip } from "@mui/material";

export type MultiSelectOnChange<T> = (
  event: React.SyntheticEvent,
  value: T[],
  reason: AutocompleteChangeReason,
  details?: AutocompleteChangeDetails<T | T[]>,
) => void;

export interface MultiSelectProps<
  T extends string | { label: string; [key: string]: unknown },
> {
  onChange?: MultiSelectOnChange<T>;
  options: T[];
  value?: T[];
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

const MultiSelect = <
  T extends string | { label: string; [key: string]: unknown },
>({
  onChange,
  options,
  placeholder,
  value,
  limitTags,
  size = "small",
  chipMaxWidth,
}: MultiSelectProps<T>) => {
  const [internalValue, setInternalValue] = React.useState<T[]>(options);
  const [focused, setFocused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [lockedWidth, setLockedWidth] = React.useState<number | undefined>();
  //reset value when options changes
  React.useEffect(() => {
    setInternalValue(options);
  }, [options]);

  //sync internal value when external value changes
  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const handleChange: MultiSelectOnChange<T> = React.useCallback(
    (event, value, reason, details?) => {
      setInternalValue(value);
      if (onChange) {
        onChange(event, value, reason, details);
      }
    },
    [onChange],
  );

  function isLabeledObject(
    value: unknown,
  ): value is { label: string; [key: string]: unknown } {
    return (
      value !== null &&
      typeof value === "object" &&
      "label" in value &&
      typeof value.label === "string"
    );
  }

  const handleLockWidth = () => {
    if (containerRef.current) {
      setLockedWidth(containerRef.current.offsetWidth);
    }
  };

  return (
    <Autocomplete
      multiple
      limitTags={limitTags}
      size={size}
      value={internalValue}
      onChange={handleChange}
      ref={containerRef}
      onFocus={() => {
        handleLockWidth()
        setFocused(true);
      }}
      onBlur={() => {
        setFocused(false);
      }}
      options={options}
      disableCloseOnSelect
      slotProps={{ popper: { sx: { zIndex: 1 } } }}
      renderInput={(params) => (
        <TextField {...params} placeholder={placeholder} />
      )}
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
          const { key, onDelete, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              {...tagProps}
              onDelete={(e) => {
                handleLockWidth();
                onDelete(e);
              }}
              // override maxWidth through style, selector specificity created through sx didn't beat className from tagProps
              style={
                !focused && chipMaxWidth != null
                  ? { maxWidth: chipMaxWidth }
                  : undefined
              }
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
