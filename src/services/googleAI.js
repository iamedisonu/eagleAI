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
 * Fallback text extraction method for basic PDFs
 * @param {ArrayBuffer} arrayBuffer - PDF file data
 * @returns {Promise<string>} - Extracted text content
 */
const extractTextFallback = async (arrayBuffer) => {
  try {
    // Create a simple text extraction using basic PDF parsing
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // Extract text between common PDF text markers
    const textMatches = text.match(/BT\s+.*?ET/g);
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
        return extractedText.replace(/\s+/g, ' ').trim();
      }
    }
    
    return '';
  } catch (error) {
    console.warn('Fallback extraction failed:', error.message);
    return '';
  }
};

/**
 * Extract text from PDF file using pdfjs-dist with enhanced error handling
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

    console.log('Attempting PDF parsing with pdfjs-dist...');
    const arrayBuffer = await file.arrayBuffer();
    
    // Configure pdfjs-dist with better options
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: false,
      disableRange: false,
      disableStream: false,
      cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`
    });

    const pdfDocument = await loadingTask.promise;
    console.log('PDF loaded successfully. Pages:', pdfDocument.numPages);
    
    let fullText = '';
    let pagesWithText = 0;
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${pdfDocument.numPages}...`);
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text items and clean them up
        const pageText = textContent.items
          .filter(item => item.str && item.str.trim().length > 0)
          .map(item => item.str.trim())
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText && pageText.length > 10) { // Only count pages with substantial text
          fullText += pageText + '\n';
          pagesWithText++;
          console.log(`Page ${pageNum} text length:`, pageText.length);
        }
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError.message);
        // Continue with other pages
      }
    }
    
    const finalText = fullText.trim();
    
    if (finalText.length === 0) {
      // Try a fallback method for basic text extraction
      console.log('No text found with standard method, trying fallback...');
      try {
        const fallbackText = await extractTextFallback(arrayBuffer);
        if (fallbackText && fallbackText.trim().length > 0) {
          console.log('Fallback method successful!');
          return fallbackText.trim();
        }
      } catch (fallbackError) {
        console.warn('Fallback method also failed:', fallbackError.message);
      }
      
      throw new Error('No text content found in the PDF. The PDF might contain only images or be corrupted.');
    }
    
    if (pagesWithText === 0) {
      throw new Error('No readable text found in any page. The PDF might be image-based or password-protected.');
    }
    
    console.log('PDF parsing successful!');
    console.log('Pages with text:', pagesWithText);
    console.log('Total text length:', finalText.length);
    console.log('First 200 characters:', finalText.substring(0, 200));
    
    return finalText;
    
  } catch (error) {
    console.error('PDF processing error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file. Please ensure the file is a valid PDF document.');
    } else if (error.message.includes('password')) {
      throw new Error('Password-protected PDF detected. Please remove the password and try again.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error while processing PDF. Please check your internet connection and try again.');
    } else if (error.message.includes('timeout')) {
      throw new Error('PDF processing timed out. The file might be too complex. Please try with a simpler PDF.');
    } else {
      throw new Error('Failed to extract text from PDF: ' + error.message);
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
