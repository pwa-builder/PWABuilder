import { Args } from '@storybook/addons';
import { Story, Meta } from '@storybook/web-components';
import { LitElement, html, TemplateResult } from 'lit';

import '../../src/script/components/app-button';
import { AppButtonElement } from '../../src/script/utils/interfaces.components';

export default {
  title: 'Components/app-button',
};

interface TemplateArgs extends AppButtonElement, Args {
  label;
}

const Template = (args: TemplateArgs) => html`
  <app-button
    .appearance=${args.appearance}
    .colorMode=${args.colorMode}
    .type=${args.type}
    .disabled=${args.disabled}
  >
    ${args.label}
  </app-button>
`;

export const Primary = Template.bind({});
Primary.args = {
  colorMode: 'primary',
  appearance: 'neutral',
  type: '',
  disabled: false,
  label: 'Click me',
};

export const Secondary = Template.bind({});
Secondary.args = {
  colorMode: 'primary',
  appearance: 'outline',
  type: '',
  disabled: false,
  label: 'Click me',
};

export const Link = Template.bind({});
Link.args = {
  colorMode: 'primary',
  appearance: 'Lightweight',
  type: '',
  disabled: false,
  label: 'Click me',
};
