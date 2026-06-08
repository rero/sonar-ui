/*
 * SONAR User Interface
 * Copyright (C) 2021-2025 RERO
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
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Deposit, DepositFile } from '../models/deposit.model';
import { User } from '../models';
import { AppStore } from '../store/app.store';
import { DepositService } from './deposit.service';
import { DepositStore, DepositStoreType } from './deposit.store';

const mockUser: User = { pid: '1', role: 'submitter', is_submitter: true } as unknown as User;

const mockDeposit: Deposit = {
  pid: '42',
  status: 'in_progress',
  step: 'metadata',
  user: { $ref: '/api/users/1' },
  diffusion: {},
  _files: [
    { key: 'main.pdf', version_id: 'v1', order: 1 },
    { key: 'annex.pdf', version_id: 'v2', order: 2 },
  ],
};

describe('DepositStore', () => {
  let store: DepositStoreType;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appStoreMock: any = {
    user: signal<User | null>(null),
    checkUserReference: vi.fn().mockReturnValue(false),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const depositServiceMock: any = {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    publish: vi.fn(),
    removeFile: vi.fn(),
    getJsonSchema: vi.fn(),
    reviewDeposit: vi.fn(),
    extractPDFMetadata: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    appStoreMock.user.set(null);
    appStoreMock.checkUserReference.mockReturnValue(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: AppStore, useValue: appStoreMock },
        { provide: DepositService, useValue: depositServiceMock },
        DepositStore,
      ],
    });
    store = TestBed.inject(DepositStore) as DepositStoreType;
  });

  describe('initial state', () => {
    it('should have null deposit initially', () => {
      expect(store.deposit()).toBeNull();
    });

    it('should have null schema initially', () => {
      expect(store.schema()).toBeNull();
    });

    it('isLoading should be false initially', () => {
      expect(store.isLoading()).toBe(false);
    });

    it('error should be null initially', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('load()', () => {
    it('should store the deposit after successful fetch', () => {
      depositServiceMock.get.mockReturnValue(of({ metadata: mockDeposit }));
      store.load('42').subscribe();
      expect(store.deposit()?.pid).toBe('42');
    });

    it('should set isLoading to false after load', () => {
      depositServiceMock.get.mockReturnValue(of({ metadata: mockDeposit }));
      store.load('42').subscribe();
      expect(store.isLoading()).toBe(false);
    });

    it('should set isLoading to true while loading', () => {
      const subject = new Subject<{ metadata: Deposit }>();
      depositServiceMock.get.mockReturnValue(subject.asObservable());

      store.load('42').subscribe();
      expect(store.isLoading()).toBe(true);

      subject.next({ metadata: mockDeposit });
      subject.complete();
      expect(store.isLoading()).toBe(false);
    });

    it('should sort files by order', () => {
      const unsortedDeposit: Deposit = {
        ...mockDeposit,
        _files: [
          { key: 'b.pdf', version_id: 'v2', order: 2 },
          { key: 'a.pdf', version_id: 'v1', order: 1 },
        ],
      };
      depositServiceMock.get.mockReturnValue(of({ metadata: unsortedDeposit }));
      store.load('42').subscribe();
      expect(store.deposit()?._files?.[0].key).toBe('a.pdf');
    });

    it('should set error state and re-throw on HTTP error', () => {
      const error = new Error('Not found');
      depositServiceMock.get.mockReturnValue(throwError(() => error));

      let caughtError: Error | null = null;
      store.load('42').subscribe({ error: (err) => (caughtError = err) });

      expect(store.error()).toBe('Not found');
      expect(store.isLoading()).toBe(false);
      expect(caughtError).toBe(error);
    });
  });

  describe('create()', () => {
    it('should store the created deposit', () => {
      const newDeposit: Deposit = { ...mockDeposit, pid: '99', status: 'in_progress' };
      depositServiceMock.create.mockReturnValue(of({ metadata: newDeposit }));

      store.create().subscribe();

      expect(store.deposit()?.pid).toBe('99');
    });

    it('should return the created deposit to the subscriber', () => {
      const newDeposit: Deposit = { ...mockDeposit, pid: '99' };
      depositServiceMock.create.mockReturnValue(of({ metadata: newDeposit }));

      let result: { metadata: Deposit } | null = null;
      store.create().subscribe((r) => (result = r as { metadata: Deposit }));

      expect(result).not.toBeNull();
    });
  });

  describe('update()', () => {
    beforeEach(() => {
      depositServiceMock.get.mockReturnValue(of({ metadata: mockDeposit }));
      store.load('42').subscribe();
    });

    it('should update the deposit in state on success', () => {
      const updated: Deposit = { ...mockDeposit, step: 'contributors' };
      depositServiceMock.update.mockReturnValue(of({ metadata: updated }));

      store.update('42', { step: 'contributors' }).subscribe();

      expect(store.deposit()?.step).toBe('contributors');
    });

    it('should not update state when service returns null (error case)', () => {
      depositServiceMock.update.mockReturnValue(of(null));

      store.update('42', {}).subscribe();

      expect(store.deposit()?.step).toBe('metadata');
    });
  });

  describe('delete()', () => {
    beforeEach(() => {
      depositServiceMock.get.mockReturnValue(of({ metadata: mockDeposit }));
      store.load('42').subscribe();
    });

    it('should set deposit to null after deletion', () => {
      depositServiceMock.delete.mockReturnValue(of(true));

      store.delete(mockDeposit).subscribe();

      expect(store.deposit()).toBeNull();
    });
  });

  describe('publish()', () => {
    it('should delegate to depositService.publish', () => {
      depositServiceMock.publish.mockReturnValue(of({}));

      store.publish('42').subscribe();

      expect(depositServiceMock.publish).toHaveBeenCalledWith('42');
    });
  });

  describe('loadSchema()', () => {
    it('should fetch and store schema on first call', () => {
      const schema = { type: 'object', properties: {} };
      depositServiceMock.getJsonSchema.mockReturnValue(of(schema));

      store.loadSchema('deposits').subscribe();

      expect(store.schema()).toEqual(schema);
      expect(depositServiceMock.getJsonSchema).toHaveBeenCalledTimes(1);
    });

    it('should not re-fetch when schema is already cached', () => {
      const schema = { type: 'object', properties: {} };
      depositServiceMock.getJsonSchema.mockReturnValue(of(schema));

      store.loadSchema('deposits').subscribe();
      store.loadSchema('deposits').subscribe();

      expect(depositServiceMock.getJsonSchema).toHaveBeenCalledTimes(1);
    });

    it('should return the cached schema on second call', () => {
      const schema = { type: 'object', properties: {} };
      depositServiceMock.getJsonSchema.mockReturnValue(of(schema));

      store.loadSchema('deposits').subscribe();

      let cachedSchema: object | null = null;
      store.loadSchema('deposits').subscribe((s) => (cachedSchema = s));

      expect(cachedSchema).toEqual(schema);
    });
  });

  describe('reviewDeposit()', () => {
    it('should delegate to depositService.reviewDeposit with correct args', () => {
      depositServiceMock.reviewDeposit.mockReturnValue(of({}));

      store.reviewDeposit(mockDeposit, 'approve', 'LGTM').subscribe();

      expect(depositServiceMock.reviewDeposit).toHaveBeenCalledWith(mockDeposit, 'approve', 'LGTM');
    });
  });

  describe('mergeDeposit()', () => {
    it('should update deposit fields locally without an API call', () => {
      depositServiceMock.get.mockReturnValue(of({ metadata: mockDeposit }));
      store.load('42').subscribe();

      store.mergeDeposit({ step: 'diffusion' });

      expect(store.deposit()?.step).toBe('diffusion');
      expect(depositServiceMock.update).not.toHaveBeenCalled();
    });

    it('should deep-merge the provided updates', () => {
      depositServiceMock.get.mockReturnValue(of({ metadata: mockDeposit }));
      store.load('42').subscribe();

      store.mergeDeposit({ ['metadata']: { title: 'Test' } });

      expect((store.deposit()?.['metadata'] as Record<string, unknown>)?.['title']).toBe('Test');
    });

    it('should do nothing when deposit is null', () => {
      store.mergeDeposit({ step: 'diffusion' });

      expect(store.deposit()).toBeNull();
    });
  });

  describe('canAccess()', () => {
    it('should return false when deposit is null', () => {
      expect(store.canAccess()).toBe(false);
    });

    it('should return true for in_progress deposit owned by logged-in user', () => {
      appStoreMock.checkUserReference.mockReturnValue(true);
      depositServiceMock.get.mockReturnValue(
        of({ metadata: { ...mockDeposit, status: 'in_progress' } })
      );
      store.load('42').subscribe();

      expect(store.canAccess()).toBe(true);
    });

    it('should return true for ask_for_changes deposit owned by logged-in user', () => {
      appStoreMock.checkUserReference.mockReturnValue(true);
      depositServiceMock.get.mockReturnValue(
        of({ metadata: { ...mockDeposit, status: 'ask_for_changes' } })
      );
      store.load('42').subscribe();

      expect(store.canAccess()).toBe(true);
    });

    it('should return false for in_progress deposit not owned by user', () => {
      appStoreMock.checkUserReference.mockReturnValue(false);
      depositServiceMock.get.mockReturnValue(
        of({ metadata: { ...mockDeposit, status: 'in_progress' } })
      );
      store.load('42').subscribe();

      expect(store.canAccess()).toBe(false);
    });

    it('should return true for to_validate deposit when user is moderator', () => {
      appStoreMock.user.set({ ...mockUser, is_moderator: true } as unknown as User);
      depositServiceMock.get.mockReturnValue(
        of({ metadata: { ...mockDeposit, status: 'to_validate' } })
      );
      store.load('42').subscribe();

      expect(store.canAccess()).toBe(true);
    });

    it('should return false for to_validate deposit when user is not moderator', () => {
      appStoreMock.user.set({ ...mockUser, is_moderator: false } as unknown as User);
      depositServiceMock.get.mockReturnValue(
        of({ metadata: { ...mockDeposit, status: 'to_validate' } })
      );
      store.load('42').subscribe();

      expect(store.canAccess()).toBe(false);
    });

    it('should return false for validated status', () => {
      appStoreMock.checkUserReference.mockReturnValue(true);
      depositServiceMock.get.mockReturnValue(
        of({ metadata: { ...mockDeposit, status: 'validated' } })
      );
      store.load('42').subscribe();

      expect(store.canAccess()).toBe(false);
    });
  });

  describe('mainFile() / additionalFiles()', () => {
    beforeEach(() => {
      depositServiceMock.get.mockReturnValue(of({ metadata: mockDeposit }));
      store.load('42').subscribe();
    });

    it('mainFile() should return the first file (lowest order)', () => {
      const mainFile = store.mainFile() as DepositFile;
      expect(mainFile?.key).toBe('main.pdf');
    });

    it('additionalFiles() should return all files except the first', () => {
      const additionalFiles = store.additionalFiles() as DepositFile[];
      expect(additionalFiles).toHaveLength(1);
      expect(additionalFiles[0].key).toBe('annex.pdf');
    });

    it('mainFile() should return null when deposit has no files', () => {
      depositServiceMock.get.mockReturnValue(
        of({ metadata: { ...mockDeposit, _files: [] } })
      );
      store.load('42').subscribe();

      expect(store.mainFile()).toBeNull();
    });

    it('additionalFiles() should return empty array when deposit has no files', () => {
      depositServiceMock.get.mockReturnValue(
        of({ metadata: { ...mockDeposit, _files: [] } })
      );
      store.load('42').subscribe();

      expect(store.additionalFiles()).toEqual([]);
    });
  });

  describe('maxStep()', () => {
    it('should return "metadata" when deposit is null', () => {
      expect(store.maxStep()).toBe('metadata');
    });

    it('should return the deposit step when deposit is loaded', () => {
      depositServiceMock.get.mockReturnValue(
        of({ metadata: { ...mockDeposit, step: 'diffusion' } })
      );
      store.load('42').subscribe();

      expect(store.maxStep()).toBe('diffusion');
    });
  });
});
