import dom from '@testing-library/dom';
import expect from 'expect';
import '../snapshots';
import { Primary, Secondary, Link } from './app-button.stories';

describe('components/app-button', () => {
  it('primary type snapshot', async () => {
    const div = document.createElement('div');
    div.innerHTML = `
    ${Primary}
  `;

    expect(dom.prettyDOM(div)).toMatchSnapshot(JSON.stringify(this));
  });

  it('secondary type snapshot', async () => {
    const div = document.createElement('div');
    div.innerHTML = `
    ${Secondary}
  `;

    expect(dom.prettyDOM(div)).toMatchSnapshot(JSON.stringify(this));
  });

  it('link type snapshot', async function() {
    const div = document.createElement('div');
    div.innerHTML = `
    ${Link}
  `;

    expect(dom.prettyDOM(div)).toMatchSnapshot(JSON.stringify(this));
  });
});
