import { useCallback } from "react";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { TiHomeOutline } from "react-icons/ti";
import { CiMap } from "react-icons/ci";
import { GrNotes } from "react-icons/gr";
import { IoSettings } from "react-icons/io5";

type NavItem = 'home' | 'location' | 'map' | 'notes' | 'settings';

interface NavbarProps {
  activeItem: NavItem;
  onNavigate?: (section: NavItem) => void;
}

export default function Navbar({ activeItem, onNavigate }: NavbarProps) {
  const handleNavClick = useCallback((item: NavItem) => {
    onNavigate?.(item);
  }, [onNavigate]);

  const navItems = [
    { id: 'home' as NavItem, icon: TiHomeOutline, label: 'Home', section: 'mid' },
    { id: 'map' as NavItem, icon: CiMap, label: 'Weather Map', section: 'mid' },
    { id: 'notes' as NavItem, icon: GrNotes, label: 'Weather Notes', section: 'mid' },
    { id: 'settings' as NavItem, icon: IoSettings, label: 'Settings', section: 'bottom' },
  ];

  return (
    <nav className="navSection" aria-label="Primary">
      <div
        className="logo"
        onClick={() => handleNavClick('home')}
        role="button"
        tabIndex={0}
        aria-label="Home"
        aria-current={activeItem === 'home' ? 'page' : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleNavClick('home');
          }
        }}
      >
        <TiWeatherPartlySunny size={58} />
        <h3>Weather Services</h3>
      </div>
      
      <div className="midNav">
        {navItems
          .filter(item => item.section === 'mid')
          .map(item => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                role="button"
                tabIndex={0}
                aria-label={item.label}
                aria-current={activeItem === item.id ? 'page' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNavClick(item.id);
                  }
                }}
              >
                <IconComponent size={58} />
                {/* City label intentionally not shown here; it will appear inside content cards */}
              </div>
            );
          })}
      </div>
      
      <div className="bottomNav">
        {navItems
          .filter(item => item.section === 'bottom')
          .map(item => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                role="button"
                tabIndex={0}
                aria-label={item.label}
                aria-current={activeItem === item.id ? 'page' : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNavClick(item.id);
                  }
                }}
              >
                <IconComponent size={58} />
              </div>
            );
          })}
      </div>
    </nav>
  );
}
