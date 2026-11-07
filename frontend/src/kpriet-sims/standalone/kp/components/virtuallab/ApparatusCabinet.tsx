import React, { useState } from 'react';
import { Beaker, Info } from 'lucide-react';
import type { ApparatusItem } from '../../services/virtual-lab.service';

interface ApparatusCabinetProps {
  apparatus: ApparatusItem[];
  onSelectApparatus?: (item: ApparatusItem) => void;
  selectedApparatusId?: string;
}

export const ApparatusCabinet: React.FC<ApparatusCabinetProps> = ({
  apparatus,
  onSelectApparatus,
  selectedApparatusId,
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [activeInfoItem, setActiveInfoItem] = useState<ApparatusItem | null>(null);

  const categories = ['ALL', 'GLASSWARE', 'SUPPORT_EQUIPMENT', 'MEASURING_DEVICE'];

  const filteredItems = apparatus.filter((item) =>
    filter === 'ALL' ? true : item.category === filter
  );

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 dark:border-slate-800 dark:bg-[#0B1522] dark:text-slate-100 shadow-xs transition-colors">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Beaker className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Apparatus Cabinet</h3>
            <p className="text-[0.6875rem] text-slate-500 dark:text-slate-400">Standard NCERT Grade Glassware & Mounts</p>
          </div>
        </div>
        <span className="rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 px-2 py-0.5 text-[0.6875rem] font-semibold">
          {apparatus.length} Items
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[0.6875rem] font-semibold transition-all cursor-pointer ${
              filter === cat
                ? 'bg-cyan-50 text-cyan-800 border border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Apparatus List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {filteredItems.map((item) => {
          const isSelected = selectedApparatusId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectApparatus?.(item)}
              className={`group relative flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-50 text-slate-900 shadow-xs dark:border-cyan-500/60 dark:bg-cyan-500/10 dark:text-slate-100'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-slate-800 dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/50 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-100 text-cyan-800 dark:border-cyan-400/50 dark:bg-cyan-500/20 dark:text-cyan-300'
                      : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-300'
                  }`}
                >
                  <Beaker className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-white">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[0.6875rem] text-slate-500 dark:text-slate-400">
                    {item.capacityMl && <span>Cap: {item.capacityMl} mL</span>}
                    {item.precision && <span>Prec: ±{item.precision} mL</span>}
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.2 text-[0.6875rem] text-slate-600 dark:text-slate-400">
                      {item.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="View Specs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveInfoItem(item);
                  }}
                  className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Popover */}
      {activeInfoItem && (
        <div className="mt-3 rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900/90 p-3 text-xs text-slate-700 dark:text-slate-300 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-slate-900 dark:text-white text-xs">{activeInfoItem.name}</span>
            <button
              type="button"
              onClick={() => setActiveInfoItem(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-[0.6875rem] leading-relaxed text-slate-600 dark:text-slate-300 mb-2">
            {activeInfoItem.description || 'Precision laboratory glassware engineered to NCERT/CBSE standards.'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-[0.6875rem] text-slate-500 dark:text-slate-400">
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-300">Category:</span> {activeInfoItem.category}
            </div>
            {activeInfoItem.capacityMl && (
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Capacity:</span> {activeInfoItem.capacityMl} mL
              </div>
            )}
            {activeInfoItem.precision && (
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">Precision:</span> ±{activeInfoItem.precision} mL
              </div>
            )}
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-300">Graduated:</span> {activeInfoItem.graduated ? 'Yes (0.1 mL intervals)' : 'Fixed Volume'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
