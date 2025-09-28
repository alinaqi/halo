import React from 'react';
import { TrendingUp, Users, Eye, MessageCircle, Calendar, Target } from 'lucide-react';

interface MarketingDashboardProps {
  userName: string;
}

export const MarketingDashboard: React.FC<MarketingDashboardProps> = ({ userName }) => {
  const campaigns = [
    {
      name: 'Q4 Product Launch',
      status: 'Active',
      reach: '45.2K',
      engagement: '4.2%',
      conversions: '342',
      color: 'blue'
    },
    {
      name: 'Holiday Campaign',
      status: 'Planned',
      reach: '0',
      engagement: '0%',
      conversions: '0',
      color: 'purple'
    },
    {
      name: 'User Onboarding',
      status: 'Completed',
      reach: '28.1K',
      engagement: '6.8%',
      conversions: '892',
      color: 'green'
    }
  ];

  const contentIdeas = [
    'Create social media posts from latest blog article',
    'Analyze last month\'s campaign performance',
    'Generate weekly newsletter content',
    'Research trending topics in our industry'
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Good morning, {userName}! 📈</h1>
            <p className="text-pink-100 text-lg">Let's grow your audience today</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">5</div>
            <div className="text-pink-200">Active Campaigns</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Reach</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">127K</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Engagement Rate</p>
              <p className="text-2xl font-bold text-green-600">5.4%</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">New Followers</p>
              <p className="text-2xl font-bold text-purple-600">+847</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Conversions</p>
              <p className="text-2xl font-bold text-orange-600">1,234</p>
            </div>
            <Target className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Campaign Performance
              </h2>
              <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {campaigns.map((campaign, index) => (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        campaign.color === 'blue' ? 'bg-blue-500' :
                        campaign.color === 'green' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`} />
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">{campaign.name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      campaign.status === 'Planned' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Reach</span>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{campaign.reach}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Engagement</span>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{campaign.engagement}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Conversions</span>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{campaign.conversions}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Ideas & Schedule */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              💡 Content Ideas
            </h2>
            <div className="space-y-3">
              {contentIdeas.map((idea, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">{idea}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              This Week
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <span className="text-sm text-blue-700 dark:text-blue-300">Blog post publish</span>
                <span className="text-xs text-blue-600 dark:text-blue-400">Today</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <span className="text-sm text-purple-700 dark:text-purple-300">Social media campaign</span>
                <span className="text-xs text-purple-600 dark:text-purple-400">Wednesday</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <span className="text-sm text-green-700 dark:text-green-300">Newsletter send</span>
                <span className="text-xs text-green-600 dark:text-green-400">Friday</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};