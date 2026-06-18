// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { IContribution } from '../record/document/contribution.interface';
import { ContributorsPipe } from './contributors.pipe';

describe('ContributorsPipe', () => {
  const data: IContribution[] = [
    {
      agent: { preferred_name: 'agent 1', type: 'bf:Person' },
      role: ['cre']
    },
    {
      agent: { preferred_name: 'agent 2', type: 'bf:Person' },
      role: ['edt']
    },
    {
      agent: { preferred_name: 'organisation 1', type: 'bf:Organisation' },
      role: ['cre']
    },
    {
      agent: { preferred_name: 'meeting 1', type: 'bf:Meeting' },
      role: ['edt']
    },
    {
      agent: { preferred_name: 'meeting 2', type: 'bf:Meeting' },
      role: ['cre']
    }
  ];

  const resultPersonOrganisation: IContribution[] = [
    {
      agent: { preferred_name: 'agent 1', type: 'bf:Person' },
      role: ['cre']
    },
    {
      agent: { preferred_name: 'organisation 1', type: 'bf:Organisation' },
      role: ['cre']
    },
    {
      agent: { preferred_name: 'agent 2', type: 'bf:Person' },
      role: ['edt']
    }
  ];

  const resultMeeting: IContribution[] = [
    {
      agent: { preferred_name: 'meeting 2', type: 'bf:Meeting' },
      role: ['cre']
    },
    {
      agent: { preferred_name: 'meeting 1', type: 'bf:Meeting' },
      role: ['edt']
    }
  ];

  it('create an instance', () => {
    const pipe = new ContributorsPipe();
    expect(pipe).toBeTruthy();
  });

  it('Extraction of sorted people and organizations.', () => {
    const pipe = new ContributorsPipe();
    expect(pipe.transform(data)).toEqual(resultPersonOrganisation);
  });

  it('Extraction of sorted meetings.', () => {
    const pipe = new ContributorsPipe();
    expect(pipe.transform(data, true)).toEqual(resultMeeting);
  });
});
