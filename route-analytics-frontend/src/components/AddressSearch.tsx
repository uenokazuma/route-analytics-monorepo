import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface AddressSearchProps {
  label: string;
  onLocationSelect: (lat: number, lon: number, address: string) => void;
}

export default function AddressSearch({ label, onLocationSelect }: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const debouncedTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
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
                const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&limit=5&format=json`);
                const data = await res.json();
                setSuggestions(data);
            } catch (error) {
                console.error('Error fetching address suggestions:', error);
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
      <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type an address..."
          className="w-full focus:outline-none text-sm text-gray-900"
        />
        <Search className="text-gray-400 h-4 w-4" />
      </div>
      
      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              onClick={() => {
                onLocationSelect(parseFloat(item.lat), parseFloat(item.lon), item.display_name);
                setQuery(item.display_name);
                setSuggestions([]);
              }}
              className="px-4 py-2 hover:bg-gray-100 text-xs text-gray-700 cursor-pointer truncate"
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
