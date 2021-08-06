import { Args } from '@storybook/addons';
import { Story } from '@storybook/web-components';
import { html } from 'lit';

import '../../src/script/components/loading-button';
import { AppButtonElement } from '../../src/script/utils/interfaces.components';

import { BaseTemplate } from '../base';

export default {
  title: 'Components/loading-button',
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

interface LoadingButtonProps {
  loading: boolean;
}

type TemplateArgs = AppButtonElement & LoadingButtonProps & Args;

const Template: Story<TemplateArgs> = (args: TemplateArgs) =>
  BaseTemplate(html`
    <loading-button
      .appearance=${args.appearance}
      .type=${args.type}
      ?loading=${args.loading}
      ?disabled=${args.disabled}
      @click=${onclick}
    >
      ${args.label}
    </loading-button>
  `);

export const LoadingButton = Template.bind({});
LoadingButton.args = {
  appearance: 'neutral',
  type: 'submit',
  disabled: false,
  loading: false,
  label: 'Click me',
};
