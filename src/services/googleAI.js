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
import { PDFDocument } from 'pdf-lib';

const API_KEY = 'AIzaSyBoKAyutw0pQYkhtCgWAoQNkdhQKt7XYNI';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Extract text from PDF using pdf-lib and raw text extraction
 * @param {ArrayBuffer} arrayBuffer - PDF file data
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromPDFLib = async (arrayBuffer) => {
  try {
    console.log('Attempting PDF parsing with pdf-lib...');
    
    // Load PDF document
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    console.log('PDF loaded successfully. Pages:', pageCount);
    
    let fullText = '';
    let pagesWithText = 0;
    
    // Extract text from all pages
    for (let i = 0; i < pageCount; i++) {
      try {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        console.log(`Processing page ${i + 1}/${pageCount} (${width}x${height})`);
        
        // Get page content stream
        const contentStream = page.node.get('Contents');
        if (contentStream) {
          // Extract text from content stream
          const textContent = await extractTextFromStream(contentStream);
          if (textContent && textContent.trim().length > 0) {
            fullText += textContent + '\n';
            pagesWithText++;
            console.log(`Page ${i + 1} text length:`, textContent.length);
          }
        }
      } catch (pageError) {
        console.warn(`Error processing page ${i + 1}:`, pageError.message);
        // Continue with other pages
      }
    }
    
    console.log(`pdf-lib extraction completed. Pages with text: ${pagesWithText}/${pageCount}`);
    return fullText.trim();
  } catch (error) {
    console.warn('pdf-lib extraction failed:', error.message);
    console.log('pdf-lib error details:', error);
    
    // Check if it's a specific error type - be more precise
    if (error.message.includes('password required') || 
        error.message.includes('encrypted') || 
        error.message.includes('password-protected') ||
        error.message.includes('authentication required')) {
      throw new Error('Password-protected or encrypted PDF detected');
    }
    
    return '';
  }
};

/**
 * Extract text from PDF content stream
 * @param {Object} contentStream - PDF content stream
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromStream = async (contentStream) => {
  try {
    // Get the stream data
    const streamData = contentStream.get('stream') || contentStream;
    let text = '';
    
    if (streamData && streamData.bytes) {
      // Decode the stream data
      const decoded = new TextDecoder('utf-8', { fatal: false }).decode(streamData.bytes);
      
      // Extract text between BT and ET markers (PDF text objects)
      const textMatches = decoded.match(/BT\s+.*?ET/gs);
      if (textMatches) {
        for (const match of textMatches) {
          // Extract text between parentheses
          const textInParens = match.match(/\(([^)]+)\)/g);
          if (textInParens) {
            for (const textMatch of textInParens) {
              const cleanText = textMatch.replace(/[()]/g, '').trim();
              if (cleanText.length > 0) {
                text += cleanText + ' ';
              }
            }
          }
        }
      }
    }
    
    return text.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.warn('Stream extraction failed:', error.message);
    return '';
  }
};

/**
 * Extract text from PDF file using pdf-lib with enhanced error handling
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

    console.log('Attempting PDF parsing with pdf-lib...');
    const arrayBuffer = await file.arrayBuffer();
    
    // Try pdf-lib extraction first
    try {
      const text = await extractTextFromPDFLib(arrayBuffer);
      if (text && text.trim().length > 0) {
        console.log('PDF parsing successful with pdf-lib!');
        console.log('Total text length:', text.length);
        console.log('First 200 characters:', text.substring(0, 200));
        return text;
      } else {
        console.log('pdf-lib returned empty text, trying raw extraction...');
      }
    } catch (pdfLibError) {
      console.warn('pdf-lib extraction failed, trying raw text extraction:', pdfLibError.message);
      console.log('pdf-lib error details:', pdfLibError);
      
      // Check if this is actually a password error
      if (pdfLibError.message.includes('password required') || 
          pdfLibError.message.includes('password-protected') || 
          pdfLibError.message.includes('authentication required') ||
          pdfLibError.message.includes('encrypted PDF')) {
        throw new Error('Password-protected PDF detected. Please remove the password and try again.');
      }
    }

    // Fallback to raw text extraction
    try {
      console.log('Attempting raw text extraction...');
      const uint8Array = new Uint8Array(arrayBuffer);
      const rawText = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
      
      // Extract text between common PDF text markers
      const textMatches = rawText.match(/BT\s+.*?ET/gs);
      if (textMatches && textMatches.length > 0) {
        let extractedText = '';
        for (const match of textMatches) {
          // Extract text between parentheses (common in PDF text objects)
          const textInParens = match.match(/\(([^)]+)\)/g);
          if (textInParens) {
            for (const textMatch of textInParens) {
              const cleanText = textMatch.replace(/[()]/g, '').trim();
              if (cleanText.length > 0) {
                extractedText += cleanText + ' ';
              }
            }
          }
        }
        
        if (extractedText.trim().length > 0) {
          const finalText = extractedText.replace(/\s+/g, ' ').trim();
          console.log('Raw text extraction successful!');
          console.log('Total text length:', finalText.length);
          console.log('First 200 characters:', finalText.substring(0, 200));
          return finalText;
        }
      }
    } catch (rawError) {
      console.warn('Raw text extraction failed:', rawError.message);
    }
    
    throw new Error('No text content found in the PDF. The PDF might contain only images, be corrupted, or password-protected.');
    
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
    } else if (error.message.includes('network')) {
      throw new Error('Network error while processing PDF. Please check your internet connection and try again.');
    } else if (error.message.includes('timeout')) {
      throw new Error('PDF processing timed out. The file might be too complex. Please try with a simpler PDF.');
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
    You are an AI resume reviewer. Here is my resume I want feedback: "${text}"

    Please analyze this resume and provide detailed feedback on the bullet points in the Experience and Projects sections. For each bullet point, provide:
    - A score from 1 to 10
    - Detailed feedback on how to improve it
    - An improved version of the bullet point

    Focus your feedback on:
    - Strong action verbs
    - Quantified results and metrics
    - Specific technologies and tools mentioned
    - Impact and achievements
    - Conciseness and clarity

    Return only a JSON object with this structure:
    {
      "overallScore": number,
      "totalBullets": number,
      "strongBullets": number,
      "needsImprovement": number,
      "bullets": [
        {
          "id": number,
          "original": string,
          "score": number,
          "feedback": string,
          "improved": string,
          "category": "Experience" | "Projects" | "Education" | "Skills"
        }
      ]
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
