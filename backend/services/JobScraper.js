/*
============================================================================
FILE: backend/services/JobScraper.js
============================================================================
PURPOSE:
  Service for scraping job postings from intern-list.com and other sources.
  Handles web scraping, data extraction, and job posting storage.

FEATURES:
  - Web scraping with Puppeteer for dynamic content
  - Data extraction and normalization
  - Duplicate detection and prevention
  - Rate limiting and respectful scraping
  - Error handling and retry logic
  - Support for multiple job sources
============================================================================
*/

import puppeteer from 'puppeteer';
import cheerio from 'cheerio';
import axios from 'axios';
import Job from '../models/Job.js';
import logger from '../utils/logger.js';

class JobScraper {
  constructor() {
    this.browser = null;
    this.isScraping = false;
    this.scrapedCount = 0;
    this.errorCount = 0;
    this.maxConcurrent = 3;
    this.delayBetweenRequests = 2000; // 2 seconds
  }

  /**
   * Initialize the scraper with browser instance
   */
  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      logger.info('Job scraper initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize job scraper:', error);
      throw error;
    }
  }

  /**
   * Close the browser instance
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Job scraper closed');
    }
  }

  /**
   * Main scraping method - scrapes all configured sources
   */
  async scrapeAllSources() {
    if (this.isScraping) {
      logger.warn('Scraping already in progress, skipping...');
      return;
    }

    this.isScraping = true;
    this.scrapedCount = 0;
    this.errorCount = 0;

    try {
      logger.info('Starting job scraping process...');
      
      // Scrape intern-list.com
      await this.scrapeInternList();
      
      // Add other sources here as needed
      // await this.scrapeLinkedIn();
      // await this.scrapeIndeed();
      
      logger.info(`Job scraping completed. Scraped: ${this.scrapedCount}, Errors: ${this.errorCount}`);
      
    } catch (error) {
      logger.error('Error during job scraping:', error);
      throw error;
    } finally {
      this.isScraping = false;
    }
  }

  /**
   * Scrape jobs from intern-list.com
   */
  async scrapeInternList() {
    try {
      logger.info('Scraping intern-list.com...');
      
      const page = await this.browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to the main page
      await page.goto('https://www.intern-list.com/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for job listings to load
      await page.waitForSelector('.job-listing, .internship-card, [data-testid="job-card"]', { 
        timeout: 10000 
      });
      
      // Get all job links
      const jobLinks = await page.evaluate(() => {
        const links = [];
        const selectors = [
          'a[href*="/job/"]',
          'a[href*="/internship/"]',
          '.job-listing a',
          '.internship-card a',
          '[data-testid="job-card"] a'
        ];
        
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(link => {
            const href = link.getAttribute('href');
            if (href && !links.includes(href)) {
              links.push(href.startsWith('http') ? href : `https://www.intern-list.com${href}`);
            }
          });
        });
        
        return links;
      });
      
      logger.info(`Found ${jobLinks.length} job links on intern-list.com`);
      
      // Scrape each job individually
      for (let i = 0; i < jobLinks.length; i++) {
        try {
          const jobUrl = jobLinks[i];
          logger.info(`Scraping job ${i + 1}/${jobLinks.length}: ${jobUrl}`);
          
          await this.scrapeJobFromUrl(page, jobUrl);
          
          // Rate limiting
          if (i < jobLinks.length - 1) {
            await this.delay(this.delayBetweenRequests);
          }
          
        } catch (error) {
          logger.error(`Error scraping job ${i + 1}:`, error);
          this.errorCount++;
        }
      }
      
      await page.close();
      
    } catch (error) {
      logger.error('Error scraping intern-list.com:', error);
      throw error;
    }
  }

  /**
   * Scrape individual job from URL
   */
  async scrapeJobFromUrl(page, jobUrl) {
    try {
      await page.goto(jobUrl, { 
        waitUntil: 'networkidle2',
        timeout: 15000 
      });
      
      // Extract job data
      const jobData = await page.evaluate(() => {
        const getTextContent = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : '';
        };
        
        const getAttribute = (selector, attr) => {
          const element = document.querySelector(selector);
          return element ? element.getAttribute(attr) : '';
        };
        
        const getAllText = (selector) => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => el.textContent.trim()).join(' ');
        };
        
        // Try multiple selectors for each field
        const title = getTextContent('h1, .job-title, .internship-title, [data-testid="job-title"]') ||
                     getTextContent('.title, .position-title');
        
        const company = getTextContent('.company, .company-name, [data-testid="company-name"]') ||
                       getTextContent('.employer, .organization');
        
        const location = getTextContent('.location, .job-location, [data-testid="location"]') ||
                        getTextContent('.address, .city');
        
        const description = getAllText('.description, .job-description, .internship-description, [data-testid="description"]') ||
                           getAllText('.content, .details, .requirements');
        
        const applicationUrl = getAttribute('a[href*="apply"], .apply-button', 'href') ||
                              getAttribute('.application-link, .apply-link', 'href') ||
                              window.location.href;
        
        const postedDate = getTextContent('.posted, .date, .posted-date, [data-testid="posted-date"]') ||
                          getTextContent('.created, .published');
        
        // Extract requirements/skills
        const requirements = [];
        const requirementSelectors = [
          '.requirements li',
          '.skills li',
          '.qualifications li',
          '.requirements p',
          '.skills p'
        ];
        
        requirementSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length > 3) {
              requirements.push(text);
            }
          });
        });
        
        // Determine job type and category
        const jobType = window.location.href.includes('internship') ? 'internship' : 'full-time';
        
        let category = 'other';
        const categoryKeywords = {
          'software-engineering': ['software', 'developer', 'engineer', 'programming', 'coding'],
          'data-science': ['data', 'analyst', 'scientist', 'machine learning', 'ai'],
          'marketing': ['marketing', 'social media', 'content', 'brand'],
          'design': ['design', 'ui', 'ux', 'graphic', 'creative'],
          'finance': ['finance', 'accounting', 'banking', 'investment'],
          'consulting': ['consulting', 'strategy', 'management', 'advisory']
        };
        
        const textToCheck = `${title} ${company} ${description}`.toLowerCase();
        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
          if (keywords.some(keyword => textToCheck.includes(keyword))) {
            category = cat;
            break;
          }
        }
        
        return {
          title,
          company,
          location,
          description,
          applicationUrl,
          postedDate,
          requirements,
          jobType,
          category,
          sourceUrl: window.location.href
        };
      });
      
      // Validate extracted data
      if (!jobData.title || !jobData.company || !jobData.description) {
        logger.warn(`Incomplete job data for ${jobUrl}:`, jobData);
        return;
      }
      
      // Create source ID from URL
      const sourceId = `intern-list-${jobUrl.split('/').pop()}`;
      
      // Check if job already exists
      const existingJob = await Job.findOne({ sourceId });
      if (existingJob) {
        logger.info(`Job already exists: ${sourceId}`);
        return;
      }
      
      // Parse posted date
      let parsedPostedDate = new Date();
      if (jobData.postedDate) {
        const dateMatch = jobData.postedDate.match(/(\d+)\s*(day|week|month|year)s?\s*ago/i);
        if (dateMatch) {
          const amount = parseInt(dateMatch[1]);
          const unit = dateMatch[2].toLowerCase();
          const now = new Date();
          
          switch (unit) {
            case 'day':
              parsedPostedDate = new Date(now.getTime() - (amount * 24 * 60 * 60 * 1000));
              break;
            case 'week':
              parsedPostedDate = new Date(now.getTime() - (amount * 7 * 24 * 60 * 60 * 1000));
              break;
            case 'month':
              parsedPostedDate = new Date(now.getTime() - (amount * 30 * 24 * 60 * 60 * 1000));
              break;
            case 'year':
              parsedPostedDate = new Date(now.getTime() - (amount * 365 * 24 * 60 * 60 * 1000));
              break;
          }
        }
      }
      
      // Create job document
      const job = new Job({
        title: jobData.title,
        company: jobData.company,
        location: jobData.location || 'Not specified',
        description: jobData.description,
        shortDescription: jobData.description.substring(0, 200) + '...',
        applicationUrl: jobData.applicationUrl,
        postedDate: parsedPostedDate,
        requirements: jobData.requirements,
        skills: this.extractSkills(jobData.description + ' ' + jobData.requirements.join(' ')),
        categories: [jobData.category],
        jobType: jobData.jobType,
        source: 'intern-list',
        sourceId,
        status: 'active'
      });
      
      // Save job to database
      await job.save();
      this.scrapedCount++;
      
      logger.info(`Successfully scraped job: ${jobData.title} at ${jobData.company}`);
      
    } catch (error) {
      logger.error(`Error scraping job from ${jobUrl}:`, error);
      throw error;
    }
  }

  /**
   * Extract skills from text using keyword matching
   */
  extractSkills(text) {
    const skillKeywords = [
      // Programming languages
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'typescript', 'dart', 'scala', 'r', 'matlab', 'perl', 'haskell', 'clojure',
      
      // Web technologies
      'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'sass', 'less', 'webpack',
      
      // Databases
      'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'cassandra',
      'elasticsearch', 'neo4j', 'dynamodb',
      
      // Cloud and DevOps
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
      'terraform', 'ansible', 'chef', 'puppet', 'ci/cd', 'devops',
      
      // Data Science
      'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'spark', 'hadoop',
      'tableau', 'power bi', 'jupyter', 'r studio', 'matplotlib', 'seaborn',
      
      // Mobile
      'react native', 'flutter', 'xamarin', 'ionic', 'cordova', 'android', 'ios',
      
      // Other
      'linux', 'windows', 'macos', 'agile', 'scrum', 'kanban', 'jira', 'confluence',
      'figma', 'sketch', 'adobe', 'photoshop', 'illustrator'
    ];
    
    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    skillKeywords.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill.toLowerCase());
      }
    });
    
    return [...new Set(foundSkills)]; // Remove duplicates
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get scraping statistics
   */
  getStats() {
    return {
      isScraping: this.isScraping,
      scrapedCount: this.scrapedCount,
      errorCount: this.errorCount,
      successRate: this.scrapedCount + this.errorCount > 0 
        ? (this.scrapedCount / (this.scrapedCount + this.errorCount)) * 100 
        : 0
    };
  }
}

export default JobScraper;

