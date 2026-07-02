// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService, CoreConfigService } from '@rero/ng-core';
import { AppConfigService } from '../app-config.service';
import { AppStore, AppStoreType } from './app.store';

describe('AppStore', () => {
  let store: AppStoreType;
  let httpTesting: HttpTestingController;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiServiceSpy = { baseUrl: '/api', getRefEndpoint: vi.fn() } as any;
  apiServiceSpy.getRefEndpoint.mockImplementation(
    (type: string, pid: string) => `/api/${type}/${pid}`
  );

  const loggedUserResponse = {
    metadata: {
      pid: '1',
      role: 'submitter',
      is_user: true,
      is_submitter: true,
      organisation: { code: 'org1', pid: 'o1', isDedicated: false },
      permissions: {
        documents: { add: true, update: false, delete: false, read: true },
        projects: { add: false, update: false, delete: false, read: true },
      },
    },
    settings: { document_identifier_link: { doi: { default: 'https://doi.org/_identifier_' } } },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CoreConfigService, useClass: AppConfigService },
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    });
    store = TestBed.inject(AppStore) as AppStoreType;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('initial state', () => {
    it('should have null state initially', () => {
      expect(store.user()).toBeNull();
      expect(store.organisation()).toBeNull();
      expect(store.permissions()).toBeNull();
      expect(store.settings()).toEqual({ document_identifier_link: {}, availableLanguages: [], document_serializers: [] });
    });

    it('isLogged should be false initially', () => {
      expect(store.isLogged()).toBe(false);
    });
  });

  describe('load()', () => {
    it('should populate state from logged-user response', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);

      expect(store.user()).toMatchObject({ pid: '1', role: 'submitter' });
      expect(store.organisation()).toEqual({ code: 'org1', pid: 'o1', isDedicated: false });
      expect(store.permissions()).toEqual(loggedUserResponse.metadata.permissions);
      expect(store.settings()).toEqual({ ...loggedUserResponse.settings, availableLanguages: [], document_serializers: [] });
    });

    it('should not set user if is_user is false', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush({
        metadata: { pid: '2', role: 'guest', is_user: false },
        settings: null,
      });

      expect(store.user()).toBeNull();
      expect(store.settings()).toEqual({ document_identifier_link: {}, availableLanguages: [], document_serializers: [] });
    });

    it('should store settings even when user is not logged in', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush({
        settings: { document_identifier_link: {} },
      });

      expect(store.user()).toBeNull();
      expect(store.settings()).toEqual({ document_identifier_link: {}, availableLanguages: [], document_serializers: [] });
    });

    it('should store document_serializers with their label', () => {
      const documentSerializers = [
        { format: 'bibtex', icon: 'fa-file-text-o', label: 'BibTeX' },
        { format: 'ris', icon: 'fa-file-text-o', label: 'RIS' },
      ];
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush({
        settings: { document_identifier_link: {}, document_serializers: documentSerializers },
      });

      expect(store.settings()?.document_serializers).toEqual(documentSerializers);
    });

    it('should not store organisation and permissions on user object', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);

      const user = store.user() as Record<string, unknown>;
      expect('organisation' in user).toBe(false);
      expect('permissions' in user).toBe(false);
    });

    it('isLogged should be true after loading a user', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);
      expect(store.isLogged()).toBe(true);
    });

    it('should complete silently on HTTP error', () => {
      let completed = false;
      store.load().subscribe({ complete: () => (completed = true) });
      httpTesting.expectOne('/api/logged-user/?resolve=1').error(new ProgressEvent('error'));
      expect(completed).toBe(true);
      expect(store.user()).toBeNull();
    });
  });

  describe('hasRole()', () => {
    beforeEach(() => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);
    });

    it('should return true for matching role string', () => {
      expect(store.hasRole('submitter')).toBe(true);
    });

    it('should return false for non-matching role string', () => {
      expect(store.hasRole('admin')).toBe(false);
    });

    it('should return true when role is in array', () => {
      expect(store.hasRole(['admin', 'submitter'])).toBe(true);
    });

    it('should return false when role is not in array', () => {
      expect(store.hasRole(['admin', 'moderator'])).toBe(false);
    });
  });

  describe('is()', () => {
    beforeEach(() => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);
    });

    it('should return true for is_submitter', () => {
      expect(store.is('submitter')).toBe(true);
    });

    it('should return false for is_admin when not set', () => {
      expect(store.is('admin')).toBe(false);
    });
  });

  describe('checkUserReference()', () => {
    beforeEach(() => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);
    });

    it('should return true when reference ends with user pid', () => {
      expect(store.checkUserReference('/api/users/1')).toBe(true);
    });

    it('should return false when reference ends with a different pid', () => {
      expect(store.checkUserReference('/api/users/99')).toBe(false);
    });
  });

  describe('checkUserPid()', () => {
    beforeEach(() => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);
    });

    it('should return true for matching pid', () => {
      expect(store.checkUserPid('1')).toBe(true);
    });

    it('should return false for non-matching pid', () => {
      expect(store.checkUserPid('99')).toBe(false);
    });
  });

  describe('isDedicatedOrganisation()', () => {
    it('should return false when organisation is null', () => {
      expect(store.isDedicatedOrganisation()).toBe(false);
    });

    it('should return false when isDedicated is false', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);
      expect(store.isDedicatedOrganisation()).toBe(false);
    });

    it('should return true when isDedicated is true', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush({
        ...loggedUserResponse,
        metadata: {
          ...loggedUserResponse.metadata,
          organisation: { code: 'dedicated', isDedicated: true },
        },
      });
      expect(store.isDedicatedOrganisation()).toBe(true);
    });
  });

  describe('userRefEndpoint()', () => {
    it('should return the user ref endpoint', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);
      expect(store.userRefEndpoint()).toBe('/api/users/1');
    });
  });

  describe('publicInterfaceLink()', () => {
    it('should return "/" when organisation is null', () => {
      expect(store.publicInterfaceLink()).toBe('/');
    });

    it('should return "/" when organisation is not dedicated', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush(loggedUserResponse);
      expect(store.publicInterfaceLink()).toBe('/');
    });

    it('should return "/<code>" when organisation is dedicated', () => {
      store.load().subscribe();
      httpTesting.expectOne('/api/logged-user/?resolve=1').flush({
        ...loggedUserResponse,
        metadata: {
          ...loggedUserResponse.metadata,
          organisation: { code: 'myorg', isDedicated: true },
        },
      });
      expect(store.publicInterfaceLink()).toBe('/myorg');
    });
  });
});
