import React, { useState, useEffect } from 'react';
import { Palette, Image, Folder, Layers, Eye, Download, Plus } from 'lucide-react';
import { userDataService } from '../../services/userDataService';

interface DesignerDashboardProps {
  userName: string;
}

export const DesignerDashboard: React.FC<DesignerDashboardProps> = ({ userName }) => {
  const [designs, setDesigns] = useState(userDataService.getDesigns());
  const [brandAssets, setBrandAssets] = useState(userDataService.getBrandAssets());
  const [stats, setStats] = useState(userDataService.getUserData()?.stats || {
    activeDesigns: 0,
    totalProjects: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const userData = userDataService.getUserData();
    if (userData) {
      setDesigns(userData.designs);
      setBrandAssets(userData.brandAssets);
      setStats(userData.stats);
    }
  };

  const handleAddDesign = () => {
    const designName = prompt('Enter design name:');
    if (designName) {
      const designType = prompt('Enter design type (e.g., Web Design, Mobile, Brand):') || 'Design';
      userDataService.addDesign({
        name: designName,
        type: designType,
        thumbnail: ['🏠', '📱', '🎨', '🖼️', '📐'][Math.floor(Math.random() * 5)]
      });
      loadData();
    }
  };

  const handleAddBrandAsset = () => {
    const assetName = prompt('Enter asset name:');
    if (assetName) {
      const assetType = prompt('Enter asset type (e.g., SVG, PNG, PDF):') || 'File';
      userDataService.addBrandAsset({
        name: assetName,
        type: assetType,
        size: `${Math.floor(Math.random() * 100)}KB`,
        color: ['blue', 'purple', 'pink', 'slate'][Math.floor(Math.random() * 4)]
      });
      loadData();
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Good morning, {userName}! 🎨</h1>
            <p className="text-purple-100 text-lg">Ready to create something beautiful?</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.activeDesigns || 0}</div>
            <div className="text-purple-200">Active Projects</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Design Library */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Design Library
              </h2>
              <button
                onClick={handleAddDesign}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Design
              </button>
            </div>

            {designs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No designs yet</p>
                <button
                  onClick={handleAddDesign}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Your First Design
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {designs.slice(0, 6).map((design) => (
                    <div
                      key={design.id}
                      className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-all hover:scale-105 cursor-pointer"
                    >
                      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-3xl">{design.thumbnail}</span>
                      </div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">{design.name}</h3>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>{design.type}</span>
                        <span>{getTimeAgo(design.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {designs.length > 6 && (
                  <button className="w-full py-2 text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View All {designs.length} Designs →
                  </button>
                )}
              </>
            )}

            {/* Brand Assets */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  <Layers className="w-4 h-4 mr-2" />
                  Brand Assets
                </h3>
                <button
                  onClick={handleAddBrandAsset}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {brandAssets.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No brand assets yet</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {brandAssets.slice(0, 8).map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg mb-2 ${
                        asset.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50' :
                        asset.color === 'slate' ? 'bg-slate-100 dark:bg-slate-900/50' :
                        asset.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50' :
                        'bg-pink-100 dark:bg-pink-900/50'
                      }`} />
                      <p className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate">{asset.name}</p>
                      <p className="text-xs text-slate-500">{asset.type} • {asset.size}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleAddDesign}
                className="w-full p-3 text-left bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Image className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Create New Design</span>
                </div>
              </button>

              <button className="w-full p-3 text-left bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <Folder className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Organize Assets</span>
                </div>
              </button>

              <button className="w-full p-3 text-left bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Design Review</span>
                </div>
              </button>

              <button className="w-full p-3 text-left bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Export Assets</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              💡 Design Tips
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Consider creating a consistent color palette across all your designs
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Use proper spacing ratios (8px grid system) for better visual hierarchy
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Keep your brand assets organized in folders by project
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Recent Activity
            </h2>
            {designs.length === 0 && brandAssets.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {designs.slice(0, 3).map((design) => (
                  <div key={design.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{design.name}</span>
                    <span className="text-xs text-slate-400">{getTimeAgo(design.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};