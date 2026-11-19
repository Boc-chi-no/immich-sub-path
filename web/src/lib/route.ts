import { OpenQueryParam, type SharedLinkTab } from '#lib/constants.ts';
import { appUrl, toHashRoute } from '#lib/utils/hash-routing.ts';
import { IntegrityReport, QueueName, getBaseUrl, type MetadataSearchDto, type SmartSearchDto } from '@immich/sdk';
import { omitBy } from 'lodash-es';

const asQueueSlug = (name: QueueName) => {
  return name.replaceAll(/[A-Z]/g, (m) => '-' + m.toLowerCase());
};

export const fromQueueSlug = (slug: string): QueueName | undefined => {
  const name = slug.replaceAll(/-([a-z])/g, (_, c) => c.toUpperCase());
  if (Object.values(QueueName).includes(name as QueueName)) {
    return name as QueueName;
  }
};

type QueryValue = number | string | boolean;
const asQueryString = (params?: Record<string, QueryValue | undefined>) => {
  const items = Object.entries(params ?? {})
    .filter((item): item is [string, QueryValue] => {
      const value = item[1];

      if (value === undefined) {
        return false;
      }

      if (value === null) {
        return false;
      }

      return value !== '';
    })
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

  return items.length === 0 ? '' : `?${items.join('&')}`;
};

const asSearchQuery = (dto?: MetadataSearchDto | SmartSearchDto) => {
  const metadata = omitBy(dto ?? {}, (value) => value === undefined);
  const query = Object.keys(metadata).length === 0 ? undefined : JSON.stringify(metadata);
  return asQueryString({ query });
};

