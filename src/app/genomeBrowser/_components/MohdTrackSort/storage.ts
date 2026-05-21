import {
  DEFAULT_MOHD_SORT_CRITERIA,
  MOHD_TRACK_SORT_SESSION_KEY,
  SORT_FACET_KEYS,
} from "./constants";
import type { MohdSortCriterion, MohdSortDirection } from "./types";

const SORT_FACET_KEY_SET = new Set<string>(SORT_FACET_KEYS);
const SORT_DIRECTION_SET = new Set<string>(["asc", "desc"]);

function copyDefaultCriteria() {
  return DEFAULT_MOHD_SORT_CRITERIA.map((criterion) => ({ ...criterion }));
}

function isDirection(value: unknown): value is MohdSortDirection {
  return typeof value === "string" && SORT_DIRECTION_SET.has(value);
}

function normalizeCriteria(value: unknown): MohdSortCriterion[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const seen = new Set<string>();
  const normalized: MohdSortCriterion[] = [];

  value.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const candidate = item as Partial<MohdSortCriterion>;

    if (
      typeof candidate.key !== "string" ||
      !SORT_FACET_KEY_SET.has(candidate.key) ||
      !isDirection(candidate.direction) ||
      seen.has(candidate.key)
    ) {
      return;
    }

    seen.add(candidate.key);
    normalized.push({
      key: candidate.key,
      direction: candidate.direction,
    });
  });

  const missingCriteria = DEFAULT_MOHD_SORT_CRITERIA.filter(
    (criterion) => !seen.has(criterion.key),
  );

  return [...normalized, ...missingCriteria.map((criterion) => ({ ...criterion }))];
}

export function loadMohdSortCriteria() {
  if (typeof window === "undefined") {
    return copyDefaultCriteria();
  }

  try {
    const storedValue = window.sessionStorage.getItem(
      MOHD_TRACK_SORT_SESSION_KEY,
    );

    if (!storedValue) {
      return copyDefaultCriteria();
    }

    const normalized = normalizeCriteria(JSON.parse(storedValue));
    return normalized ?? copyDefaultCriteria();
  } catch {
    return copyDefaultCriteria();
  }
}

export function saveMohdSortCriteria(criteria: MohdSortCriterion[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    MOHD_TRACK_SORT_SESSION_KEY,
    JSON.stringify(criteria),
  );
}

export function resetMohdSortCriteria() {
  const defaultCriteria = copyDefaultCriteria();
  saveMohdSortCriteria(defaultCriteria);
  return defaultCriteria;
}
