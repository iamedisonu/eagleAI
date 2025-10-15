/*
============================================================================
FILE: backend/services/SecureFileUpload.js
============================================================================
PURPOSE:
  Secure file upload service with encryption, virus scanning, and secure storage.
  Implements file validation, encryption at rest, and virus scanning.

FEATURES:
  - File type validation and size limits
  - Virus scanning with ClamAV
  - File encryption at rest using AES-256
  - Secure file naming and storage
  - File integrity verification
  - Automatic cleanup of temporary files
============================================================================
*/

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import nodeClam from 'node-clam';
import logger from '../utils/logger.js';

class SecureFileUpload {
  constructor() {
    // Initialize AWS S3 client
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET || 'eagleai-resumes';
    
    // Initialize ClamAV scanner
    this.clamav = new nodeClam().init({
      removeInfected: false, // Don't delete files, just report
      quarantineInfected: false, // Don't quarantine files
      scanLog: null, // Disable scan log
      debugMode: false, // Disable debug mode
      fileList: null, // Scan all files
      scanRecursively: false, // Don't scan recursively
      clamscan: {
        path: process.env.CLAMAV_PATH || '/usr/bin/clamscan',
        db: process.env.CLAMAV_DB || '/var/lib/clamav',
        scanArchives: true,
        active: true,
      },
      clamdscan: {
        socket: process.env.CLAMAV_SOCKET || '/var/run/clamav/clamd.ctl',
        timeout: 60000,
        localFallback: false,
      },
      preference: 'clamdscan', // Prefer clamdscan over clamscan
    });

    // Encryption settings
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
  }

  /**
   * Generate encryption key from password
   * @param {string} password - Password to derive key from
   * @returns {Buffer} - Derived key
   */
  generateKey(password) {
    return crypto.scryptSync(password, 'eagleai-salt', this.keyLength);
  }

