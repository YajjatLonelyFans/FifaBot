import fifaLogo from '../assets/screen.png';
import './Header.css';

export default function Header() {
  return (
    <header className="header" id="main-header">
      <div className="header__brand">
        <img
          src={fifaLogo}
          alt="FIFA World Cup 2026"
          className="header__logo"
        />
        <span className="header__wordmark text-wordmark">FIFA BOT</span>
      </div>
    </header>
  );
}
