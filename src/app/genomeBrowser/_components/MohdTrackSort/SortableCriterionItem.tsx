import { CSS } from "@dnd-kit/utilities";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SortIcon from "@mui/icons-material/Sort";
import {
  Button,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { SORT_FACET_LABELS } from "./constants";
import type { MohdSortCriterion } from "./types";

export default function SortableCriterionItem({
  criterion,
  onToggleDirection,
}: {
  criterion: MohdSortCriterion;
  onToggleDirection: (key: MohdSortCriterion["key"]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: criterion.key });

  return (
    <ListItem
      ref={setNodeRef}
      secondaryAction={
        <Button
          size="small"
          variant="outlined"
          startIcon={<SortIcon fontSize="small" />}
          onClick={() => onToggleDirection(criterion.key)}
          sx={{ minWidth: 92 }}
        >
          {criterion.direction === "asc" ? "Asc" : "Desc"}
        </Button>
      }
      sx={{
        gap: 1,
        border: "1px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        boxShadow: isDragging ? 3 : 0,
        mb: 1,
        opacity: isDragging ? 0.8 : 1,
        pr: 14,
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : "auto",
      }}
    >
      <ListItemIcon sx={{ minWidth: 34 }}>
        <IconButton
          size="small"
          edge="start"
          aria-label={`Drag ${SORT_FACET_LABELS[criterion.key]}`}
          {...attributes}
          {...listeners}
          sx={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
      </ListItemIcon>
      <ListItemText
        primary={SORT_FACET_LABELS[criterion.key]}
        primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
      />
    </ListItem>
  );
}
