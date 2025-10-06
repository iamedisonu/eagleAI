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
 * Extract text from PDF using PDF.co API
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFromPDFCo = async (file) => {
  try {
    console.log('Attempting PDF parsing with PDF.co API...');
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // PDF.co API endpoint for text extraction
    const apiUrl = 'https://api.pdf.co/v1/pdf/convert/to/text';
    
    const requestBody = {
      file: `data:application/pdf;base64,${base64}`,
      inline: true,
      async: false
    };
    
    console.log('Sending request to PDF.co API...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PDF_CO_API_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDF.co API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('PDF.co API response received');
    
    if (result.error) {
      throw new Error(`PDF.co API error: ${result.message}`);
    }
    
    if (result.body && result.body.length > 0) {
      const extractedText = result.body.trim();
      console.log('PDF.co extraction successful!');
      console.log('Total text length:', extractedText.length);
      console.log('First 200 characters:', extractedText.substring(0, 200));
      return extractedText;
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
    const extractedText = await extractTextFromPDFCo(file);
    
    if (extractedText && extractedText.trim().length > 0) {
      console.log('PDF parsing successful with PDF.co!');
      console.log('Total text length:', extractedText.length);
      console.log('First 200 characters:', extractedText.substring(0, 200));
      return extractedText;
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
