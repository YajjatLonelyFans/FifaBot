import fifaLogo from '../assets/screen.png';
import './EmptyState.css';

const SUGGESTIONS = [
  { icon: 'table_chart', label: 'Group stage predictions' },
  { icon: 'sports_soccer', label: 'Top scorers so far' },
  { icon: 'stadium', label: 'Host city venues' },
];

export default function EmptyState({ onSuggestionClick }) {
  return (
    <div className="empty-state" id="empty-state">
      {/* Logo Mark */}
      <div className="empty-state__logo-ring animate-fade-up">
        <img
          src={fifaLogo}
          alt="FIFA BOT"
          className="empty-state__logo-img"
        />
      </div>

      {/* Heading */}
      <div className="empty-state__text animate-fade-up delay-100">
        <h1 className="empty-state__title">
          What do you want to know about WC 2026?
        </h1>
        <p className="empty-state__subtitle">
          Upload PDFs, stats sheets, or images. Ask anything about the tournament.
        </p>
      </div>

      {/* Suggestion Chips */}
      <div className="empty-state__chips animate-fade-up delay-200">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            className="chip"
            onClick={() => onSuggestionClick(s.label)}
            type="button"
          >
            <span className="material-symbols-outlined chip__icon">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
