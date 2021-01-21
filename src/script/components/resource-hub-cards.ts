import { html } from 'lit-element';

interface CardData {
  imageUrl: string;
  title: string;
  description: string;
  linkUrl: string;
}

const resourceCards: Array<CardData> = [
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Blog',
    description:
      'Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing',
    linkUrl: '',
  },
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Demo',
    description:
      'Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing',
    linkUrl: '',
  },
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Components',
    description:
      'Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing',
    linkUrl: '',
  },
  {
    imageUrl: '/assets/icons/icon_120.png',
    title: 'Documentation',
    description:
      'Card description. Lorem ipsum dolor sit amet, consectetur elit adipiscing',
    linkUrl: '',
  },
];

// for the landing page
export function landingCards() {
  return resourceCards.map(data => {
    return renderResourceCard(data);
  });
}

// For the complete page
export function completeCards() {
  return resourceCards.slice(1).map(data => {
    return renderResourceCard(data);
  });
}

function renderResourceCard(data: CardData) {
  return html`
    <fast-card>
      <img src="${data.imageUrl}" alt="${data.title} card header image" />
      <h3>${data.title}</h3>

      <p>${data.description}</p>

      <div class="card-actions">
        <app-button appearance="lightweight">View ${data.title}</app-button>
      </div>
    </fast-card>
  `;
}
