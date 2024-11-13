/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Helper function to convert base64 to buffer
function base64ToBuffer(base64String: string): Buffer {
  console.log('Starting base64 to buffer conversion');
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    console.log('Successfully converted base64 to buffer');
    return buffer;
  } catch (error) {
    console.error('Error in base64ToBuffer:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  console.log('Received POST request');

  try {
    const body = await req.json();
    const { image, dict_of_vars } = body;

    // Logging to check if the image and dictionary variables are provided
    console.log('Request body parsed:', {
      hasImage: !!image,
      dictVarsLength: Object.keys(dict_of_vars || {}).length,
    });

    if (!image) {
      console.warn('No image provided in request');
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert base64 image to buffer for processing
    console.log('Converting image to buffer');
    const imageBuffer = base64ToBuffer(image);
    console.log('Image buffer size:', imageBuffer.length);

    // Prepare the image part for Gemini AI
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/png',
      },
    };
    console.log('Image part prepared for Gemini');

    // Initialize Gemini AI model
    console.log('Initializing Gemini model');
    const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Constructing the prompt for the AI model
    const prompt = `You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them. Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right).

Analyze the equation or expression in this image and return the answer in one of these formats:
1. Simple math: [{"expr": "given expression", "result": "calculated answer"}]
2. Equations: [{"expr": "x", "result": 2, "assign": true}, {"expr": "y", "result": 5, "assign": true}]
3. Variable assignment: [{"expr": "variable", "result": "value", "assign": true}]
4. Graphical problems: [{"expr": "given expression", "result": "calculated answer"}]
5. Abstract concepts: [{"expr": "explanation", "result": "concept"}]


Variables to use: ${JSON.stringify(dict_of_vars || {})}
Return the expressions in LaTeX format.`;

    console.log('Prompt constructed:', prompt.substring(0, 100) + '...');

    // Generate content using the Gemini model
    console.log('Generating content with Gemini');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = await response.text(); // Await response text to fully resolve it
    console.log('Raw response text:', text.substring(0, 100) + '...');

    // Parse the AI response
    let answers = [];
    try {
      console.log('Parsing AI response');
      // Remove any markdown formatting if present
      const cleanText = text.replace(/```json\n|\n```/g, '');
      console.log('Cleaned text:', cleanText.substring(0, 100) + '...');
      
      answers = JSON.parse(cleanText);
      console.log('Successfully parsed JSON response');

      // Process and format the response for the frontend
      const formattedAnswers = answers.map((answer: any) => {
        console.log('Processing answer:', answer);

        // Don't replace LaTeX characters like $ and / that are necessary for math symbols
        return {
          expr: answer.expr, // Keep LaTeX formatted expressions as-is
          result: answer.result, // Keep LaTeX formatted result as-is
          assign: answer.assign || false,
        };
      });

      console.log('Successfully formatted answers');
      return NextResponse.json({
        data: formattedAnswers,
      });
    } catch (e) {
      console.error('Error parsing AI response:', e);
      console.error('Failed text:', text);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
