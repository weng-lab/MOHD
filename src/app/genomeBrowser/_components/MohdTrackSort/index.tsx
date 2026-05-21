import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Box,
  Button,
  Divider,
  List,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import type { MohdRowInfo } from "@weng-lab/genomebrowser-ui";
import { useEffect, useMemo, useState } from "react";
import { useTrackStore } from "../../stores";
import { MOHD_FOLDER_ID } from "./constants";
import { resetMohdSortCriteria, loadMohdSortCriteria, saveMohdSortCriteria } from "./storage";
import { sortMohdTracks } from "./sorting";
import SortableCriterionItem from "./SortableCriterionItem";
import type { MohdSortCriterion } from "./types";

export default function MohdTrackSort({
  folders,
}: {
  folders: Array<{ id: string; rows?: MohdRowInfo[] }>;
}) {
  const tracks = useTrackStore((s) => s.tracks);
  const reorderTracks = useTrackStore((s) => s.reorderTracks);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [criteria, setCriteria] = useState<MohdSortCriterion[]>(() =>
    loadMohdSortCriteria(),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const mohdRowById = useMemo(() => {
    const mohdFolder = folders.find((folder) => folder.id === MOHD_FOLDER_ID);
    const rows = (mohdFolder?.rows ?? []) as MohdRowInfo[];

    return new Map(rows.map((row) => [row.id, row]));
  }, [folders]);

  useEffect(() => {
    saveMohdSortCriteria(criteria);
  }, [criteria]);

  const open = Boolean(anchorEl);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    setCriteria((currentCriteria) => {
      const oldIndex = currentCriteria.findIndex(
        (criterion) => criterion.key === active.id,
      );
      const newIndex = currentCriteria.findIndex(
        (criterion) => criterion.key === over.id,
      );

      if (oldIndex < 0 || newIndex < 0) {
        return currentCriteria;
      }

      return arrayMove(currentCriteria, oldIndex, newIndex);
    });
  };

  const toggleDirection = (key: MohdSortCriterion["key"]) => {
    setCriteria((currentCriteria) =>
      currentCriteria.map((criterion) =>
        criterion.key === key
          ? {
              ...criterion,
              direction: criterion.direction === "asc" ? "desc" : "asc",
            }
          : criterion,
      ),
    );
  };

  const applySort = () => {
    if (!reorderTracks) {
      return;
    }

    const nextTrackOrder = sortMohdTracks({
      tracks,
      criteria,
      rowById: mohdRowById,
    });

    if (!nextTrackOrder) {
      return;
    }

    reorderTracks(nextTrackOrder);
    setAnchorEl(null);
  };

  const resetSort = () => {
    setCriteria(resetMohdSortCriteria());
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<TuneIcon />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ minHeight: 44 }}
      >
        Sort Tracks
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: { xs: "calc(100vw - 32px)", sm: 420 },
              maxWidth: "100%",
            },
          },
        }}
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Track sort order
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag fields to set priority. Top fields are applied first.
            </Typography>
          </Box>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={criteria.map((criterion) => criterion.key)}
              strategy={verticalListSortingStrategy}
            >
              <List disablePadding>
                {criteria.map((criterion) => (
                  <SortableCriterionItem
                    key={criterion.key}
                    criterion={criterion}
                    onToggleDirection={toggleDirection}
                  />
                ))}
              </List>
            </SortableContext>
          </DndContext>

          <Divider />

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={resetSort}>
              Reset
            </Button>
            <Button size="small" variant="contained" onClick={applySort}>
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
