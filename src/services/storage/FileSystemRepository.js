const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const IStorageRepository = require('./IStorageRepository');

/**
 * Implementation of storage repository using the local file system
 */
class FileSystemRepository extends IStorageRepository {
  /**
   * Create a new file system repository
   * @param {Object} options - Repository options
   * @param {string} options.basePath - Base directory for storage
   * @param {Object} options.logger - Logger instance
   */
  constructor(options = {}) {
    super();
    this.basePath = options.basePath || path.join(process.cwd(), 'data');
    this.logger = options.logger || console;
    this.indexCache = new Map(); // In-memory cache of indexes
  }

  /**
   * Initialize the repository
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Ensure base directory exists
      await fs.mkdir(this.basePath, { recursive: true });
      
      // Create entity type directories
      const entityTypes = ['documents', 'reports', 'invoices', 'transactions', 'settings', 'exports'];
      await Promise.all(entityTypes.map(type => 
        fs.mkdir(path.join(this.basePath, type), { recursive: true })
      ));
      
      // Load indexes into memory for faster querying
      await this._initializeIndexes(entityTypes);
      
      this.logger.info('File system repository initialized:', this.basePath);
    } catch (error) {
      this.logger.error('Failed to initialize repository:', error);
      throw error;
    }
  }

  /**
   * Save an entity to the file system
   * @param {string} entityType - Type of entity
   * @param {Object} entity - The entity to save
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} - The saved entity
   */
  async save(entityType, entity, options = {}) {
    try {
      // Ensure entity has an ID
      if (!entity.id) {
        entity.id = this._generateId();
      }
      
      // Add metadata
      const now = new Date();
      if (!entity.createdAt) {
        entity.createdAt = now.toISOString();
      }
      entity.updatedAt = now.toISOString();
      
      // Add version tracking
      entity.version = (entity.version || 0) + 1;
      
      // Ensure directory exists
      const entityDir = path.join(this.basePath, entityType);
      await fs.mkdir(entityDir, { recursive: true });
      
      // Write to file
      const filePath = path.join(entityDir, `${entity.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(entity, null, 2), 'utf8');
      
      // Update in-memory index
      await this._updateIndex(entityType, entity);
      
      return entity;
    } catch (error) {
      this.logger.error(`Error saving ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve an entity by ID
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object|null>} - The entity or null if not found
   */
  async getById(entityType, id, options = {}) {
    try {
      const filePath = path.join(this.basePath, entityType, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // File doesn't exist
      }
      this.logger.error(`Error retrieving ${entityType}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Query for entities matching criteria
   * @param {string} entityType - Type of entity
   * @param {Object} criteria - Query criteria
   * @param {Object} [options] - Additional options like sorting, pagination
   * @returns {Promise<Array<Object>>} - Matching entities
   */
  async query(entityType, criteria = {}, options = {}) {
    try {
      const { limit, skip, sort } = options;
      
      // Use in-memory index for faster queries
      let results = this._queryIndex(entityType, criteria);
      
      // Apply sorting if specified
      if (sort) {
        const [field, direction] = Object.entries(sort)[0];
        const sortMod = direction === -1 ? -1 : 1;
        results.sort((a, b) => {
          if (a[field] < b[field]) return -1 * sortMod;
          if (a[field] > b[field]) return 1 * sortMod;
          return 0;
        });
      }
      
      // Apply pagination
      if (skip) {
        results = results.slice(skip);
      }
      if (limit) {
        results = results.slice(0, limit);
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Error querying ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Delete an entity
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @param {Object} [options] - Additional options
   * @returns {Promise<boolean>} - Success status
   */
  async delete(entityType, id, options = {}) {
    try {
      const filePath = path.join(this.basePath, entityType, `${id}.json`);
      await fs.unlink(filePath);
      
      // Update index
      await this._removeFromIndex(entityType, id);
      
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false; // File doesn't exist
      }
      this.logger.error(`Error deleting ${entityType}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Count entities matching criteria
   * @param {string} entityType - Type of entity
   * @param {Object} [criteria] - Query criteria
   * @returns {Promise<number>} - Count of matching entities
   */
  async count(entityType, criteria = {}) {
    try {
      const results = await this.query(entityType, criteria);
      return results.length;
    } catch (error) {
      this.logger.error(`Error counting ${entityType}:`, error);
      throw error;
    }
  }

  /**
   * Bulk operation to save multiple entities
   * @param {string} entityType - Type of entity
   * @param {Array<Object>} entities - Entities to save
   * @param {Object} [options] - Additional options
   * @returns {Promise<Array<Object>>} - The saved entities
   */
  async bulkSave(entityType, entities, options = {}) {
    try {
      const savedEntities = [];
      
      for (const entity of entities) {
        const savedEntity = await this.save(entityType, entity, options);
        savedEntities.push(savedEntity);
      }
      
      return savedEntities;
    } catch (error) {
      this.logger.error(`Error bulk saving ${entityType}:`, error);
      throw error;
    }
  }

  // Private methods for managing indexes
  
  /**
   * Initialize indexes for faster querying
   * @private
   */
  async _initializeIndexes(entityTypes) {
    for (const type of entityTypes) {
      const typeDir = path.join(this.basePath, type);
      try {
        const files = await fs.readdir(typeDir);
        const entities = [];
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            try {
              const data = await fs.readFile(path.join(typeDir, file), 'utf8');
              entities.push(JSON.parse(data));
            } catch (err) {
              this.logger.warn(`Error reading ${file}:`, err);
            }
          }
        }
        
        this.indexCache.set(type, entities);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          this.logger.error(`Error initializing index for ${type}:`, err);
        }
        this.indexCache.set(type, []);
      }
    }
  }

  /**
   * Update the in-memory index with a new or updated entity
   * @private
   */
  async _updateIndex(entityType, entity) {
    if (!this.indexCache.has(entityType)) {
      this.indexCache.set(entityType, []);
    }
    
    const entities = this.indexCache.get(entityType);
    const existingIndex = entities.findIndex(e => e.id === entity.id);
    
    if (existingIndex >= 0) {
      entities[existingIndex] = entity;
    } else {
      entities.push(entity);
    }
  }

  /**
   * Remove an entity from the in-memory index
   * @private
   */
  async _removeFromIndex(entityType, id) {
    if (!this.indexCache.has(entityType)) return;
    
    const entities = this.indexCache.get(entityType);
    const index = entities.findIndex(e => e.id === id);
    
    if (index >= 0) {
      entities.splice(index, 1);
    }
  }

  /**
   * Query the in-memory index
   * @private
   */
  _queryIndex(entityType, criteria) {
    if (!this.indexCache.has(entityType)) {
      return [];
    }
    
    const entities = this.indexCache.get(entityType);
    
    // Simple criteria matching
    return entities.filter(entity => {
      for (const [key, value] of Object.entries(criteria)) {
        // Handle nested properties using dot notation (e.g., "user.name")
        const keys = key.split('.');
        let currentValue = entity;
        
        for (const k of keys) {
          if (currentValue === null || currentValue === undefined) {
            return false;
          }
          currentValue = currentValue[k];
        }
        
        if (value instanceof RegExp) {
          if (!value.test(String(currentValue))) {
            return false;
          }
        } else if (Array.isArray(value)) {
          // $in operator - match any value in array
          if (!value.includes(currentValue)) {
            return false;
          }
        } else if (value !== currentValue) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Generate a unique ID
   * @private
   */
  _generateId() {
    return crypto.randomBytes(16).toString('hex');
  }
}

module.exports = FileSystemRepository;
