"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "All",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const displayText =
    selectedValues.length === 0
      ? placeholder
      : selectedValues.length === 1
      ? selectedValues[0]
      : `${selectedValues.length} selected`;

  return (
    <div className="relative flex flex-col space-y-1" ref={dropdownRef}>
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2 text-sm font-medium text-[#002244] transition-all hover:border-[#0085C3] hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0085C3]/20"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#0085C3]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1.5 max-h-60 w-full min-w-[200px] overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div
            onClick={() => onChange([])}
            className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span>Clear selection</span>
            {selectedValues.length === 0 && <Check className="h-3.5 w-3.5 text-[#0085C3]" />}
          </div>
          <div className="my-1 border-t border-gray-100" />
          {options.map((option) => {
            const isSelected = selectedValues.includes(option);
            return (
              <div
                key={option}
                onClick={() => handleToggleOption(option)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-blue-50/80 font-semibold text-[#002244]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#002244]"
                }`}
              >
                <span className="truncate pr-2">{option}</span>
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                    isSelected
                      ? "border-[#0085C3] bg-[#0085C3] text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}