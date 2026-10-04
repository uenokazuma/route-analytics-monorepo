import React, { useState } from 'react';
import { CarFront, Plane, Search, Ship } from 'lucide-react';
import { nodeService, SpatialNode, TransportationMode } from '../services/nodeService';

interface AddressSearchProps {
  label: string;
  onLocationSelect: (id: number, lat: number, lon: number, name: string) => void;
  selectedMode: TransportationMode | null;
  onModeChange: (mode: TransportationMode) => void;
  showModeSelector?: boolean;
}

const modes: { value: TransportationMode; label: string; Icon: typeof CarFront }[] = [
  { value: 'road', label: 'Land', Icon: CarFront },
  { value: 'sea', label: 'Sea', Icon: Ship },
  { value: 'air', label: 'Air', Icon: Plane },
];

export default function AddressSearch({
  label,
  onLocationSelect,
  selectedMode,
  onModeChange,
  showModeSelector = false,
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SpatialNode[]>([]);

  const debouncedTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  const handleSearch = async (text: string, mode: TransportationMode | null = selectedMode) => {
    setQuery(text);
    if (!mode || text.length < 3) {
        if (debouncedTimeoutRef.current) {
            clearTimeout(debouncedTimeoutRef.current);
        }

        startTimeRef.current = null;
        setSuggestions([]);

        return;
    }

    if(startTimeRef.current === null) {
        startTimeRef.current = Date.now();
    }

    if (debouncedTimeoutRef.current) {
        clearTimeout(debouncedTimeoutRef.current);
    }

    debouncedTimeoutRef.current = setTimeout(() => {
        const now = Date.now();
        const timeElapsed = now - (startTimeRef.current || now);

        const fetchData = async () => {
            try {
                const response = await nodeService.searchNodes(text, mode);
                
                if (response.success && response.data) {
                    setSuggestions(response.data);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error('Error fetching address suggestions:', error);
                setSuggestions([]);
            } finally {
                startTimeRef.current = null;
            }
        }

        if(timeElapsed < 1000) {
            const remainingTime = 1000 - timeElapsed;
            debouncedTimeoutRef.current = setTimeout(fetchData, remainingTime);
        } else {
            fetchData();
        }
    }, 300);
  };

  return (
    <div className="relative mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {showModeSelector && (
        <div className="mb-2 grid grid-cols-3 rounded-md border border-gray-300 bg-gray-50 p-1" role="group" aria-label="Transportation mode">
          {modes.map(({ value, label: modeLabel, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setSuggestions([]);
                onModeChange(value);
                void handleSearch(query, value);
              }}
              aria-pressed={selectedMode === value}
              className={`flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition ${
                selectedMode === value
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {modeLabel}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={!selectedMode}
          placeholder={selectedMode ? 'Type an address...' : 'Select a mode first...'}
          className="w-full focus:outline-none text-sm text-gray-900 disabled:cursor-not-allowed disabled:bg-white disabled:text-gray-400"
        />
        <Search className="text-gray-400 h-4 w-4" aria-hidden="true" />
      </div>
      
      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                onLocationSelect(item.id, item.latitude, item.longitude, item.name);
                setQuery(item.name);
                setSuggestions([]);
              }}
              className="px-4 py-2 hover:bg-gray-100 text-xs text-gray-700 cursor-pointer truncate"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}