// User Data Service for managing user-specific data across the application

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Planned' | 'Completed' | 'Paused';
  reach: string;
  engagement: string;
  conversions: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Design {
  id: string;
  name: string;
  type: string;
  thumbnail: string;
  updatedAt: Date;
  path?: string;
}

export interface BrandAsset {
  id: string;
  name: string;
  type: string;
  size: string;
  color: string;
  path?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email?: string;
  createdAt: Date;
  lastLogin: Date;
  onboardingCompleted: boolean;
  selectedModel?: string;
}

export interface UserStats {
  totalProjects: number;
  completedTasks: number;
  activeCampaigns: number;
  totalReach: string;
  engagementRate: string;
  newFollowers: string;
  conversions: string;
  activeDesigns: number;
}

export interface UserData {
  profile: UserProfile;
  stats: UserStats;
  campaigns: Campaign[];
  designs: Design[];
  brandAssets: BrandAsset[];
  contentIdeas: string[];
  weeklySchedule: Array<{
    task: string;
    date: string;
    color: string;
  }>;
}

class UserDataService {
  private storageKey = 'halo-user-data';

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const existingData = this.getUserData();
    if (!existingData) {
      const defaultData: UserData = {
        profile: {
          name: 'User',
          role: 'other',
          createdAt: new Date(),
          lastLogin: new Date(),
          onboardingCompleted: false
        },
        stats: {
          totalProjects: 0,
          completedTasks: 0,
          activeCampaigns: 0,
          totalReach: '0',
          engagementRate: '0%',
          newFollowers: '0',
          conversions: '0',
          activeDesigns: 0
        },
        campaigns: [],
        designs: [],
        brandAssets: [],
        contentIdeas: [],
        weeklySchedule: []
      };
      this.saveUserData(defaultData);
    }
  }

  // Get all user data
  getUserData(): UserData | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert date strings to Date objects
        if (data.profile) {
          data.profile.createdAt = new Date(data.profile.createdAt);
          data.profile.lastLogin = new Date(data.profile.lastLogin);
        }
        if (data.campaigns) {
          data.campaigns = data.campaigns.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt)
          }));
        }
        if (data.designs) {
          data.designs = data.designs.map((d: any) => ({
            ...d,
            updatedAt: new Date(d.updatedAt)
          }));
        }
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  }

  // Save user data
  saveUserData(data: UserData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  // Update user profile
  updateProfile(profile: Partial<UserProfile>) {
    const data = this.getUserData() || this.getDefaultData();
    data.profile = { ...data.profile, ...profile, lastLogin: new Date() };
    this.saveUserData(data);
    return data.profile;
  }

  // Get user profile
  getProfile(): UserProfile {
    const data = this.getUserData();
    return data?.profile || this.getDefaultData().profile;
  }

  // Mark onboarding as completed
  completeOnboarding(name: string, role: string) {
    const data = this.getUserData() || this.getDefaultData();
    data.profile.name = name;
    data.profile.role = role;
    data.profile.onboardingCompleted = true;
    data.profile.lastLogin = new Date();
    this.saveUserData(data);
    return data.profile;
  }

  // Update stats
  updateStats(stats: Partial<UserStats>) {
    const data = this.getUserData() || this.getDefaultData();
    data.stats = { ...data.stats, ...stats };
    this.saveUserData(data);
    return data.stats;
  }

  // Campaign management
  getCampaigns(): Campaign[] {
    const data = this.getUserData();
    return data?.campaigns || [];
  }

  addCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Campaign {
    const data = this.getUserData() || this.getDefaultData();
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    data.campaigns.push(newCampaign);
    data.stats.activeCampaigns = data.campaigns.filter(c => c.status === 'Active').length;
    this.saveUserData(data);
    return newCampaign;
  }

  updateCampaign(id: string, updates: Partial<Campaign>) {
    const data = this.getUserData() || this.getDefaultData();
    const index = data.campaigns.findIndex(c => c.id === id);
    if (index !== -1) {
      data.campaigns[index] = {
        ...data.campaigns[index],
        ...updates,
        updatedAt: new Date()
      };
      data.stats.activeCampaigns = data.campaigns.filter(c => c.status === 'Active').length;
      this.saveUserData(data);
    }
  }

  // Design management
  getDesigns(): Design[] {
    const data = this.getUserData();
    return data?.designs || [];
  }

  addDesign(design: Omit<Design, 'id' | 'updatedAt'>): Design {
    const data = this.getUserData() || this.getDefaultData();
    const newDesign: Design = {
      ...design,
      id: Date.now().toString(),
      updatedAt: new Date()
    };
    data.designs.push(newDesign);
    data.stats.activeDesigns = data.designs.length;
    this.saveUserData(data);
    return newDesign;
  }

  // Brand asset management
  getBrandAssets(): BrandAsset[] {
    const data = this.getUserData();
    return data?.brandAssets || [];
  }

  addBrandAsset(asset: Omit<BrandAsset, 'id'>): BrandAsset {
    const data = this.getUserData() || this.getDefaultData();
    const newAsset: BrandAsset = {
      ...asset,
      id: Date.now().toString()
    };
    data.brandAssets.push(newAsset);
    this.saveUserData(data);
    return newAsset;
  }

  // Content ideas
  getContentIdeas(): string[] {
    const data = this.getUserData();
    return data?.contentIdeas || [];
  }

  addContentIdea(idea: string) {
    const data = this.getUserData() || this.getDefaultData();
    if (!data.contentIdeas.includes(idea)) {
      data.contentIdeas.push(idea);
      this.saveUserData(data);
    }
  }

  removeContentIdea(idea: string) {
    const data = this.getUserData() || this.getDefaultData();
    data.contentIdeas = data.contentIdeas.filter(i => i !== idea);
    this.saveUserData(data);
  }

  // Weekly schedule
  getWeeklySchedule() {
    const data = this.getUserData();
    return data?.weeklySchedule || [];
  }

  addScheduleItem(item: { task: string; date: string; color: string }) {
    const data = this.getUserData() || this.getDefaultData();
    data.weeklySchedule.push(item);
    this.saveUserData(data);
  }

  // Clear all user data (for logout/reset)
  clearUserData() {
    localStorage.removeItem(this.storageKey);
    this.initializeDefaultData();
  }

  // Get default data structure
  private getDefaultData(): UserData {
    return {
      profile: {
        name: 'User',
        role: 'other',
        createdAt: new Date(),
        lastLogin: new Date(),
        onboardingCompleted: false
      },
      stats: {
        totalProjects: 0,
        completedTasks: 0,
        activeCampaigns: 0,
        totalReach: '0',
        engagementRate: '0%',
        newFollowers: '0',
        conversions: '0',
        activeDesigns: 0
      },
      campaigns: [],
      designs: [],
      brandAssets: [],
      contentIdeas: [],
      weeklySchedule: []
    };
  }
}

// Singleton instance
export const userDataService = new UserDataService();
export default userDataService;