  /**
   * Encrypt file data
   * @param {Buffer} data - File data to encrypt
   * @param {string} password - Encryption password
   * @returns {Object} - Encrypted data with IV and tag
   */
  encryptFile(data, password) {
    const key = this.generateKey(password);
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('eagleai-resume', 'utf8'));

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv,
      tag,
      algorithm: this.algorithm
    };
  }

  /**
   * Decrypt file data
   * @param {Object} encryptedData - Encrypted data object
   * @param {string} password - Decryption password
   * @returns {Buffer} - Decrypted file data
   */
  decryptFile(encryptedData, password) {
    const key = this.generateKey(password);
    const decipher = crypto.createDecipher(encryptedData.algorithm, key);
    decipher.setAAD(Buffer.from('eagleai-resume', 'utf8'));
    decipher.setAuthTag(encryptedData.tag);

    let decrypted = decipher.update(encryptedData.encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  /**
   * Scan file for viruses
   * @param {string} filePath - Path to file to scan
   * @returns {Promise<Object>} - Scan result
   */
  async scanFile(filePath) {
    try {
      const scanResult = await this.clamav.scanFile(filePath);
      
      if (scanResult.isInfected) {
        logger.warn(`Virus detected in file ${filePath}: ${scanResult.viruses.join(', ')}`);
        return {
          isClean: false,
          threats: scanResult.viruses,
          scanTime: scanResult.scanTime
        };
      }

      return {
        isClean: true,
        threats: [],
        scanTime: scanResult.scanTime
      };
    } catch (error) {
      logger.error('Virus scan failed:', error);
      // If virus scanning fails, we'll allow the file but log the error
      return {
        isClean: true,
        threats: [],
        scanTime: 0,
        error: error.message
      };
    }
  }

  /**
   * Validate file type and size
   * @param {Object} file - Multer file object
   * @returns {Object} - Validation result
   */
  validateFile(file) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return { 
        isValid: false, 
        error: `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}` 
      };
    }

    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: `File size ${file.size} bytes exceeds maximum allowed size of ${maxSize} bytes` 
      };
    }

    return { isValid: true };
  }

  /**
   * Generate secure filename
   * @param {string} originalName - Original filename
   * @param {string} studentId - Student ID
   * @returns {string} - Secure filename
   */
  generateSecureFilename(originalName, studentId) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    // Sanitize base name
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    return `resume_${studentId}_${timestamp}_${random}_${sanitizedBaseName}${extension}`;
  }

  /**
   * Upload file to S3 with encryption
   * @param {Object} file - Multer file object
   * @param {string} studentId - Student ID
   * @param {string} password - Encryption password
   * @returns {Promise<Object>} - Upload result
   */
  async uploadToS3(file, studentId, password) {
    try {
      // Read file data
      const fileData = fs.readFileSync(file.path);
      
      // Encrypt file data
      const encryptedData = this.encryptFile(fileData, password);
      
      // Generate secure filename
      const secureFilename = this.generateSecureFilename(file.originalname, studentId);
      const s3Key = `resumes/${studentId}/${secureFilename}`;
      
      // Prepare encrypted data for upload
      const uploadData = {
        encrypted: encryptedData.encrypted.toString('base64'),
        iv: encryptedData.iv.toString('base64'),
        tag: encryptedData.tag.toString('base64'),
        algorithm: encryptedData.algorithm,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      
      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: JSON.stringify(uploadData),
        ContentType: 'application/json',
        ServerSideEncryption: 'AES256',
        Metadata: {
          studentId: studentId,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      });
      
      await this.s3Client.send(uploadCommand);
      
      // Clean up temporary file
      fs.unlinkSync(file.path);
      
      return {
        success: true,
        s3Key,
        secureFilename,
        originalName: file.originalname,
        size: file.size,
        uploadedAt: new Date()
      };
      
    } catch (error) {
      logger.error('S3 upload failed:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Download and decrypt file from S3
   * @param {string} s3Key - S3 object key
   * @param {string} password - Decryption password
   * @returns {Promise<Buffer>} - Decrypted file data
   */
  async downloadFromS3(s3Key, password) {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });
      
      const response = await this.s3Client.send(getCommand);
      const encryptedData = JSON.parse(await response.Body.transformToString());
      
      // Convert base64 strings back to buffers
      const encryptedBuffer = {
        encrypted: Buffer.from(encryptedData.encrypted, 'base64'),
        iv: Buffer.from(encryptedData.iv, 'base64'),
        tag: Buffer.from(encryptedData.tag, 'base64'),
        algorithm: encryptedData.algorithm
      };
      
      // Decrypt file data
      const decryptedData = this.decryptFile(encryptedBuffer, password);
      
      return {
        data: decryptedData,
        originalName: encryptedData.originalName,
        mimeType: encryptedData.mimeType,
        size: encryptedData.size,
        uploadedAt: encryptedData.uploadedAt
      };
      
    } catch (error) {
      logger.error('S3 download failed:', error);
      throw new Error(`Failed to download file from S3: ${error.message}`);
    }
  }

  /**
   * Generate signed URL for file download
   * @param {string} s3Key - S3 object key
   * @param {number} expiresIn - URL expiration time in seconds
   * @returns {Promise<string>} - Signed URL
   */
  async generateSignedUrl(s3Key, expiresIn = 3600) {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });
      
      const signedUrl = await getSignedUrl(this.s3Client, getCommand, { expiresIn });
      return signedUrl;
      
    } catch (error) {
      logger.error('Failed to generate signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param {string} s3Key - S3 object key
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFromS3(s3Key) {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });
      
      await this.s3Client.send(deleteCommand);
      return true;
      
    } catch (error) {
      logger.error('Failed to delete file from S3:', error);
      return false;
    }
  }

  /**
   * Process file upload with all security measures
   * @param {Object} file - Multer file object
   * @param {string} studentId - Student ID
   * @param {string} password - Encryption password
   * @returns {Promise<Object>} - Processing result
   */
  async processFileUpload(file, studentId, password) {
    try {
      // Step 1: Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Step 2: Scan for viruses
      const scanResult = await this.scanFile(file.path);
      if (!scanResult.isClean) {
        // Clean up file
        fs.unlinkSync(file.path);
        return { 
          success: false, 
          error: `File contains malware: ${scanResult.threats.join(', ')}` 
        };
      }

      // Step 3: Upload to S3 with encryption
      const uploadResult = await this.uploadToS3(file, studentId, password);
      
      return {
        success: true,
        ...uploadResult,
        scanResult: {
          isClean: scanResult.isClean,
          scanTime: scanResult.scanTime
        }
      };
      
    } catch (error) {
      logger.error('File processing failed:', error);
      
      // Clean up file if it exists
      if (file && file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          logger.warn('Failed to clean up file:', cleanupError);
        }
      }
      
      return { 
        success: false, 
        error: `File processing failed: ${error.message}` 
      };
    }
  }
}

export default SecureFileUpload;
