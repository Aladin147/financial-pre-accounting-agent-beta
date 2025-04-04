const StorageService = require('./StorageService');
const FileSystemRepository = require('./FileSystemRepository');
const IStorageRepository = require('./IStorageRepository');

/**
 * Register the storage service with the service registry
 * @param {Object} registry - Service registry
 * @param {Object} dependencies - Service dependencies
 */
function registerStorageService(registry, dependencies = {}) {
  if (!registry) {
    throw new Error('Service registry is required');
  }

  // Create and register the storage service
  const storageService = new StorageService({
    logger: dependencies.logger,
    settingsService: registry.getService('SettingsService')
  });

  registry.registerService(storageService);

  return storageService;
}

module.exports = {
  StorageService,
  FileSystemRepository,
  IStorageRepository,
  registerStorageService
};
