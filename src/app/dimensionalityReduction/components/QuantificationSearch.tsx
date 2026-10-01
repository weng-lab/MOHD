"use client";

import { Autocomplete, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { FEATURE_KINDS, featureGroup, type FeatureKind, type FeatureOption } from "../model/features";

export type QuantificationSearchProps = {
  kind: Exclude<FeatureKind, "gene">;
  /** Every feature the ome quantifies, in the order to list them - see sortFeatures. */
  options: FeatureOption[];
  /** The feature coloring the plot when this mounts, if any. Read once - see below. */
  initial: string | null;
  onSelect: (name: string) => void;
};

/**
 * Picks the lipid, metabolite or metal the plot is colored by, applied as soon as it's chosen.
 * Uncontrolled and unclearable: a clearable Autocomplete reports "nothing chosen" as soon as its
 * text is emptied to type the next name, which would blank the plot. Remount it with a key to reset.
 */
const QuantificationSearch = ({ kind, options, initial, onSelect }: QuantificationSearchProps) => {
  const { noun } = FEATURE_KINDS[kind];
  // Held from mount: `initial` changes with every pick, and an uncontrolled default mustn't move.
  const [defaultValue] = useState(() => options.find(({ name }) => name === initial));
  return (
    <Autocomplete
      size="small"
      options={options}
      defaultValue={defaultValue}
      onChange={(_, option) => onSelect(option.name)}
      getOptionLabel={({ name }) => name}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      // Metabolites are few enough to read as one list; see featureGroup for the rest.
      groupBy={kind === "metabolite" ? undefined : (option) => featureGroup(kind, option) ?? ""}
      disableClearable
      autoHighlight
      renderOption={({ key, ...props }, option) => (
        <li key={key} {...props}>
          <Typography variant="body2" component="span">
            {option.name}
          </Typography>
          {option.detail && (
            <Typography variant="caption" component="span" color="text.secondary" ml={1}>
              {option.detail}
            </Typography>
          )}
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={noun.charAt(0).toUpperCase() + noun.slice(1)} />}
      slotProps={{ paper: { elevation: 3 } }}
    />
  );
};

export default QuantificationSearch;
