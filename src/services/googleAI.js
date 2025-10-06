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
import * as pdfjsLib from 'pdfjs-dist';

const API_KEY = 'AIzaSyBoKAyutw0pQYkhtCgWAoQNkdhQKt7XYNI';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from PDF file using multiple parsing methods
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (file) => {
  console.log('PDF file received:', file.name, 'Size:', file.size);
  
  try {
    // Method 1: Try pdf-parse first (more reliable for most PDFs)
    try {
      console.log('Attempting PDF parsing with pdf-parse...');
      const arrayBuffer = await file.arrayBuffer();
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(arrayBuffer);
      
      if (data.text && data.text.trim().length > 0) {
        console.log('PDF parsing successful with pdf-parse');
        console.log('Extracted text length:', data.text.length);
        console.log('First 200 characters:', data.text.substring(0, 200));
        return data.text.trim();
      }
    } catch (pdfParseError) {
      console.warn('pdf-parse failed, trying pdfjs-dist:', pdfParseError.message);
    }

    // Method 2: Fallback to pdfjs-dist
    try {
      console.log('Attempting PDF parsing with pdfjs-dist...');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText) {
          fullText += pageText + '\n';
        }
      }
      
      if (fullText.trim().length > 0) {
        console.log('PDF parsing successful with pdfjs-dist');
        console.log('Extracted text length:', fullText.length);
        console.log('First 200 characters:', fullText.substring(0, 200));
        return fullText.trim();
      }
    } catch (pdfjsError) {
      console.warn('pdfjs-dist failed:', pdfjsError.message);
    }

    // Method 3: Final fallback - return error
    throw new Error('All PDF parsing methods failed. The PDF might be corrupted, password-protected, or contain only images.');
    
  } catch (error) {
    console.error('PDF processing error:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
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
