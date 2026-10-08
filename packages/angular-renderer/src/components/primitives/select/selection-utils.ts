export interface NormalizedOption {
  label: string;
  value: unknown;
  disabled?: boolean;
  group?: string;
}

export function resolveOption(
  item: unknown,
  labelKey?: string,
  valueKey?: string
): NormalizedOption {
  if (item === null || item === undefined) {
    return { label: '', value: '', disabled: false };
  }
  if (typeof item !== 'object') {
    return { label: String(item), value: item, disabled: false };
  }
  const obj = item as Record<string, unknown>;
  const label =
    labelKey && obj[labelKey] !== undefined
      ? String(obj[labelKey])
      : obj['label'] !== undefined
        ? String(obj['label'])
        : String(item);

  const value =
    valueKey && obj[valueKey] !== undefined
      ? obj[valueKey]
      : obj['value'] !== undefined
        ? obj['value']
        : item;

  return { label, value, disabled: !!obj['disabled'] };
}

export function normalizeOptions(
  items: unknown[] | null | undefined,
  labelKey?: string,
  valueKey?: string,
  groupLabelKey?: string,
  groupChildrenKey?: string
): NormalizedOption[] {
  if (!Array.isArray(items)) return [];
  const result: NormalizedOption[] = [];

  for (const item of items) {
    if (item === null || item === undefined) continue;

    if (typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      const children =
        (groupChildrenKey && obj[groupChildrenKey]) || obj['items'] || obj['children'];

      if (Array.isArray(children)) {
        const groupTitle =
          groupLabelKey && obj[groupLabelKey] !== undefined
            ? String(obj[groupLabelKey])
            : obj['label'] !== undefined
              ? String(obj['label'])
              : '';

        for (const child of children) {
          if (child === null || child === undefined) continue;
          const opt = resolveOption(child, labelKey, valueKey);
          opt.group = groupTitle;
          result.push(opt);
        }
        continue;
      }
    }

    result.push(resolveOption(item, labelKey, valueKey));
  }

  return result;
}

export function filterOptions(
  options: NormalizedOption[],
  query: string,
  matchMode: 'contains' | 'startsWith' | 'endsWith' = 'contains'
): NormalizedOption[] {
  if (!query || !query.trim()) return options;
  const q = query.toLowerCase().trim();
  return options.filter(opt => {
    const l = opt.label.toLowerCase();
    if (matchMode === 'startsWith') return l.startsWith(q);
    if (matchMode === 'endsWith') return l.endsWith(q);
    return l.includes(q);
  });
}
