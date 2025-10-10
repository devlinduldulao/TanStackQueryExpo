/**
 * Express streaming server for TanStack Query streamedQuery demo
 * Provides real-time HTTP streaming compatible with React Native XMLHttpRequest
 * Perfect for conference presentations showing server-side streaming patterns
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint for client server status monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Detect response type based on prompt content for varied demos
function getResponseType(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  if (
    lowerPrompt.includes('technical') ||
    lowerPrompt.includes('architecture') ||
    lowerPrompt.includes('code') ||
    lowerPrompt.includes('api') ||
    lowerPrompt.includes('react') ||
    lowerPrompt.includes('query') ||
    lowerPrompt.includes('mobile') ||
    lowerPrompt.includes('app')
  ) {
    return 'technical';
  }

  if (
    lowerPrompt.includes('story') ||
    lowerPrompt.includes('creative') ||
    lowerPrompt.includes('imagine') ||
    lowerPrompt.includes('adventure')
  ) {
    return 'creative';
  }

  return 'general';
}

// Response templates for different content types - creates varied streaming demos
const responseTemplates = {
  technical: [
    "I'll help you understand this technical concept in detail.",
    'Let me break down the architecture and implementation.',
    'Based on current best practices in software engineering,',
    'here are the key technical considerations:',
    '\n\n**System Architecture:**',
    'The foundation of this system relies on modular components',
    'that communicate through well-defined APIs and interfaces.',
    'This microservices approach ensures scalability and maintainability.',
    'Each service handles a specific domain responsibility,',
    'reducing coupling and improving system resilience.',
    '\n\n**Performance Optimization:**',
    'Performance is optimized through various techniques:',
    'lazy loading reduces initial bundle size,',
    'code splitting improves load times,',
    'and efficient state management ensures smooth UX.',
    '\n\n**Best Practices:**',
    'Following SOLID principles ensures maintainable code,',
    'design patterns solve common challenges,',
    'and thorough testing maintains quality standards.',
  ],

  creative: [
    'What a wonderful creative challenge to explore!',
    'Let me paint you a picture with words and imagination.',
    'Creativity flows like a river of possibilities,',
    'each idea building upon the last in unexpected ways.',
    '\n\n**The Creative Vision:**',
    'Imagine a world where boundaries dissolve,',
    'where colors blend into emotions and sounds become textures.',
    "In this space, conventional rules don't apply,",
    'and innovation springs from unexpected connections.',
    '\n\n**Character and Narrative:**',
    'Our protagonist navigates this landscape of ideas,',
    'discovering that each choice opens new pathways.',
    'Characters emerge from the intersection of concepts,',
    'each with their own voice and perspective.',
    '\n\n**The Final Creation:**',
    'What emerges transcends its individual components,',
    'becoming greater than the sum of its parts.',
    'It speaks to something deep within the human experience.',
  ],

  general: [
    "That's an interesting question that deserves a comprehensive answer.",
    'Let me explore this topic from multiple perspectives.',
    'Drawing from various sources and experiences,',
    "I'll provide you with a thorough analysis.",
    '\n\n**Understanding the Context:**',
    'To properly address your question,',
    "it's important to consider the broader context.",
    'This topic has evolved significantly over time,',
    'influenced by technological and social factors.',
    '\n\n**Current State Analysis:**',
    "Today's landscape presents unique opportunities.",
    'Modern solutions leverage advanced technologies',
    'while addressing complex user requirements.',
    'The intersection of various disciplines',
    'creates innovative possibilities.',
    '\n\n**Practical Applications:**',
    'Real-world implementations demonstrate value:',
    'businesses improve efficiency and satisfaction,',
    'educational institutions enhance learning,',
    'and technology providers deliver better experiences.',
  ],
};

// Real-time streaming endpoint - demonstrates HTTP streaming with React Native compatibility
app.post('/stream-chat', async (req, res) => {
  const { prompt } = req.body;

  console.log('📥 Received prompt:', prompt);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Configure headers for React Native XMLHttpRequest streaming compatibility
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no',
    'Transfer-Encoding': 'chunked',
  });

  try {
    const responseType = getResponseType(prompt);
    const responseChunks = responseTemplates[responseType];

    const intro =
      'Regarding your question about "' +
      prompt.slice(0, 100) +
      (prompt.length > 100 ? '...' : '') +
      '",';
    const chunks = [intro, ...responseChunks];

    console.log(`🚀 Starting to stream ${chunks.length} chunks in real-time...`);

    // Stream each chunk with realistic AI-like timing
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Send as JSON line for easy client parsing
      const chunkLine =
        JSON.stringify({
          chunk: chunk,
          index: i,
          total: chunks.length,
          timestamp: Date.now(),
        }) + '\n';

      res.write(chunkLine);
      console.log(`📤 Sent chunk ${i + 1}/${chunks.length} - flushed immediately`);

      // Realistic streaming delay
      if (i < chunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 100));
      }
    }

    // Send completion signal
    const doneSignal = JSON.stringify({ done: true, timestamp: Date.now() }) + '\n';
    res.write(doneSignal);
    console.log('✅ Stream completed - all chunks sent');
  } catch (error) {
    console.error('❌ Streaming error:', error);
    const errorSignal =
      JSON.stringify({
        error: 'Streaming failed',
        message: error.message,
        timestamp: Date.now(),
      }) + '\n';
    res.write(errorSignal);
  } finally {
    res.end();
  }
});

// Start server with helpful console output for conference demos
app.listen(PORT, () => {
  console.log('🚀 Simple streaming server running on port', PORT);
  console.log('📡 Health check: http://localhost:' + PORT + '/health');
  console.log('💬 Stream endpoint: POST http://localhost:' + PORT + '/stream-chat');
  console.log('✅ Ready for TanStack Query streamedQuery demo!');
});
