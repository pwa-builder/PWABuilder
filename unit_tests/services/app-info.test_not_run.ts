import { expect } from 'chai';

import { ListHeader, Status } from '../../src/script/utils/interfaces';
import {
  getProgress,
  setProgress,
  getURL,
  setURL,
  getResults,
  setResults,
} from '../../src/script/services/app-info';

describe('services/app-info', () => {
  const mockProgress = {
    progress: [
      {
        header: ListHeader.TEST,
        location: '/',
        done: Status.DONE,
        items: [
          {
            name: 'Submit URL',
            done: Status.PENDING,
          },
          {
            name: 'Run Tests',
            done: Status.PENDING,
          },
        ],
      },
      {
        header: ListHeader.REVIEW,
        location: '/reportcard',
        done: Status.ACTIVE,
        items: [
          {
            name: 'Manifest',
            done: Status.PENDING,
          },
          {
            name: 'Service Worker',
            done: Status.PENDING,
          },
          {
            name: 'Security',
            done: Status.PENDING,
          },
        ],
      },
      {
        header: ListHeader.PUBLISH,
        location: '/publish',
        done: Status.PENDING,
        items: [
          {
            name: 'Package',
            done: Status.PENDING,
          },
          {
            name: 'Publish',
            done: Status.PENDING,
          },
        ],
      },
      {
        header: ListHeader.COMPLETE,
        location: '/complete',
        done: Status.PENDING,
        items: [
          {
            name: 'Resources',
            done: Status.PENDING,
          },
        ],
      },
    ],
  };

  const mockResults = {
    manifest: [{ infoString: 'a', result: false, category: 'b' }],
    service_worker: [{ infoString: 'c', result: true, category: 'd' }],
    security: [{ infoString: 'e', result: false, category: 'f' }],
  };

  afterEach(() => {
    sessionStorage.clear();
  });

  it('getProgress() no current progress', () => {
    const progList = getProgress();

    const first = progList.progress[0];
    expect(first?.done).to.equal(Status.ACTIVE);

    for (let i = 1; i < progList.progress.length; i++) {
      const current = progList.progress[i];

      expect(current?.done).to.equal(Status.PENDING);
    }
  });

  it('getProgress() has progress', () => {
    sessionStorage.setItem('current_progress', JSON.stringify(mockProgress));

    const progList = getProgress();
    expect(progList.progress[1]?.done).to.equal(Status.ACTIVE);
  });

  it('setProgress stores progress, by json stringify', () => {
    setProgress(mockProgress);

    expect(getProgress()).to.deep.equal(mockProgress);
  });

  it('getURL() throws an error if url is not stored', () => {
    expect(getURL()).to.throw();
  });

  it('getURL() retrieves url if stored', () => {
    const exampleUrl = 'https://www.pwabuilder.com';
    sessionStorage.setItem('current_url', exampleUrl);

    expect(getURL()).to.equal(exampleUrl);
  });

  it('getURL() retrieves url if set', () => {
    setURL('https://www.pwabuilder.com');
    expect(getURL()).to.equal('https://www.pwabuilder.com');
  });

  it('setUrl() for coverage sake', () => {
    setURL('https://www.pwabuilder.com');
  });

  it('getResults() returns the raw test results', () => {
    setResults(mockResults);
    expect(getResults()).to.deep.equal(mockResults);
  });

  it('getResults() returns undefined if not stored', () => {
    expect(getResults()).to.be.undefined;
  });

  it('setResults() sanity', () => {
    setResults(mockResults);
  });
});
