/*
============================================================================
FILE: src/services/googleAI.js
============================================================================
PURPOSE:
  Google AI service for resume analysis using Gemini API. Provides intelligent
  feedback on resume bullet points with scoring and improvement suggestions.

FEATURES:
  - PDF text extraction
  - AI-powered bullet point analysis
  - Scoring system (1-10 scale)
  - Actionable improvement suggestions
  - Structured feedback format
  - Automatic retry logic with exponential backoff
  - Multiple model fallback (gemini-2.5-flash, gemini-1.5-flash)
  - Enhanced error handling for API overload (503) and rate limiting

RETRY LOGIC:
  - Automatically retries failed API calls up to 3 times per model
  - Uses exponential backoff (1s, 2s, 4s delays)
  - Falls back to alternative models if primary model fails
  - Handles 503 (overloaded), 429 (rate limit), and network errors
  - Provides detailed console logging for debugging

USAGE:
  Import and use analyzeResume() function with PDF file and API key.
  The service will automatically handle retries and model fallbacks.
============================================================================
*/

import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_AI_API_KEY = 'AIzaSyBoKAyutw0pQYkhtCgWAoQNkdhQKt7XYNI';
const PDF_CO_API_KEY = 'edison.u@eagles.oc.edu_FMWTRzjRcLn3n5uCuuUVUqJMbjJ1mJUShCcIuhjJydcBNuvNqnv4P5GjdZHRzFdb';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

// Available models in order of preference (v1beta API compatible)
const MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash'
];

/**
 * Sleep utility for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate delay for exponential backoff
 * @param {number} attempt - Current attempt number (0-based)
 * @returns {number} - Delay in milliseconds
 */
const calculateDelay = (attempt) => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

/**
 * Check if error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error is retryable
 */
const isRetryableError = (error) => {
  const retryableErrors = [
    '503', // Service Unavailable
    '429', // Too Many Requests
    '500', // Internal Server Error
    '502', // Bad Gateway
    '504', // Gateway Timeout
    'overloaded',
    'rate limit',
    'timeout',
    'network',
    'fetch'
  ];
  
  const nonRetryableErrors = [
    '404', // Not Found (model not available)
    'not found',
    'not supported',
    'invalid model'
  ];
  
  const errorMessage = error.message?.toLowerCase() || '';
  
  // If it's a non-retryable error, don't retry
  if (nonRetryableErrors.some(nonRetryableError => errorMessage.includes(nonRetryableError))) {
    return false;
  }
  
  // Otherwise, check if it's retryable
  return retryableErrors.some(retryableError => errorMessage.includes(retryableError));
};

/**
 * Get model with fallback
 * @param {number} modelIndex - Index of model to try
 * @returns {Object} - Google AI model instance
 */
