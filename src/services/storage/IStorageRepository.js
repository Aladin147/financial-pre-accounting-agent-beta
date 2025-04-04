/**
 * Base interface for all storage repositories
 * @interface
 */
class IStorageRepository {
  /**
   * Save an entity to storage
   * @param {string} entityType - Type of entity (e.g., "report", "document", "invoice")
   * @param {Object} entity - The entity to save
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object>} - The saved entity with any generated fields
   */
  async save(entityType, entity, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Retrieve an entity by ID
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @param {Object} [options] - Additional options
   * @returns {Promise<Object|null>} - The entity or null if not found
   */
  async getById(entityType, id, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Query for entities matching criteria
   * @param {string} entityType - Type of entity
   * @param {Object} criteria - Query criteria
   * @param {Object} [options] - Additional options like sorting, pagination
   * @returns {Promise<Array<Object>>} - Matching entities
   */
  async query(entityType, criteria, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Delete an entity
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @param {Object} [options] - Additional options
   * @returns {Promise<boolean>} - Success status
   */
  async delete(entityType, id, options = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Count entities matching criteria
   * @param {string} entityType - Type of entity
   * @param {Object} [criteria] - Query criteria
   * @returns {Promise<number>} - Count of matching entities
   */
  async count(entityType, criteria = {}) {
    throw new Error("Method not implemented");
  }

  /**
   * Bulk operation to save multiple entities
   * @param {string} entityType - Type of entity
   * @param {Array<Object>} entities - Entities to save
   * @param {Object} [options] - Additional options
   * @returns {Promise<Array<Object>>} - The saved entities
   */
  async bulkSave(entityType, entities, options = {}) {
    throw new Error("Method not implemented");
  }
}

module.exports = IStorageRepository;
