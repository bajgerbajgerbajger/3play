export interface UserActivity {
  type: 'search' | 'watch' | 'view_category' | 'game_play' | 'page_view';
  content: string; // e.g., "sci-fi movies", "Interstellar", "games/chess"
  timestamp: number;
  details?: any;
}

export interface UserProfile {
  lastVisit: number;
  visitCount: number;
  activities: UserActivity[];
  preferences: {
    favoriteGenres: Record<string, number>;
    favoriteFormats: Record<string, number>; // 'movie' | 'series' | 'short'
    interactionStyle: 'passive' | 'active'; // deduced from clicks/searches
  };
}

const STORAGE_KEY = '3play_user_brain';

export class BehaviorTracker {
  private static instance: BehaviorTracker;
  private profile: UserProfile;

  private constructor() {
    this.profile = this.loadProfile();
  }

  public static getInstance(): BehaviorTracker {
    if (!BehaviorTracker.instance) {
      BehaviorTracker.instance = new BehaviorTracker();
    }
    return BehaviorTracker.instance;
  }

  private loadProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load user profile', e);
    }
    return {
      lastVisit: Date.now(),
      visitCount: 0,
      activities: [],
      preferences: {
        favoriteGenres: {},
        favoriteFormats: {},
        interactionStyle: 'passive'
      }
    };
  }

  private saveProfile() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.error('Failed to save user profile', e);
    }
  }

  public track(type: UserActivity['type'], content: string, details?: any) {
    const activity: UserActivity = {
      type,
      content,
      timestamp: Date.now(),
      details
    };

    this.profile.activities.push(activity);
    
    // Update preferences (simple heuristic)
    if (type === 'search' || type === 'watch') {
      // Analyze content for keywords (mock implementation)
      const genres = ['sci-fi', 'comedy', 'horror', 'action', 'drama'];
      const lowerContent = content.toLowerCase();
      
      genres.forEach(genre => {
        if (lowerContent.includes(genre)) {
          this.profile.preferences.favoriteGenres[genre] = (this.profile.preferences.favoriteGenres[genre] || 0) + 1;
        }
      });
    }

    // Keep history manageable (last 1000 items)
    if (this.profile.activities.length > 1000) {
      this.profile.activities = this.profile.activities.slice(-1000);
    }

    this.saveProfile();
  }

  public getProfile(): UserProfile {
    return this.profile;
  }

  public getSuggestedGreeting(): string {
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? 'Dobré ráno' : hours < 18 ? 'Dobré odpoledne' : 'Dobrý večer';
    
    const topGenre = Object.entries(this.profile.preferences.favoriteGenres)
      .sort((a, b) => b[1] - a[1])[0];

    if (topGenre) {
      return `${timeOfDay}! Máš chuť na další ${topGenre[0]}? 🎬`;
    }
    
    return `${timeOfDay}! Co si dnes pustíme?`;
  }

  public getRecommendations(): string[] {
    // Mock recommendations based on top genre
    const topGenre = Object.entries(this.profile.preferences.favoriteGenres)
      .sort((a, b) => b[1] - a[1])[0];

    if (!topGenre) return ['Zatím tě jen poznávám, ale zkus sekci Trendy!'];

    const genre = topGenre[0];
    if (genre === 'sci-fi') return ['Interstellar', 'Dune', 'The Matrix'];
    if (genre === 'comedy') return ['Friends', 'The Office', 'Brooklyn 99'];
    if (genre === 'horror') return ['The Conjuring', 'It', 'Get Out'];
    
    return ['Zkus něco nového z našich Trendů!'];
  }
}
