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

const API_KEY = 'AIzaSyBoKAyutw0pQYkhtCgWAoQNkdhQKt7XYNI';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Extract text from PDF file using react-pdf
 * @param {File} file - PDF file object
 * @returns {Promise<string>} - Extracted text content
 */
export const extractTextFromPDF = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('PDF file received:', file.name, 'Size:', file.size);
      
      // Dynamic import to avoid build issues
      const pdfjsLib = await import('react-pdf');
      
      // react-pdf exports pdfjsLib as default
      const pdfjs = pdfjsLib.default || pdfjsLib;
      const getDocument = pdfjs.getDocument;
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          
          // Convert ArrayBuffer to Uint8Array for react-pdf
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Load PDF document
          const pdf = await getDocument({ data: uint8Array }).promise;
          let fullText = '';
          
          console.log('PDF loaded, pages:', pdf.numPages);
          
          // Extract text from all pages
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
            console.log(`Page ${pageNum} text extracted:`, pageText.substring(0, 100) + '...');
          }
          
          console.log('PDF parsing completed successfully');
          console.log('Total extracted text length:', fullText.length);
          console.log('First 200 characters:', fullText.substring(0, 200));
          
          if (!fullText || fullText.trim().length === 0) {
            throw new Error('No text found in PDF. The PDF might be image-based or corrupted.');
          }
          
          resolve(fullText.trim());
        } catch (error) {
          console.error('PDF parsing error:', error);
          reject(new Error('Failed to extract text from PDF: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read PDF file'));
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('PDF processing error:', error);
      reject(new Error('Failed to process PDF file: ' + error.message));
    }
  });
};

/**
 * Analyze resume text and extract bullet points
 * @param {string} text - Resume text content
 * @returns {Promise<Object>} - Analysis results with bullet points and scores
 */
export const analyzeResume = async (text) => {
  try {
    const prompt = `
    Analyze this resume text and extract all bullet points from experience and project sections. 
    For each bullet point, provide:
    1. The original bullet point text
    2. A score from 1-10 (10 being excellent)
    3. Detailed feedback explaining the score
    4. An improved version of the bullet point
    5. The category (Experience or Projects)

    Resume text:
    ${text}

    Please respond with a JSON object in this exact format:
    {
      "overallScore": 7.5,
      "totalBullets": 5,
      "strongBullets": 3,
      "needsImprovement": 2,
      "bullets": [
        {
          "id": 1,
          "original": "Original bullet point text",
          "score": 8,
          "feedback": "Detailed feedback explaining strengths and weaknesses",
          "improved": "Improved version with better action verbs and quantified results",
          "category": "Experience"
        }
      ]
    }

    Focus on:
    - Action verbs (led, developed, created, implemented, etc.)
    - Quantified results (numbers, percentages, timeframes)
    - Specific technologies and tools
    - Clear impact and value
    - Conciseness and clarity

    Return only the JSON object, no additional text.
    `;

    console.log('Sending request to Google AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    console.log('AI Response received, length:', analysisText.length);
    console.log('AI Response preview:', analysisText.substring(0, 300) + '...');
    
    // Clean the response to extract JSON
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (!analysis.bullets || !Array.isArray(analysis.bullets)) {
      throw new Error('Invalid analysis structure received');
    }
    
    return analysis;
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
