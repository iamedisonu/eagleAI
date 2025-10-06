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

USAGE:
  Import and use analyzeResume() function with PDF file and API key.
============================================================================
*/

import { GoogleGenerativeAI } from '@google/generative-ai';

const GOOGLE_AI_API_KEY = 'AIzaSyBoKAyutw0pQYkhtCgWAoQNkdhQKt7XYNI';
const PDF_CO_API_KEY = 'edison.u@eagles.oc.edu_FMWTRzjRcLn3n5uCuuUVUqJMbjJ1mJUShCcIuhjJydcBNuvNqnv4P5GjdZHRzFdb';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
 * Analyze resume text and extract bullet points
 * @param {string} text - Resume text content
 * @returns {Promise<Object>} - Analysis results with bullet points and scores
 */
export const analyzeResume = async (text) => {
  try {
        const prompt = `
            You are an expert resume reviewer with over 10 years of experience helping students across all majors land internships and full-time positions. Evaluate this resume using the universal "What, How, Why" framework and provide actionable, specific feedback tailored to the student's field and career goals.

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

            For each issue identified, provide:
            - Location: Specific section and bullet point
            - Current Problem: Describe the issue
            - Why It Matters: Explain its impact
            - Specific Fix: Suggest an improved version
            - Alternative Examples: Tailor examples by field

            Use the 10-Point Scoring System:
            - 9-10: Exceptional/Outstanding
            - 7-8: Good/Above Average
            - 5-6: Average/Acceptable
            - 3-4: Below Average/Needs Improvement
            - 1-2: Poor/Unacceptable

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
              "detailedFeedback": [
                {
                  "category": string,
                  "location": string,
                  "currentProblem": string,
                  "whyItMatters": string,
                  "specificFix": string,
                  "alternativeExamples": string,
                  "score": number (1-10)
                }
              ],
              "strengths": [string],
              "priorityImprovements": [string],
              "overallAssessment": string
            }
            `;

    console.log('Sending request to Google AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    console.log('AI Response received, length:', analysisText.length);
    console.log('Full AI Response:', analysisText);
    
    // Try to parse the JSON response first
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedAnalysis = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON analysis:', parsedAnalysis);
        
        // Return both parsed and raw response
        return {
          rawResponse: analysisText,
          parsedResponse: parsedAnalysis,
          timestamp: new Date().toISOString()
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON response:', parseError);
    }
    
    // If JSON parsing fails, return raw response
    return {
      rawResponse: analysisText,
      parsedResponse: null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume: ' + error.message);
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const contextText = response.text();
    
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
