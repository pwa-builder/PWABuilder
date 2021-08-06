import { Args } from '@storybook/addons';
import { Story } from '@storybook/web-components';
import { html } from 'lit';

import '../../src/script/components/app-button';
import { AppButtonElement } from '../../src/script/utils/interfaces.components';

import { BaseTemplate } from '../base';

export default {
  title: 'Components/app-button',
  argTypes: {
    appearance: {
      options: ['accent', 'lightweight', 'neutral', 'outline', 'stealth'],
      control: 'select',
    },
  },
  parameters: {
    actions: {
      handles: ['click'],
    },
  },
};

type TemplateArgs = AppButtonElement & Args;

const Template: Story<TemplateArgs> = (args: TemplateArgs) =>
  BaseTemplate(html`
    <app-button
      .appearance=${args.appearance}
      .type=${args.type}
      ?disabled=${args.disabled}
      @click=${onclick}
    >
      ${args.label}
    </app-button>
  `);

export const Primary = Template.bind({});
Primary.args = {
  appearance: 'neutral',
  type: '',
  disabled: false,
  label: 'Click me',
};

export const Secondary = Template.bind({});
Secondary.args = {
  appearance: 'outline',
  type: '',
  disabled: false,
  label: 'Click me',
};

export const Link = Template.bind({});
Link.args = {
  appearance: 'lightweight',
  type: '',
  disabled: false,
  label: 'Click me',
};
