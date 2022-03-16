/*
 * SONAR User Interface
 * Copyright (C) 2022 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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
