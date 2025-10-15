/*
============================================================================
FILE: backend/services/CacheService.js
============================================================================
PURPOSE:
  Redis-based caching service for job matches, database queries, and API responses.
  Implements intelligent caching with TTL, invalidation, and performance optimization.

FEATURES:
  - Job matches caching with intelligent invalidation
  - Database query result caching
  - API response caching
  - Cache warming and preloading
  - Cache statistics and monitoring
  - Automatic cache cleanup
============================================================================
*/

import Redis from 'ioredis';
import logger from '../utils/logger.js';

class CacheService {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
    });

    // Cache key prefixes
    this.prefixes = {
      JOB_MATCHES: 'job_matches',
      JOB_DETAILS: 'job_details',
      STUDENT_PROFILE: 'student_profile',
      STUDENT_MATCHES: 'student_matches',
      API_RESPONSE: 'api_response',
      QUERY_RESULT: 'query_result'
    };

    // Default TTL values (in seconds)
    this.ttl = {
      JOB_MATCHES: 3600, // 1 hour
      JOB_DETAILS: 7200, // 2 hours
      STUDENT_PROFILE: 1800, // 30 minutes
      STUDENT_MATCHES: 1800, // 30 minutes
      API_RESPONSE: 900, // 15 minutes
      QUERY_RESULT: 1800 // 30 minutes
    };

    this.setupEventHandlers();
  }

  /**
   * Setup Redis event handlers
   */
  setupEventHandlers() {
    this.redis.on('connect', () => {
      logger.info('Redis cache connected successfully');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis cache error:', error);
    });

    this.redis.on('close', () => {
      logger.warn('Redis cache connection closed');
    });

    this.redis.on('reconnecting', () => {
      logger.info('Redis cache reconnecting...');
    });
  }

  /**
   * Generate cache key
   * @param {string} prefix - Key prefix
   * @param {string} identifier - Unique identifier
   * @param {Object} params - Additional parameters
   * @returns {string} - Cache key
   */
  generateKey(prefix, identifier, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return paramString 
      ? `${prefix}:${identifier}:${paramString}` 
      : `${prefix}:${identifier}`;
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<Object|null>} - Cached value or null
   */
  async get(key) {
    try {
      const value = await this.redis.get(key);
      if (value) {
        const parsed = JSON.parse(value);
        logger.debug(`Cache hit for key: ${key}`);
        return parsed;
      }
      logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {Object} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = null) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      logger.debug(`Cache set for key: ${key} (TTL: ${ttl || 'none'})`);
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    try {
      const result = await this.redis.del(key);
      logger.debug(`Cache delete for key: ${key} (deleted: ${result})`);
      return result > 0;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * @param {string} pattern - Key pattern
   * @returns {Promise<number>} - Number of keys deleted
   */
  async delPattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        const result = await this.redis.del(...keys);
        logger.debug(`Cache pattern delete: ${pattern} (deleted: ${result} keys)`);
        return result;
      }
      return 0;
    } catch (error) {
      logger.error(`Cache pattern delete error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Exists status
   */
  async exists(key) {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL for key
   * @param {string} key - Cache key
   * @returns {Promise<number>} - TTL in seconds (-1 if no TTL, -2 if key doesn't exist)
   */
  async ttl(key) {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Cache job matches for student
   * @param {string} studentId - Student ID
   * @param {Object} params - Query parameters
   * @param {Array} matches - Job matches data
   * @returns {Promise<boolean>} - Success status
   */
  async cacheJobMatches(studentId, params, matches) {
    const key = this.generateKey(this.prefixes.JOB_MATCHES, studentId, params);
    return await this.set(key, {
      matches,
      cachedAt: new Date().toISOString(),
      studentId,
      params
    }, this.ttl.JOB_MATCHES);
  }

  /**
   * Get cached job matches for student
   * @param {string} studentId - Student ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array|null>} - Cached matches or null
   */
  async getCachedJobMatches(studentId, params) {
    const key = this.generateKey(this.prefixes.JOB_MATCHES, studentId, params);
    const cached = await this.get(key);
    return cached ? cached.matches : null;
  }

  /**
   * Cache job details
   * @param {string} jobId - Job ID
   * @param {Object} jobDetails - Job details data
   * @returns {Promise<boolean>} - Success status
   */
  async cacheJobDetails(jobId, jobDetails) {
    const key = this.generateKey(this.prefixes.JOB_DETAILS, jobId);
    return await this.set(key, {
      ...jobDetails,
      cachedAt: new Date().toISOString()
    }, this.ttl.JOB_DETAILS);
  }

  /**
   * Get cached job details
   * @param {string} jobId - Job ID
   * @returns {Promise<Object|null>} - Cached job details or null
   */
  async getCachedJobDetails(jobId) {
    const key = this.generateKey(this.prefixes.JOB_DETAILS, jobId);
    return await this.get(key);
  }

  /**
   * Cache student profile
   * @param {string} studentId - Student ID
   * @param {Object} profile - Student profile data
   * @returns {Promise<boolean>} - Success status
   */
  async cacheStudentProfile(studentId, profile) {
    const key = this.generateKey(this.prefixes.STUDENT_PROFILE, studentId);
    return await this.set(key, {
      ...profile,
      cachedAt: new Date().toISOString()
    }, this.ttl.STUDENT_PROFILE);
  }

  /**
   * Get cached student profile
   * @param {string} studentId - Student ID
   * @returns {Promise<Object|null>} - Cached profile or null
   */
  async getCachedStudentProfile(studentId) {
    const key = this.generateKey(this.prefixes.STUDENT_PROFILE, studentId);
    return await this.get(key);
  }

  /**
   * Cache API response
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @param {Object} response - API response data
   * @param {number} ttl - Custom TTL
   * @returns {Promise<boolean>} - Success status
   */
  async cacheApiResponse(endpoint, params, response, ttl = null) {
    const key = this.generateKey(this.prefixes.API_RESPONSE, endpoint, params);
    return await this.set(key, {
      ...response,
      cachedAt: new Date().toISOString()
    }, ttl || this.ttl.API_RESPONSE);
  }

  /**
   * Get cached API response
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {Promise<Object|null>} - Cached response or null
   */
  async getCachedApiResponse(endpoint, params) {
    const key = this.generateKey(this.prefixes.API_RESPONSE, endpoint, params);
    return await this.get(key);
  }

  /**
   * Invalidate job matches cache for student
   * @param {string} studentId - Student ID
   * @returns {Promise<number>} - Number of keys deleted
   */
  async invalidateJobMatches(studentId) {
    const pattern = `${this.prefixes.JOB_MATCHES}:${studentId}*`;
    return await this.delPattern(pattern);
  }

  /**
   * Invalidate job details cache
   * @param {string} jobId - Job ID
   * @returns {Promise<boolean>} - Success status
   */
  async invalidateJobDetails(jobId) {
    const key = this.generateKey(this.prefixes.JOB_DETAILS, jobId);
    return await this.del(key);
  }

  /**
   * Invalidate student profile cache
   * @param {string} studentId - Student ID
   * @returns {Promise<boolean>} - Success status
   */
  async invalidateStudentProfile(studentId) {
    const key = this.generateKey(this.prefixes.STUDENT_PROFILE, studentId);
    return await this.del(key);
  }

  /**
   * Invalidate all caches for student
   * @param {string} studentId - Student ID
   * @returns {Promise<number>} - Number of keys deleted
   */
  async invalidateStudentCaches(studentId) {
    const patterns = [
      `${this.prefixes.JOB_MATCHES}:${studentId}*`,
      `${this.prefixes.STUDENT_PROFILE}:${studentId}`,
      `${this.prefixes.STUDENT_MATCHES}:${studentId}*`
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      totalDeleted += await this.delPattern(pattern);
    }

    return totalDeleted;
  }

  /**
   * Warm up cache with frequently accessed data
   * @param {Array} studentIds - Student IDs to warm up
   * @returns {Promise<Object>} - Warming results
   */
  async warmUpCache(studentIds) {
    const results = {
      studentsProcessed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: []
    };

    for (const studentId of studentIds) {
      try {
        // Warm up student profiles
        const profileKey = this.generateKey(this.prefixes.STUDENT_PROFILE, studentId);
        const profileExists = await this.exists(profileKey);
        
        if (profileExists) {
          results.cacheHits++;
        } else {
          results.cacheMisses++;
        }

        // Warm up job matches for common queries
        const commonParams = [
          { limit: 20, sortBy: 'matchScore', sortOrder: 'desc' },
          { limit: 10, sortBy: 'postedDate', sortOrder: 'desc' },
          { status: 'new', limit: 20 }
        ];

        for (const params of commonParams) {
          const matchesKey = this.generateKey(this.prefixes.JOB_MATCHES, studentId, params);
          const matchesExist = await this.exists(matchesKey);
          
          if (matchesExist) {
            results.cacheHits++;
          } else {
            results.cacheMisses++;
          }
        }

        results.studentsProcessed++;
      } catch (error) {
        results.errors.push({ studentId, error: error.message });
        logger.error(`Cache warm-up error for student ${studentId}:`, error);
      }
    }

    logger.info(`Cache warm-up completed: ${results.studentsProcessed} students processed`);
    return results;
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} - Cache statistics
   */
  async getCacheStats() {
    try {
      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      // Parse memory info
      const memoryInfo = {};
      info.split('\r\n').forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          memoryInfo[key] = value;
        }
      });

      // Parse keyspace info
      const keyspaceInfo = {};
      keyspace.split('\r\n').forEach(line => {
        if (line.startsWith('db')) {
          const [db, info] = line.split(':');
          keyspaceInfo[db] = info;
        }
      });

      return {
        memory: memoryInfo,
        keyspace: keyspaceInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return null;
    }
  }

  /**
   * Clear all cache data
   * @returns {Promise<boolean>} - Success status
   */
  async clearAll() {
    try {
      await this.redis.flushdb();
      logger.info('All cache data cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Close Redis connection
   * @returns {Promise<void>}
   */
  async close() {
    try {
      await this.redis.quit();
      logger.info('Redis cache connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
}

export default CacheService;
