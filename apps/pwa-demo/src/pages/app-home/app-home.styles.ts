import { css } from 'lit';

export const homeStyles = css`
  .hero {
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    padding: 34px 26px;
    color: #fff;
    background: var(--nimbus-gradient);
    box-shadow: 0 18px 44px rgba(2, 32, 71, 0.32);
  }

  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      40% 60% at 90% -10%,
      rgba(255, 255, 255, 0.28),
      transparent 60%
    );
    pointer-events: none;
  }

  .hero h1 {
    margin: 0;
    font-size: clamp(2rem, 6vw, 3.1rem);
    letter-spacing: -0.03em;
    line-height: 1.02;
  }

  .hero p {
    margin: 12px 0 0;
    max-width: 52ch;
    font-size: clamp(1rem, 2.4vw, 1.2rem);
    opacity: 0.95;
  }

  .hero .cta {
    margin-top: 22px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 22px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 0.82rem;
    backdrop-filter: blur(4px);
  }

  .chip.ok {
    background: rgba(34, 197, 94, 0.28);
    border-color: rgba(34, 197, 94, 0.5);
  }

  section.features {
    margin-top: 30px;
  }

  section.features h2,
  section.status h2 {
    font-size: 1.2rem;
    margin: 0 0 14px;
  }

  .feature {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
  }

  .feature .ic {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    font-size: 1.3rem;
    color: #fff;
    background: var(--nimbus-gradient);
  }

  .feature h3 {
    margin: 4px 0 0;
    font-size: 1.05rem;
  }

  .feature p {
    margin: 0;
    color: var(--wa-color-text-quiet);
    font-size: 0.9rem;
    flex: 1;
  }

  a.card-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
  }

  a.card-link wa-card::part(base) {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    height: 100%;
  }

  a.card-link:hover wa-card::part(base) {
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(2, 32, 71, 0.18);
  }

  section.status {
    margin-top: 30px;
  }

  .storage-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--wa-color-text-quiet);
    margin-bottom: 6px;
  }
`;
