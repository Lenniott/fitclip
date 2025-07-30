/**
 * @file SearchComponent.tsx
 * Search component with toggle between basic and semantic search.
 * Used in the exercise list page for finding exercises.
 */

import React, { useState, useCallback } from 'react';

interface SearchComponentProps {
  onBasicSearch: (query: string) => void;
  onSemanticSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function SearchComponent({
  onBasicSearch,
  onSemanticSearch,
  loading = false,
  placeholder = "Search exercises..."
}: SearchComponentProps) {
  const [query, setQuery] = useState('');
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      if (isSemanticSearch) {
        await onSemanticSearch(query);
      } else {
        await onBasicSearch(query);
      }
    } finally {
      setIsSearching(false);
    }
  }, [query, isSemanticSearch, onBasicSearch, onSemanticSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleToggle = () => {
    setIsSemanticSearch(!isSemanticSearch);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
      <div className="flex flex-col space-y-3">
        {/* Search Input */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              disabled={loading || isSearching}
            />
            {(loading || isSearching) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading || isSearching}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Search
          </button>
        </div>

        {/* Search Type Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Search Type:</span>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${!isSemanticSearch ? 'text-teal-600 font-medium' : 'text-slate-500'}`}>
                Basic
              </span>
              <button
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isSemanticSearch ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isSemanticSearch ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isSemanticSearch ? 'text-teal-600 font-medium' : 'text-slate-500'}`}>
                Semantic
              </span>
            </div>
          </div>

          {/* Search Type Description */}
          <div className="text-xs text-slate-500">
            {isSemanticSearch ? (
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI-powered search</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Text-based search</span>
              </span>
            )}
          </div>
        </div>

        {/* Search Tips */}
        <div className="text-xs text-slate-500 bg-slate-50 rounded p-2">
          <p className="font-medium mb-1">Search Tips:</p>
          {isSemanticSearch ? (
            <ul className="space-y-1">
              <li>• Use natural language: "5-minute standing routine"</li>
              <li>• Describe what you want: "gentle hip mobility exercises"</li>
              <li>• Be specific: "low intensity cardio for beginners"</li>
            </ul>
          ) : (
            <ul className="space-y-1">
              <li>• Search by exercise name: "push-ups", "squats"</li>
              <li>• Search by fitness level: "beginner", "advanced"</li>
              <li>• Search by intensity: "low", "medium", "high"</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 