export const Route = {
  home: () => toHashRoute('/'),

  // auth
  login: (params?: { continue?: string; autoLaunch?: 0 | 1 }) => toHashRoute('/auth/login' + asQueryString(params)),
  logout: (params?: { continue?: string }) => toHashRoute('/auth/logout' + asQueryString(params)),
  register: () => toHashRoute('/auth/register'),
  changePassword: () => toHashRoute('/auth/change-password'),
  onboarding: (params?: { step?: string }) => toHashRoute('/auth/onboarding' + asQueryString(params)),
  pinPrompt: (params?: { continue?: string }) =>
    toHashRoute('/auth/pin-prompt' + asQueryString({ continue: params?.continue })),

  // albums
  albums: () => toHashRoute('/albums'),
  viewAlbum: ({ id }: { id: string }, params?: { at?: string }) => toHashRoute(`/albums/${id}` + asQueryString(params)),
  viewAlbumAsset: ({ albumId, assetId }: { albumId: string; assetId: string }) =>
    toHashRoute(`/albums/${albumId}/photos/${assetId}`),

  // buy
  buy: () => toHashRoute('/buy'),

  // explore
  explore: () => toHashRoute('/explore'),
  places: () => toHashRoute('/places'),

  // folders
  folders: (params?: { path?: string }) => toHashRoute('/folders' + asQueryString(params)),

  // libraries
  libraries: () => toHashRoute('/admin/library-management'),
  newLibrary: () => toHashRoute('/admin/library-management/new'),
  viewLibrary: ({ id }: { id: string }) => toHashRoute(`/admin/library-management/${id}`),
  editLibrary: ({ id }: { id: string }) => toHashRoute(`/admin/library-management/${id}/edit`),

  // maintenance
  maintenanceMode: (params?: { continue?: string }) => toHashRoute('/maintenance' + asQueryString(params)),

  // map
  map: (point?: { zoom: number; lat: number; lng: number }) =>
    toHashRoute('/map' + asQueryString(point ? { position: `${point.zoom}/${point.lat}/${point.lng}` } : undefined)),

  // memories
  memories: (params?: { isSaved?: boolean }) => toHashRoute('/memories' + asQueryString(params)),
  viewMemory: ({ id, ...params }: { id: string; assetId?: string; isSaved?: boolean }) =>
    toHashRoute(`/memories/${id}` + asQueryString(params)),
  viewMemoryAsset: ({ id, assetId, ...params }: { id: string; assetId: string; isSaved?: boolean }) =>
    toHashRoute(`/memories/${id}/photos/${assetId}` + asQueryString({ assetId, ...params })),

  // partners
  viewPartner: ({ id }: { id: string }) => toHashRoute(`/partners/${id}`),

  // people
  managePeople: () => toHashRoute('/people/manage'),
  people: () => toHashRoute('/people'),
  viewPerson: ({ id }: { id: string }, params?: { previousRoute?: string; action?: 'merge' }) =>
    toHashRoute(`/people/${id}` + asQueryString(params)),

  // photos
  photos: (params?: { at?: string }) => toHashRoute('/photos' + asQueryString(params)),
  viewAsset: ({ id }: { id: string }) => toHashRoute(`/photos/${id}`),
  archive: () => toHashRoute('/archive'),
  favorites: () => toHashRoute('/favorites'),
  locked: () => toHashRoute('/locked'),
  trash: () => toHashRoute('/trash'),
  viewTrashedAsset: ({ id }: { id: string }) => toHashRoute(`/trash/photos/${id}`),
  recentlyAdded: () => toHashRoute('/recently-added'),

  // search
  search: (dto?: MetadataSearchDto | SmartSearchDto) => toHashRoute('/search' + asSearchQuery(dto)),
  viewSearchAsset: ({ id }: { id: string }, dto?: MetadataSearchDto | SmartSearchDto) =>
    toHashRoute(`/search/photos/${id}` + asSearchQuery(dto)),

  // sharing
  sharing: () => toHashRoute('/sharing'),

  // shared links
  sharedLinks: (params?: { filter?: SharedLinkTab }) => toHashRoute('/shared-links' + asQueryString(params)),
  editSharedLink: ({ id }: { id: string }) => toHashRoute(`/shared-links/${id}/edit`),
  viewSharedLink: ({ slug, key }: { slug?: string | null; key: string }) =>
    toHashRoute(slug ? `/s/${encodeURIComponent(slug)}` : `/share/${key}`),

  // settings
  userSettings: (params?: { isOpen?: OpenQueryParam }) => toHashRoute('/user-settings' + asQueryString(params)),

  // system
  systemSettings: (params?: { isOpen?: OpenQueryParam }) =>
    toHashRoute('/admin/system-settings' + asQueryString(params)),
  systemStatistics: () => toHashRoute('/admin/server-status'),
  systemMaintenance: (params?: { continue?: string }) => toHashRoute('/admin/maintenance' + asQueryString(params)),
  systemMaintenanceIntegrityReport: ({ reportType }: { reportType: IntegrityReport }) =>
    toHashRoute(`/admin/maintenance/integrity-report/${reportType}`),

  // tags
  tags: (params?: { path?: string }) => toHashRoute('/tags' + asQueryString(params)),

  // users
  users: () => toHashRoute('/admin/users'),
  newUser: () => toHashRoute(`/admin/users/new`),
  viewUser: ({ id }: { id: string }) => toHashRoute(`/admin/users/${id}`),
  editUser: ({ id }: { id: string }) => toHashRoute(`/admin/users/${id}/edit`),

  // utilities
  utilities: () => toHashRoute('/utilities'),
  duplicatesUtility: (params?: { index?: number }) => toHashRoute('/utilities/duplicates' + asQueryString(params)),
  largeFileUtility: () => toHashRoute('/utilities/large-files'),
  geolocationUtility: () => toHashRoute('/utilities/geolocation'),

  // workflows
  workflows: () => toHashRoute('/workflows'),
  viewWorkflow: ({ id }: { id: string }) => toHashRoute(`/workflows/${id}`),

  // backups
  backups: () => toHashRoute('/admin/backups'),
  backupSettings: () => toHashRoute('/admin/backups/settings'),
  backupAttempts: () => toHashRoute('/admin/backups/attempts'),
  backupSnapshots: () => toHashRoute('/admin/backups/snapshots'),

  // queues
  queues: () => toHashRoute('/admin/queues'),
  viewQueue: ({ name }: { name: QueueName }) => toHashRoute(`/admin/queues/${asQueueSlug(name)}`),

  // continue helper for ensuring same-origin URLs
  continue: (url: string | null, fallback: string): string | URL => {
    const resolved = appUrl(url ?? fallback);

    if (resolved.origin !== location.origin) {
      return fallback;
    }

    // Accept legacy same-origin paths, but always stay in the hash router.
    return resolved.hash.startsWith('#/') ? resolved : appUrl(toHashRoute(resolved.pathname + resolved.search));
  },
};

export const ExternalRoute = {
  docs: () => 'https://docs.immich.app/overview/quick-start',
};

export const ApiRoute = {
  // integrity checks
  integrityReportFile: (reportId: string) => `${getBaseUrl()}/admin/integrity/report/${reportId}/file`,
  integrityReportCsv: (reportType: IntegrityReport) => `${getBaseUrl()}/admin/integrity/report/${reportType}/csv`,
};
