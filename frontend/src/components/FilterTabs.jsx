import styles from './FilterTabs.module.css';

export function FilterTabs({ label, options, value, onChange }) {
  return (
    <div className={styles.tabs} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.tab}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          <span className={styles.count}>{option.count}</span>
        </button>
      ))}
    </div>
  );
}
