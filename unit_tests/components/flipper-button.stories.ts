import { Args } from '@storybook/addons';
import { Story } from '@storybook/web-components';
import { html } from 'lit';

import '../../src/script/components/flipper-button';
import { AppButtonElement } from '../../src/script/utils/interfaces.components';

import { BaseTemplate } from '../base';

export default {
  title: 'Components/flipper-button',
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

interface FlipperButtonProps {
  opened: boolean;
}

type TemplateArgs = AppButtonElement & FlipperButtonProps & Args;

const Template: Story<TemplateArgs> = (args: TemplateArgs) =>
  BaseTemplate(html`
    <flipper-button
      .appearance=${args.appearance}
      .type=${args.type}
      ?opened=${args.opened}
      ?disabled=${args.disabled}
      @click=${onclick}
    >
    </flipper-button>
  `);

export const FlipperButton = Template.bind({});
FlipperButton.args = {
  appearance: 'neutral',
  type: 'submit',
  disabled: false,
  opened: false,
};
