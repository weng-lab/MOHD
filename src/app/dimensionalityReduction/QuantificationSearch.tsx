"use client";

import { Autocomplete, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { FEATURE_KINDS, featureGroup, type FeatureKind, type FeatureOption } from "./features";

export type QuantificationSearchProps = {
  kind: Exclude<FeatureKind, "gene">;
  /** Every feature the ome quantifies, in the order to list them - see sortFeatures. */
  options: FeatureOption[];
  /** The feature coloring the plot when this mounts, if any. Read once - see below. */
  initial: string | null;
  onSelect: (name: string) => void;
};

/**
 * Picks the lipid, metabolite or metal the plot is colored by, from the full list the ome quantifies
 * - short enough to list, unlike RNA's genes, which are searched for instead.
 *
 * Applied on the click that chooses it, as the gene search is. Holds its own value rather than taking
 * it from the URL, and has no clear button, because a clearable Autocomplete reports "nothing chosen"
 * the moment its text is emptied - which is how a reader starts typing the next name, and would blank
 * the plot between the first keystroke and the choice. Remount it with a key to start it afresh.
 */
const QuantificationSearch = ({ kind, options, initial, onSelect }: QuantificationSearchProps) => {
  const { noun } = FEATURE_KINDS[kind];
  // Taken at mount and held. `initial` follows the URL, so it changes with every pick, and an
  // uncontrolled Autocomplete treats a default that moves after mount as a mistake.
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
