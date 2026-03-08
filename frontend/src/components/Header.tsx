import React from 'react';
import { Menu, Brain, Zap, Globe } from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ];

  return (
    <header className="glass-card border-b border-purple-500/20 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl mr-3 neon-glow-blue">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t('app.title')}</h1>
                <p className="text-xs text-gray-400 hidden sm:block">{t('app.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
              <Zap className="w-4 h-4 text-yellow-400 neon-icon" />
              <span>{t('header.aiPowered')}</span>
            </div>

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all border border-purple-500/20">
                <Globe className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">
                  {languages.find(l => l.code === language)?.flag}
                </span>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {languages.find(l => l.code === language)?.name}
                </span>
              </button>
              
              <div className="absolute right-0 mt-2 w-56 glass-card-violet rounded-xl shadow-2xl border border-purple-500/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-96 overflow-y-auto">
                <div className="py-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-purple-600/20 flex items-center space-x-3 transition-all ${
                        language === lang.code 
                          ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border-l-2 border-purple-400' 
                          : 'text-gray-300'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                      {language === lang.code && (
                        <span className="ml-auto text-purple-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center neon-glow-blue">
              <span className="text-white text-sm font-bold">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};