import { useState } from 'react';
import { Palette, Moon, Sun, Monitor, Type, Eye } from 'lucide-react';
import { useTheme } from '../contexts/useTheme';

const THEMES = [
  { id: 'dark', label: 'Forest Dark', icon: Moon },
  { id: 'light', label: 'Paper Light', icon: Sun },
  { id: 'oled', label: 'OLED Black', icon: Monitor },
  { id: 'sepia', label: 'Vintage Sepia', icon: Type },
  { id: 'high-contrast', label: 'High Contrast', icon: Eye }
];

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  const selectTheme = (themeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '12px'
    }}>
      {isOpen && (
        <div className="animate-fade-in-up" style={{
          backgroundColor: 'var(--surface-solid)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          minWidth: '200px'
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid var(--surface-border)',
            marginBottom: '4px'
          }}>
            Select Theme
          </div>
          {THEMES.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => selectTheme(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      <button
        className="pulse-button"
        onClick={handleToggle}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          boxShadow: 'var(--shadow-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
        aria-label="Toggle theme menu"
      >
        <Palette size={24} />
      </button>
    </div>
  );
};
