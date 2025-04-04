const { IService } = require('../core/IService');
const FileSystemRepository = require('./FileSystemRepository');
const path = require('path');

/**
 * Service for data storage and retrieval
 */
class StorageService extends IService {
  /**
   * Create a new storage service
   * @param {Object} dependencies - Service dependencies
   * @param {Object} dependencies.logger - Logger instance
   * @param {Object} dependencies.settingsService - Settings service
   */
  constructor(dependencies = {}) {
    super();
    this.logger = dependencies.logger || console;
    this.settingsService = dependencies.settingsService;
    this.repository = null;
  }

  /**
   * Get service name
   * @returns {string} - Service name
   */
  getName() {
    return 'StorageService';
  }

  /**
   * Initialize the service
   */
  async initialize() {
    this.logger.info('Initializing storage service');
    
    // Get storage settings or use defaults
    let settings = { storagePath: './data' };
    
    try {
      if (this.settingsService) {
        const storedSettings = await this.settingsService.getSettings('storage');
        if (storedSettings) {
          settings = { ...settings, ...storedSettings };
        }
      }
    } catch (error) {
      this.logger.warn('Could not load storage settings, using defaults', error);
    }

    // If path is relative, resolve it from current working directory
    let storagePath = settings.storagePath;
    if (!path.isAbsolute(storagePath)) {
      storagePath = path.join(process.cwd(), storagePath);
    }
    
    // Create repository
    this.repository = new FileSystemRepository({
      basePath: storagePath,
      logger: this.logger
    });
    
    // Initialize repository
    await this.repository.initialize();
    
    this.logger.info('Storage service initialized with repository at:', storagePath);
  }

  /**
   * Start the service
   */
  async start() {
    this.logger.info('Starting storage service');
    // Nothing specific to start since the repository is already initialized
  }

  /**
   * Stop the service
   */
  async stop() {
    this.logger.info('Stopping storage service');
    // Perform any cleanup needed
  }

  /**
   * Shut down the service
   */
  async shutdown() {
    this.logger.info('Shutting down storage service');
    // Final cleanup
  }

  // Public API methods

  /**
   * Save an entity
   * @param {string} entityType - Type of entity
   * @param {Object} entity - Entity to save
   * @param {Object} [options] - Save options
   * @returns {Promise<Object>} - Saved entity
   */
  async saveEntity(entityType, entity, options = {}) {
    this.logger.debug(`Saving ${entityType} entity`, { id: entity.id });
    return this.repository.save(entityType, entity, options);
  }

  /**
   * Get entity by ID
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @param {Object} [options] - Retrieval options
   * @returns {Promise<Object|null>} - Entity or null
   */
  async getEntityById(entityType, id, options = {}) {
    this.logger.debug(`Getting ${entityType} entity by ID`, { id });
    return this.repository.getById(entityType, id, options);
  }

  /**
   * Query for entities
   * @param {string} entityType - Type of entity
   * @param {Object} criteria - Query criteria
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} - Matching entities
   */
  async queryEntities(entityType, criteria, options = {}) {
    this.logger.debug(`Querying ${entityType} entities`, { criteria, options });
    return this.repository.query(entityType, criteria, options);
  }

  /**
   * Delete entity
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @param {Object} [options] - Delete options
   * @returns {Promise<boolean>} - Success status
   */
  async deleteEntity(entityType, id, options = {}) {
    this.logger.debug(`Deleting ${entityType} entity`, { id });
    return this.repository.delete(entityType, id, options);
  }

  /**
   * Count entities
   * @param {string} entityType - Type of entity
   * @param {Object} criteria - Query criteria
   * @returns {Promise<number>} - Count of matching entities
   */
  async countEntities(entityType, criteria = {}) {
    this.logger.debug(`Counting ${entityType} entities`, { criteria });
    return this.repository.count(entityType, criteria);
  }

  /**
   * Save multiple entities
   * @param {string} entityType - Type of entity
   * @param {Array<Object>} entities - Entities to save
   * @param {Object} [options] - Save options
   * @returns {Promise<Array<Object>>} - Saved entities
   */
  async saveBulkEntities(entityType, entities, options = {}) {
    this.logger.debug(`Bulk saving ${entityType} entities`, { count: entities.length });
    return this.repository.bulkSave(entityType, entities, options);
  }
  
  /**
   * Get repository instance (for advanced operations)
   * @returns {IStorageRepository} - Repository instance
   */
  getRepository() {
    return this.repository;
  }
  
  /**
   * Get storage metrics
   * @returns {Promise<Object>} - Storage metrics
   */
  async getMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      entityCounts: {}
    };
    
    // Get entity types from repository's index cache
    const entityTypes = Array.from(this.repository.indexCache.keys());
    
    // Count each entity type
    for (const entityType of entityTypes) {
      const count = await this.countEntities(entityType);
      metrics.entityCounts[entityType] = count;
    }
    
    return metrics;
  }
}

module.exports = StorageService;
