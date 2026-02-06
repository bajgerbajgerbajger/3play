import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  cs: {
    translation: {
      common: {
        home: 'Domů',
        profile: 'Můj profil',
        dashboard: 'Můj Dashboard',
        settings: 'Nastavení',
        logout: 'Odhlásit se',
        search: 'Hledat...',
        notifications: 'Upozornění',
        markAllRead: 'Označit vše jako přečtené',
        noNotifications: 'Žádná upozornění'
      }
    }
  },
  sk: {
    translation: {
      common: {
        home: 'Domov',
        profile: 'Môj profil',
        dashboard: 'Môj Dashboard',
        settings: 'Nastavenia',
        logout: 'Odhlásiť sa',
        search: 'Hľadať...',
        notifications: 'Upozornenia',
        markAllRead: 'Označiť všetko ako prečítané',
        noNotifications: 'Žiadne upozornenia'
      }
    }
  },
  en: {
    translation: {
      common: {
        home: 'Home',
        profile: 'My Profile',
        dashboard: 'My Dashboard',
        settings: 'Settings',
        logout: 'Log out',
        search: 'Search...',
        notifications: 'Notifications',
        markAllRead: 'Mark all as read',
        noNotifications: 'No notifications'
      }
    }
  },
  de: {
    translation: {
      common: {
        home: 'Startseite',
        profile: 'Mein Profil',
        dashboard: 'Mein Dashboard',
        settings: 'Einstellungen',
        logout: 'Abmelden',
        search: 'Suchen...',
        notifications: 'Benachrichtigungen',
        markAllRead: 'Alle als gelesen markieren',
        noNotifications: 'Keine Benachrichtigungen'
      }
    }
  },
  pl: {
    translation: {
      common: {
        home: 'Strona główna',
        profile: 'Mój profil',
        dashboard: 'Mój Dashboard',
        settings: 'Ustawienia',
        logout: 'Wyloguj się',
        search: 'Szukaj...',
        notifications: 'Powiadomienia',
        markAllRead: 'Oznacz wszystkie jako przeczytane',
        noNotifications: 'Brak powiadomień'
      }
    }
  },
  uk: {
    translation: {
      common: {
        home: 'Головна',
        profile: 'Мій профіль',
        dashboard: 'Мій Dashboard',
        settings: 'Налаштування',
        logout: 'Вийти',
        search: 'Пошук...',
        notifications: 'Сповіщення',
        markAllRead: 'Позначити всі як прочитані',
        noNotifications: 'Немає сповіщень'
      }
    }
  },
  ja: {
    translation: {
      common: {
        home: 'ホーム',
        profile: 'マイプロフィール',
        dashboard: 'マイダッシュボード',
        settings: '設定',
        logout: 'ログアウト',
        search: '検索...',
        notifications: '通知',
        markAllRead: 'すべて既読にする',
        noNotifications: '通知はありません'
      }
    }
  },
  zh: {
    translation: {
      common: {
        home: '首页',
        profile: '我的资料',
        dashboard: '我的仪表板',
        settings: '设置',
        logout: '退出',
        search: '搜索...',
        notifications: '通知',
        markAllRead: '全部标记为已读',
        noNotifications: '无通知'
      }
    }
  },
  vi: {
    translation: {
      common: {
        home: 'Trang chủ',
        profile: 'Hồ sơ của tôi',
        dashboard: 'Bảng điều khiển của tôi',
        settings: 'Cài đặt',
        logout: 'Đăng xuất',
        search: 'Tìm kiếm...',
        notifications: 'Thông báo',
        markAllRead: 'Đánh dấu tất cả là đã đọc',
        noNotifications: 'Không có thông báo'
      }
    }
  },
  rom: { // Romany (Custom code)
    translation: {
      common: {
        home: 'Kher',
        profile: 'Miro profil',
        dashboard: 'Miro Dashboard',
        settings: 'Nastavenia',
        logout: 'Džal avri',
        search: 'Rod...',
        notifications: 'Upozornenia',
        markAllRead: 'Označiť všetko',
        noNotifications: 'Nane nič'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'cs',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage']
    }
  });

export default i18n;
