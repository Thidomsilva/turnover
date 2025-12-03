
/**
 * This file is a Next.js API route that acts as a proxy for Genkit flows.
 * It allows you to expose your Genkit flows as a REST API.
 *
 * This file is optional and can be deleted if you do not want to expose your flows.
 *
 * To use this file, you need to define your flows in `src/ai/flows.ts` (or other files).
 * You can then call your flows from your front-end code using `fetch` or a client library.
 *
 * For more information, see the Genkit documentation:
 * https://firebase.google.com/docs/genkit
 */
import { genkit } from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { NextRequest } from 'next/server';
import {v1} from 'genkit/ai';

// Initialize Genkit with just the Google AI plugin.
// This avoids issues with telemetry exporters in production environments like Vercel.
genkit({
  plugins: [googleAI()],
});

export async function POST(req: NextRequest) {
  const GCF_PROJECT = process.env.GCF_PROJECT || 'missing';

  const authHeader = req.headers.get('Authorization');
  let idToken = '';
  if (authHeader) {
    idToken = authHeader.split('Bearer ')[1];
  } else {
    // try to get from cookies, if exists
    const cookie = req.cookies.get('Authorization');
    if (cookie) {
      idToken = cookie.value;
    }
  }

  const {
    getAuth,
    getIdToken,
  } = await import('firebase-admin/auth');

  const { initializeApp, getApps } = await import('firebase-admin/app');
  let app;
  if (getApps().length === 0) {
    app = initializeApp({
      projectId: GCF_PROJECT,
    });
  } else {
    app = getApps()[0];
  }

  const auth = getAuth(app);
  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (e) {
    console.error(e);
    return new Response('Unauthorized', { status: 401 });
  }
  const uid = decodedToken.uid;

  const json = await req.json();

  const { flowId, input, history, state } = json;

  const response = await genkit.runFlow(
    flowId,
    input,
    {
      history,
      state,
      auth: {
        uid,
      },
    }
  );

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
