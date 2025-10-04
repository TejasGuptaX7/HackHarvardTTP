// src/index.ts
import { Env } from './types';
import { handleScore } from './routes/score';
import { handleChat } from './routes/chat';
import { handleData } from './routes/data';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response: Response;

      // Route handling
      switch (path) {
        case '/score':
          if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
          }
          response = await handleScore(request, env);
          break;

        case '/chat':
          if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
          }
          response = await handleChat(request, env);
          break;

        case '/data':
          if (request.method !== 'GET') {
            return new Response('Method not allowed', { status: 405 });
          }
          response = await handleData(request, env);
          break;

        case '/':
          response = new Response(
            JSON.stringify({
              service: 'Eco Spirit Worker',
              version: '1.0.0',
              endpoints: {
                '/score': 'POST - Calculate green scores for all buildings',
                '/chat': 'POST - Chat with AI for recommendations',
                '/data': 'GET - Get GeoJSON data (?recommended=true for filtered)',
              },
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
          break;

        default:
          response = new Response('Not found', { status: 404 });
      }

      // Add CORS headers to response
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error: any) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};