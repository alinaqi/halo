import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Eye, MessageCircle, Calendar, Target, Plus } from 'lucide-react';
import { userDataService } from '../../services/userDataService';

interface MarketingDashboardProps {
  userName: string;
}

export const MarketingDashboard: React.FC<MarketingDashboardProps> = ({ userName }) => {
  const [campaigns, setCampaigns] = useState(userDataService.getCampaigns());
  const [contentIdeas, setContentIdeas] = useState(userDataService.getContentIdeas());
  const [weeklySchedule, setWeeklySchedule] = useState(userDataService.getWeeklySchedule());
  const [stats, setStats] = useState(userDataService.getUserData()?.stats || {
    totalReach: '0',
    engagementRate: '0%',
    newFollowers: '0',
    conversions: '0',
    activeCampaigns: 0
  });

  useEffect(() => {
    // Load data on component mount
    loadData();

    // Initialize with some content ideas if empty
    if (contentIdeas.length === 0) {
      const defaultIdeas = [
        'Create social media posts from latest blog article',
        'Analyze last month\'s campaign performance',
        'Generate weekly newsletter content',
        'Research trending topics in our industry'
      ];
      defaultIdeas.forEach(idea => userDataService.addContentIdea(idea));
      setContentIdeas(defaultIdeas);
    }

    // Initialize weekly schedule if empty
    if (weeklySchedule.length === 0) {
      const defaultSchedule = [
        { task: 'Content review', date: 'Monday', color: 'blue' },
        { task: 'Social media posting', date: 'Wednesday', color: 'purple' },
        { task: 'Analytics review', date: 'Friday', color: 'green' }
      ];
      defaultSchedule.forEach(item => userDataService.addScheduleItem(item));
      setWeeklySchedule(defaultSchedule);
    }
  }, []);

  const loadData = () => {
    const userData = userDataService.getUserData();
    if (userData) {
      setCampaigns(userData.campaigns);
      setContentIdeas(userData.contentIdeas);
      setWeeklySchedule(userData.weeklySchedule);
      setStats(userData.stats);
    }
  };

  const handleAddCampaign = () => {
    const campaignName = prompt('Enter campaign name:');
    if (campaignName) {
      const newCampaign = userDataService.addCampaign({
        name: campaignName,
        status: 'Planned',
        reach: '0',
        engagement: '0%',
        conversions: '0',
        color: ['blue', 'purple', 'green', 'orange'][Math.floor(Math.random() * 4)]
      });
      loadData();
    }
  };

  const handleAddContentIdea = () => {
    const idea = prompt('Enter content idea:');
    if (idea) {
      userDataService.addContentIdea(idea);
      loadData();
    }
  };

  const handleExecuteIdea = (idea: string) => {
    userDataService.removeContentIdea(idea);
    alert(`Starting work on: ${idea}`);
    loadData();
  };

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
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
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
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalReach}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Engagement Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.engagementRate}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">New Followers</p>
              <p className="text-2xl font-bold text-purple-600">+{stats.newFollowers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Conversions</p>
              <p className="text-2xl font-bold text-orange-600">{stats.conversions}</p>
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
              <button
                onClick={handleAddCampaign}
                className="flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No campaigns yet</p>
                <button
                  onClick={handleAddCampaign}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Create Your First Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          campaign.color === 'blue' ? 'bg-blue-500' :
                          campaign.color === 'green' ? 'bg-green-500' :
                          campaign.color === 'orange' ? 'bg-orange-500' :
                          'bg-purple-500'
                        }`} />
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{campaign.name}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                        campaign.status === 'Planned' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                        campaign.status === 'Paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
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
            )}
          </div>
        </div>

        {/* Content Ideas & Schedule */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                💡 Content Ideas
              </h2>
              <button
                onClick={handleAddContentIdea}
                className="text-pink-600 hover:text-pink-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {contentIdeas.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No content ideas yet</p>
            ) : (
              <div className="space-y-3">
                {contentIdeas.slice(0, 4).map((idea, index) => (
                  <button
                    key={index}
                    onClick={() => handleExecuteIdea(idea)}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">{idea}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              This Week
            </h2>
            {weeklySchedule.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No scheduled items</p>
            ) : (
              <div className="space-y-3">
                {weeklySchedule.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      item.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                      item.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
                      'bg-green-50 dark:bg-green-900/20'
                    }`}
                  >
                    <span className={`text-sm ${
                      item.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
                      item.color === 'purple' ? 'text-purple-700 dark:text-purple-300' :
                      'text-green-700 dark:text-green-300'
                    }`}>{item.task}</span>
                    <span className={`text-xs ${
                      item.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      item.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>{item.date}</span>
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