import React, { useState } from 'react';
import { Search, Globe, FileText, TrendingUp, ExternalLink, Loader } from 'lucide-react';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface ResearchProps {
  userRole: string;
}

export const Research: React.FC<ResearchProps> = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileAnalysis, setFileAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      if (window.electronAPI && window.electronAPI.webSearch) {
        const response = await window.electronAPI.webSearch({ query: searchQuery });
        if (response.success && response.results) {
          setSearchResults(response.results);
        } else {
          console.error('Search failed:', response.error);
        }
      } else {
        // Demo data
        setSearchResults([
          {
            title: 'Example Result 1',
            url: 'https://example.com/1',
            snippet: 'This is a demo search result for ' + searchQuery
          },
          {
            title: 'Example Result 2',
            url: 'https://example.com/2',
            snippet: 'Another demo result related to ' + searchQuery
          }
        ]);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const analyzeFile = async (filePath: string) => {
    setIsAnalyzing(true);
    setFileAnalysis('');
    setSelectedFile(filePath);

    try {
      if (window.electronAPI && window.electronAPI.analyzeFile) {
        const response = await window.electronAPI.analyzeFile({ filePath });
        if (response.success) {
          setFileAnalysis(response.analysis);
        } else {
          setFileAnalysis('Failed to analyze file: ' + response.error);
        }
      } else {
        // Demo analysis
        setFileAnalysis(`Demo Analysis of ${filePath}:\n\nThis file appears to be a code file with various functions and classes. It could benefit from better documentation and some refactoring of complex methods.`);
      }
    } catch (error) {
      setFileAnalysis('Error analyzing file: ' + error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickSearches = {
    pm: [
      'Project management best practices',
      'Agile methodology',
      'Team productivity tools',
      'Risk management strategies'
    ],
    designer: [
      'UI/UX design trends 2024',
      'Design system components',
      'Color theory for web',
      'Accessibility guidelines'
    ],
    marketing: [
      'Digital marketing strategies',
      'SEO optimization techniques',
      'Content marketing trends',
      'Social media analytics'
    ],
    developer: [
      'React best practices',
      'TypeScript patterns',
      'Performance optimization',
      'API design principles'
    ],
    other: [
      'Industry trends',
      'Competitor analysis',
      'Market research',
      'Business strategies'
    ]
  };

  const suggestions = quickSearches[userRole as keyof typeof quickSearches] || quickSearches.other;

  return (
    <div className="h-full flex">
      {/* Left Panel - Search */}
      <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Research & Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Search the web and analyze files for insights</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for information..."
              className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              {isSearching ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>

        {/* Quick Searches */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Searches</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(suggestion);
                  handleSearch();
                }}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {searchResults.map((result, index) => (
            <div key={index} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">{result.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{result.snippet}</p>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    {new URL(result.url).hostname}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Analytics */}
      <div className="w-1/2 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">File Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Select a file to analyze its content and get insights</p>
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <button
            onClick={async () => {
              if (window.electronAPI && window.electronAPI.openFilePicker) {
                const result = await window.electronAPI.openFilePicker({
                  filters: [
                    { name: 'All Files', extensions: ['*'] },
                    { name: 'Code Files', extensions: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp'] },
                    { name: 'Documents', extensions: ['md', 'txt', 'pdf', 'doc', 'docx'] }
                  ]
                });
                if (result.success && result.filePaths && result.filePaths[0]) {
                  analyzeFile(result.filePaths[0]);
                }
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Select File to Analyze
          </button>
        </div>

        {/* Analysis Result */}
        {(selectedFile || fileAnalysis) && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {selectedFile && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing:</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{selectedFile}</p>
              </div>
            )}
            {isAnalyzing ? (
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Analyzing file...</span>
              </div>
            ) : (
              fileAnalysis && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{fileAnalysis}</pre>
                </div>
              )
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Research Sessions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">This week</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Files Analyzed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">34</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};