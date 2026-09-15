import type { DevToolsMessage } from '../types/messages';
import type { OrigoDevToolsAPI } from '@origo/angular-renderer';

// Declare the window variable based on the API type
declare global {
  interface Window {
    __ORIGO_DEVTOOLS__?: OrigoDevToolsAPI;
  }
}

// Injected into the main world to access window.__ORIGO_DEVTOOLS__
window.addEventListener('message', event => {
  // Only accept messages from same frame
  if (
    event.source !== window ||
    !event.data ||
    event.data.source !== 'origo-devtools-content-script'
  ) {
    return;
  }

  const message = event.data.payload as DevToolsMessage;
  const devtools = window.__ORIGO_DEVTOOLS__;

  if (!devtools) {
    window.postMessage(
      {
        source: 'origo-devtools-injected',
        payload: { type: 'NOT_AVAILABLE' },
      },
      '*'
    );
    return;
  }

  try {
    switch (message.type) {
      case 'GET_METADATA_SOURCE':
        window.postMessage(
          {
            source: 'origo-devtools-injected',
            payload: {
              type: 'METADATA_SOURCE_RESPONSE',
              payload: devtools.getMetadataSource(message.payload.badlPath),
            },
          },
          '*'
        );
        break;
      case 'GET_RESOLUTION_CHAIN':
        window.postMessage(
          {
            source: 'origo-devtools-injected',
            payload: {
              type: 'RESOLUTION_CHAIN_RESPONSE',
              payload: devtools.getResolutionChain(message.payload.badlPath),
            },
          },
          '*'
        );
        break;
      case 'GET_RENDERING_PATH':
        window.postMessage(
          {
            source: 'origo-devtools-injected',
            payload: {
              type: 'RENDERING_PATH_RESPONSE',
              payload: devtools.getRenderingPath(message.payload.badlPath),
            },
          },
          '*'
        );
        break;
      case 'GET_ERROR_TELEMETRY':
        window.postMessage(
          {
            source: 'origo-devtools-injected',
            payload: {
              type: 'ERROR_TELEMETRY_RESPONSE',
              payload: devtools.getErrorTelemetry(),
            },
          },
          '*'
        );
        break;
      case 'PING':
        window.postMessage(
          {
            source: 'origo-devtools-injected',
            payload: { type: 'PONG' },
          },
          '*'
        );
        break;
    }
  } catch (e) {
    console.error('Origo DevTools Injected Script Error:', e);
  }
});
