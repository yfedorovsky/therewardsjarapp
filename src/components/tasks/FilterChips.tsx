import type { Kid } from '@/lib/types';

export type FilterValue = 'all' | 'household' | string; // string = kid id

interface FilterChipsProps {
  kids: Kid[];
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

export default function FilterChips({ kids, value, onChange }: FilterChipsProps) {
  const chips: { id: FilterValue; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'household', label: 'Household' },
    ...kids.map((k) => ({ id: k.id, label: k.name })),
  ];

  return (
    <div className="scroll-chips flex gap-2 overflow-x-auto px-5 pb-3">
      {chips.map((chip) => {
        const isSelected = value === chip.id;
        return (
          <button
            key={chip.id}
            onClick={() => onChange(chip.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ${
              isSelected
                ? 'bg-primary text-white'
                : 'border border-border bg-surface text-text'
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