const getModel = (modelIndex = 0) => {
  const modelName = MODELS[modelIndex] || MODELS[0];
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Check if a model is available (basic validation)
 * @param {string} modelName - Name of the model to check
 * @returns {boolean} - Whether the model name is valid
 */
const isValidModel = (modelName) => {
  // Basic validation - check if model name follows expected pattern
  return modelName && typeof modelName === 'string' && modelName.startsWith('gemini-');
};

/**
 * Upload file to PDF.co temporary storage
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Uploaded file URL
 */
const uploadFileToPDFCo = async (file) => {
  try {
    console.log('Uploading file to PDF.co...');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const uploadResponse = await fetch('https://api.pdf.co/v1/file/upload', {
      method: 'POST',
      headers: {
        'x-api-key': PDF_CO_API_KEY
      },
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`PDF.co upload error: ${uploadResponse.status} - ${errorText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('PDF.co upload response:', uploadResult);
    
    if (uploadResult.error) {
      throw new Error(`PDF.co upload failed: ${uploadResult.message}`);
    }
    
    if (!uploadResult.url) {
      throw new Error('No URL returned from PDF.co upload');
    }
    
    console.log('File uploaded successfully to PDF.co:', uploadResult.url);
    return uploadResult.url;
    
  } catch (error) {
    console.warn('PDF.co upload failed:', error.message);
    throw error;
  }
};

/**
 * Extract text from PDF using PDF.co API (two-step process)
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromPDFCo = async (file) => {
  try {
    console.log('Starting PDF.co two-step process...');
    
    // Step 1: Upload file to PDF.co
    const uploadedFileUrl = await uploadFileToPDFCo(file);
    
    // Step 2: Process the uploaded file
    console.log('Processing uploaded file with PDF.co...');
    
    const requestBody = {
      url: uploadedFileUrl,
      pages: '0-',
      async: false,
      lang: 'eng'
    };
    
    const processResponse = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': PDF_CO_API_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      throw new Error(`PDF.co processing error: ${processResponse.status} - ${errorText}`);
    }
    
    const result = await processResponse.json();
    console.log('PDF.co processing response:', result);
    
    if (result.error) {
      throw new Error(`PDF.co processing failed: ${result.message || result.error}`);
    }
    
    // PDF.co returns text in different possible fields
    let extractedText = '';
    let textUrl = null;
    
    if (result.body) {
      extractedText = result.body;
    } else if (result.text) {
      extractedText = result.text;
    } else if (result.url) {
      // If result contains a URL, we need to fetch the text content
      textUrl = result.url;
      console.log('PDF.co returned URL, fetching text content from:', textUrl);
      
      try {
        const textResponse = await fetch(textUrl);
        if (textResponse.ok) {
          extractedText = await textResponse.text();
          console.log('Successfully fetched text from URL');
        } else {
          throw new Error(`Failed to fetch text from URL: ${textResponse.status}`);
        }
      } catch (urlError) {
        console.warn('Failed to fetch text from URL:', urlError.message);
        // Fallback to using the URL as text
        extractedText = textUrl;
      }
    }
    
    if (extractedText && extractedText.trim().length > 0) {
      const finalText = extractedText.trim();
      console.log('PDF.co extraction successful!');
      console.log('Total text length:', finalText.length);
      console.log('First 200 characters:', finalText.substring(0, 200));
      
      // Return both the original response and fetched text
      return {
        originalText: textUrl || finalText,
        fetchedText: finalText,
        isUrl: !!textUrl
      };
    } else {
      throw new Error('No text content extracted from PDF');
    }
    
  } catch (error) {
    console.warn('PDF.co extraction failed:', error.message);
    console.log('PDF.co error details:', error);
    throw error;
  }
};

/**
 * Extract text from PDF file using PDF.co API
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (file) => {
  console.log('PDF file received:', file.name, 'Size:', file.size);
  
  try {
    // Validate file
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Invalid file type. Please upload a PDF file.');
    }

    if (file.size === 0) {
      throw new Error('The uploaded file is empty.');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size too large. Please upload a PDF smaller than 10MB.');
    }

    console.log('Attempting PDF parsing with PDF.co API...');
    
    // Use PDF.co API for text extraction
    const extractionResult = await extractTextFromPDFCo(file);
    
    if (extractionResult && extractionResult.fetchedText && extractionResult.fetchedText.trim().length > 0) {
      console.log('PDF parsing successful with PDF.co!');
      console.log('Total text length:', extractionResult.fetchedText.length);
      console.log('First 200 characters:', extractionResult.fetchedText.substring(0, 200));
      return extractionResult;
    } else {
      throw new Error('No text content found in the PDF. The PDF might contain only images or be corrupted.');
    }
    
  } catch (error) {
    console.error('PDF processing error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('Invalid PDF') || error.message.includes('invalid PDF')) {
      throw new Error('Invalid PDF file. Please ensure the file is a valid PDF document.');
    } else if (error.message.includes('password required') || 
               error.message.includes('password-protected') || 
               error.message.includes('authentication required') ||
               error.message.includes('encrypted PDF')) {
      throw new Error('Password-protected PDF detected. Please remove the password and try again.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network error while processing PDF. Please check your internet connection and try again.');
    } else if (error.message.includes('timeout')) {
      throw new Error('PDF processing timed out. The file might be too complex. Please try with a simpler PDF.');
    } else if (error.message.includes('PDF.co API error')) {
      throw new Error(`PDF parsing service error: ${error.message}`);
    } else {
      // For debugging, let's see what the actual error is
      console.log('Actual error details:', error);
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
      throw new Error('Failed to extract text from PDF. Please try with a different PDF file or ensure the file is not corrupted.');
    }
  }
};

/**
 * Retry wrapper for Google AI API calls
 * @param {Function} apiCall - The API call function to retry
 * @param {string} operation - Description of the operation for logging
 * @returns {Promise<any>} - The API call result
 */
const retryApiCall = async (apiCall, operation = 'API call') => {
  let lastError;
  const startTime = Date.now();
  
  for (let modelIndex = 0; modelIndex < MODELS.length; modelIndex++) {
    const model = getModel(modelIndex);
    console.log(`🔄 Trying ${operation} with model: ${MODELS[modelIndex]}`);
    
    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const result = await apiCall(model);
        const duration = Date.now() - startTime;
        console.log(`✅ ${operation} successful with model: ${MODELS[modelIndex]} (${duration}ms)`);
        return result;
      } catch (error) {
        lastError = error;
        const isRetryable = isRetryableError(error);
        const retryInfo = isRetryable ? `(retryable)` : `(not retryable)`;
        
        console.warn(`❌ ${operation} attempt ${attempt + 1} failed with model ${MODELS[modelIndex]} ${retryInfo}:`, error.message);
        
        // If this is the last attempt for this model, try the next model
        if (attempt === RETRY_CONFIG.maxRetries) {
          console.log(`🔄 All retry attempts exhausted for model ${MODELS[modelIndex]}, trying next model...`);
          break;
        }
        
        // If error is not retryable, don't retry
        if (!isRetryable) {
          console.log('🚫 Error is not retryable, failing immediately');
          throw error;
        }
        
        // Calculate delay and wait before retry
        const delay = calculateDelay(attempt);
        console.log(`⏳ Waiting ${delay}ms before retry attempt ${attempt + 2}...`);
        await sleep(delay);
      }
    }
  }
  
  // If we get here, all models and retries failed
  const totalDuration = Date.now() - startTime;
  console.error(`💥 All models and retry attempts failed for ${operation} after ${totalDuration}ms`);
  throw new Error(`All models and retry attempts failed for ${operation}. Last error: ${lastError?.message || 'Unknown error'}`);
};

/**
 * Analyze resume text and extract bullet points
 * @param {string} text - Resume text content
 * @returns {Promise<Object>} - Analysis results with bullet points and scores
 */
export const analyzeResume = async (text) => {
  try {
    console.log('Starting resume analysis...');
    console.log('Text length:', text.length);
    console.log('Text preview:', text.substring(0, 200) + '...');

    // Validate input text
    if (!text || text.trim().length === 0) {
      throw new Error('No text content provided for analysis');
    }

    if (text.length < 50) {
      throw new Error('Resume text is too short for meaningful analysis');
    }

    const prompt = `
You are an expert resume reviewer with over 10 years of experience helping students across all majors land internships and full-time positions. Evaluate this resume using the universal "What, How, Why" framework and provide actionable, specific feedback tailored to the student's field and career goals.

IMPORTANT: Today's date is ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}. Use this date to provide accurate feedback about graduation dates, experience timelines, and current industry standards.

Resume to review: "${text}"

Please analyze this resume comprehensively using the following 10 categories and provide detailed feedback:

Category 1: Bullet Point Structure (What / How / Why)
- WHAT: Each bullet point clearly states the action taken, project completed, or contribution made
- HOW: Methods, tools, skills, or approaches used are explicitly mentioned
- WHY: Impact is demonstrated through quantifiable or qualitative results

Category 2: Profile Header & Contact Information
- Full name, location, professional phone/email, LinkedIn profile
- Professional appearance and accuracy

Category 3: Education Section
- Institution, degree, major, graduation date, GPA
- Academic honors, relevant coursework, study abroad

Category 4: Experience Section (Work, Research, Internships)
- Organization, location, position, dates
- 2-4 achievement-oriented bullet points per position
- Strong action verbs, accomplishments, quantified results

Category 5: Optional Secondary Sections
- Leadership, community service, skills, projects, publications
- Relevance and specificity

Category 6: Visual Appearance & Formatting
- Clean, professional layout, consistent formatting
- Proper length, margins, font, file format

Category 7: Language & Grammar
- No errors, varied sentence structure, professional tone
- Appropriate action verbs and tense consistency

Category 8: Content Quality & Relevance
- Coherent narrative, logical progression, specificity
- Transferable skills demonstration

Category 9: Contextualization & Targeting
- Job alignment, industry appropriateness, keyword usage

Category 10: Critical Universal Standards
- Must include: Header, Education, Experience sections
- Must avoid: Personal info, references, first-person pronouns

For each issue identified, provide this exact structure:
- Location: Specific section and bullet point
- Current Problem: Quote the exact problematic text
- Why It Matters: Explain the specific impact on the resume
- Solution: Explain the general principle for improvement
- Rephrased Example: Show the exact same content rewritten better

Use the 10-Point Scoring System:
- 9-10: Exceptional/Outstanding
- 7-8: Good/Above Average
- 5-6: Average/Acceptable
- 3-4: Below Average/Needs Improvement
- 1-2: Poor/Unacceptable

IMPORTANT: For any score that is NOT 10/10, you MUST provide specific suggestions on how to improve that particular aspect to reach a perfect score. Include concrete examples and actionable steps.

Return a JSON object with this structure:
{
  "overallScore": number (1-10),
  "categoryScores": {
    "bulletPoints": number (1-10),
    "header": number (1-10),
    "education": number (1-10),
    "experience": number (1-10),
    "secondarySections": number (1-10),
    "formatting": number (1-10),
    "language": number (1-10),
    "contentQuality": number (1-10),
    "targeting": number (1-10),
    "universalStandards": number (1-10)
  },
  "improvementSuggestions": {
    "bulletPoints": string (only if score < 10),
    "header": string (only if score < 10),
    "education": string (only if score < 10),
    "experience": string (only if score < 10),
    "secondarySections": string (only if score < 10),
    "formatting": string (only if score < 10),
    "language": string (only if score < 10),
    "contentQuality": string (only if score < 10),
    "targeting": string (only if score < 10),
    "universalStandards": string (only if score < 10)
  },
  "detailedFeedback": [
    {
      "category": string,
      "location": string,
      "currentProblem": string,
      "whyItMatters": string,
      "solution": string,
      "rephrasedExample": string,
      "score": number (1-10)
    }
  ],
  "strengths": [string],
  "priorityImprovements": [string],
  "overallAssessment": string
}

CRITICAL: You must return ONLY valid JSON. Do not include any text before or after the JSON object.
`;

    console.log('Sending request to Google AI with retry logic...');
    console.log('Prompt length:', prompt.length);
    
    // Use retry wrapper for the API call
    const result = await retryApiCall(async (model) => {
      console.log(`Attempting analysis with model: ${model.model}`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }, 'resume analysis');
    
    console.log('AI Response received, length:', result.length);
    console.log('First 500 characters of response:', result.substring(0, 500));
    
    // Try to parse the JSON response
    try {
      // Clean the response text - remove any markdown formatting or extra text
      let cleanText = result.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON object in the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('Found JSON match, attempting to parse...');
        const jsonString = jsonMatch[0];
        console.log('JSON string length:', jsonString.length);
        
        const parsedAnalysis = JSON.parse(jsonString);
        console.log('Successfully parsed JSON analysis');
        
        // Validate that we have the expected structure
        if (parsedAnalysis.overallScore !== undefined && parsedAnalysis.categoryScores) {
          console.log('Valid analysis structure found');
          return {
            rawResponse: result,
            parsedResponse: parsedAnalysis,
            timestamp: new Date().toISOString()
          };
        } else {
          console.warn('Parsed JSON but missing expected structure');
          console.warn('Parsed analysis keys:', Object.keys(parsedAnalysis));
        }
      } else {
        console.warn('No JSON object found in AI response');
        console.warn('Response starts with:', cleanText.substring(0, 100));
      }
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response that failed to parse:', result.substring(0, 1000));
    }
    
    // If JSON parsing fails, create a fallback structure
    console.log('JSON parsing failed, creating fallback analysis structure...');
    
    const fallbackAnalysis = {
      overallScore: 5,
      categoryScores: {
        bulletPoints: 5,
        header: 5,
        education: 5,
        experience: 5,
        secondarySections: 5,
        formatting: 5,
        language: 5,
        contentQuality: 5,
        targeting: 5,
        universalStandards: 5
      },
      strengths: ["Resume uploaded successfully"],
      priorityImprovements: ["Analysis encountered an error - please try again"],
      overallAssessment: "Analysis completed with limited functionality. Please review the raw response for detailed feedback.",
      detailedFeedback: [{
        category: "System",
        location: "Overall",
        currentProblem: "Analysis failed to complete",
        whyItMatters: "Unable to provide detailed feedback due to technical issues",
        solution: "Please try uploading your resume again",
        rephrasedExample: "Retry the analysis process",
        score: 3
      }]
    };
    
    console.log('Created fallback analysis structure');
    
    return {
      rawResponse: result,
      parsedResponse: fallbackAnalysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    
    // Create error-specific fallback
    const errorAnalysis = {
      overallScore: 3,
      categoryScores: {
        bulletPoints: 3,
        header: 3,
        education: 3,
        experience: 3,
        secondarySections: 3,
        formatting: 3,
        language: 3,
        contentQuality: 3,
        targeting: 3,
        universalStandards: 3
      },
      strengths: ["Resume uploaded successfully"],
      priorityImprovements: ["Analysis encountered an error - please try again"],
      overallAssessment: `Analysis failed: ${error.message}`,
      detailedFeedback: [{
        category: "System",
        location: "Overall",
        currentProblem: "Analysis failed to complete",
        whyItMatters: "Unable to provide detailed feedback due to technical issues",
        solution: "Please try uploading your resume again",
        rephrasedExample: "Retry the analysis process",
        score: 3
      }]
    };
    
    return {
      rawResponse: `Error: ${error.message}`,
      parsedResponse: errorAnalysis,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Get job title and company from bullet point context
 * @param {string} text - Resume text content
 * @param {string} bulletText - Specific bullet point text
 * @returns {Promise<Object>} - Job title and company information
 */
export const extractJobContext = async (text, bulletText) => {
  try {
    const prompt = `
    From this resume text, find the job title and company name that corresponds to this bullet point:
    "${bulletText}"
    
    Resume text:
    ${text}
    
    Return a JSON object with:
    {
      "jobTitle": "Job Title",
      "company": "Company Name"
    }
    
    If you can't find specific information, use generic placeholders.
    Return only the JSON object.
    `;

    // Use retry wrapper for the API call
    const contextText = await retryApiCall(async (model) => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    }, 'job context extraction');
    
    const jsonMatch = contextText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { jobTitle: "Software Developer", company: "Company" };
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error extracting job context:', error);
    return { jobTitle: "Software Developer", company: "Company" };
  }
};
