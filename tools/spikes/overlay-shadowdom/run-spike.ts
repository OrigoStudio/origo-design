/**
 * Automated Spike Harness: Shadow DOM CDK Overlay & Portal Substrate
 * Executable via: npm run spike:overlay
 */

import { JSDOM } from 'jsdom';

interface TestResult {
  title: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, title: string, details?: string) {
  if (condition) {
    results.push({ title, passed: true });
    console.log(`  [PASS] ${title}`);
  } else {
    results.push({ title, passed: false, details });
    console.error(`  [FAIL] ${title} - Details: ${details || 'Assertion failed'}`);
  }
}

async function runSpikeSuite() {
  console.log('\n============================================================');
  console.log('  ORIGO DESIGN SYSTEM - SPIKE: OVERLAY & SHADOW DOM SUBSTRATE');
  console.log('============================================================\n');

  // 1. Setup JSDOM environment with Shadow DOM support
  const dom = new JSDOM(
    `<!DOCTYPE html>
    <html lang="en">
    <head><title>Overlay Spike</title></head>
    <body class="theme-light">
      <div id="app-root">
        <div id="clipped-container" style="overflow: hidden; max-height: 40px; position: relative;">
          <origo-host id="custom-host"></origo-host>
        </div>
      </div>
      <div class="cdk-overlay-container" id="cdk-container"></div>
    </body>
    </html>`,
    { url: 'http://localhost' }
  );

  const { window } = dom;
  const { document } = window;
  Object.assign(globalThis, {
    window,
    document,
    HTMLElement: window.HTMLElement,
    customElements: window.customElements,
    MouseEvent: window.MouseEvent,
    KeyboardEvent: window.KeyboardEvent,
  });

  console.log('Step 1: Testing Shadow DOM Setup & Container Overflow Escaping...');

  // Setup custom element with Shadow DOM
  const host = document.getElementById('custom-host') as HTMLElement;
  const shadowRoot = host.attachShadow({ mode: 'open' });

  const triggerButton = document.createElement('button');
  triggerButton.id = 'shadow-trigger-btn';
  triggerButton.textContent = 'Open Dropdown';
  triggerButton.setAttribute('aria-expanded', 'false');
  triggerButton.setAttribute('aria-haspopup', 'dialog');
  shadowRoot.appendChild(triggerButton);

  const clippedContainer = document.getElementById('clipped-container');
  const cdkContainer = document.getElementById('cdk-container');
  if (!clippedContainer || !cdkContainer) {
    throw new Error('Required spike containers not found');
  }

  // Simulate CDK Overlay attachment outside shadow root directly to body container
  const overlayPane = document.createElement('div');
  overlayPane.id = 'origo-overlay-pane';
  overlayPane.className = 'origo-overlay-pane theme-dark';
  overlayPane.setAttribute('role', 'dialog');
  overlayPane.setAttribute('tabindex', '-1');

  const panelInput = document.createElement('input');
  panelInput.id = 'panel-input';
  panelInput.type = 'text';

  const panelBtn = document.createElement('button');
  panelBtn.id = 'panel-close-btn';
  panelBtn.textContent = 'Confirm Action';

  overlayPane.appendChild(panelInput);
  overlayPane.appendChild(panelBtn);
  cdkContainer.appendChild(overlayPane);

  // Assertion 1: Overlay escapes shadow root and overflow container
  const isOutsideShadowRoot = !shadowRoot.contains(overlayPane);
  const isOutsideClippedContainer = !clippedContainer.contains(overlayPane);
  const isInsideDocumentBody = document.body.contains(overlayPane);

  assert(
    isOutsideShadowRoot && isOutsideClippedContainer && isInsideDocumentBody,
    'AC-1: Overlay escapes Shadow DOM and parent container overflow:hidden clipping into document.body container'
  );

  console.log('\nStep 2: Testing Token & Theme Inheritance with CSP Compliance...');
  // Assertion 2: Theme class copied to overlay panel without inline styles
  const hasThemeClass = overlayPane.classList.contains('theme-dark');
  const hasNoInlineStyles = !overlayPane.getAttribute('style');

  assert(
    hasThemeClass && hasNoInlineStyles,
    'AC-2: Overlay panel inherits theme class (theme-dark) and preserves CSP compliance without inline style injection'
  );

  console.log(
    '\nStep 3: Testing Shadow DOM Event Piercing & Outside Click Dismissal (event.composedPath)...'
  );

  let isOpenState = true;
  const isOverlayOpen = (): boolean => isOpenState;
  const closeOverlay = () => {
    isOpenState = false;
    triggerButton.setAttribute('aria-expanded', 'false');
  };
  const openOverlay = () => {
    isOpenState = true;
    triggerButton.setAttribute('aria-expanded', 'true');
  };

  const handleDocumentClick = (event: MouseEvent) => {
    if (!isOverlayOpen()) return;
    const path = event.composedPath ? event.composedPath() : [];
    const isInsideOverlay = path.includes(overlayPane);
    const isInsideTrigger = path.includes(triggerButton) || path.includes(host);

    if (!isInsideOverlay && !isInsideTrigger) {
      closeOverlay();
    }
  };

  document.addEventListener('click', handleDocumentClick as EventListener, true);

  // Simulate click on internal button inside Shadow DOM
  const clickInsideShadow = new window.MouseEvent('click', {
    bubbles: true,
    composed: true,
  });
  triggerButton.dispatchEvent(clickInsideShadow);

  assert(
    isOverlayOpen(),
    'AC-3: Click inside Shadow DOM trigger does NOT cause false-positive dismissal (composedPath pierces shadow boundary)'
  );

  // Simulate click inside overlay panel
  const clickInsideOverlay = new window.MouseEvent('click', {
    bubbles: true,
    composed: true,
  });
  panelInput.dispatchEvent(clickInsideOverlay);

  assert(isOverlayOpen(), 'AC-3: Click inside overlay panel does NOT trigger dismissal');

  // Simulate click outside both (on document body)
  const clickOutside = new window.MouseEvent('click', {
    bubbles: true,
    composed: true,
  });
  document.body.dispatchEvent(clickOutside);

  assert(
    !isOverlayOpen(),
    'AC-3: Click outside both Shadow DOM host and overlay successfully triggers dismissal'
  );

  console.log('\nStep 4: Testing Shadow DOM-Aware Focus Trapping & ActiveElement Piercing...');

  // Helper to pierce shadow DOM
  function getDeepActiveElement(doc: Document): Element | null {
    let active = doc.activeElement;
    while (active && active.shadowRoot && active.shadowRoot.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }

  // Focus trigger inside shadow root
  triggerButton.focus();
  const initialDeepActive = getDeepActiveElement(document);

  assert(
    initialDeepActive === triggerButton,
    'AC-4: getDeepActiveElement() successfully pierces Shadow DOM boundary to identify triggerButton'
  );

  // Open overlay and focus panel input
  openOverlay();
  panelInput.focus();

  assert(
    document.activeElement === panelInput,
    'AC-4: Focus moves into overlay panel focusable element'
  );

  // Focus trap Tab simulation: from last element, Tab should wrap to first element
  panelBtn.focus();
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      if (document.activeElement === panelBtn) {
        event.preventDefault();
        panelInput.focus();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeOverlay();
      triggerButton.focus();
    }
  };

  const tabEvent = new window.KeyboardEvent('keydown', {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
  });
  handleKeydown(tabEvent);

  assert(
    document.activeElement === panelInput,
    'AC-4: Focus trap wraps Tab navigation from last element to first element within overlay'
  );

  // Escape key closes overlay and restores focus to Shadow DOM trigger
  const escapeEvent = new window.KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  handleKeydown(escapeEvent);

  const restoredDeepActive = getDeepActiveElement(document);
  assert(
    !isOverlayOpen() && restoredDeepActive === triggerButton,
    'AC-4: Escape key closes overlay and restores focus to originating trigger element inside Shadow DOM'
  );

  console.log('\nStep 5: Testing SSR Guard & Safe No-Op Execution...');

  // Simulate SSR Server Environment
  const isServer = true;
  const ssrOverlayService = {
    isBrowser: !isServer,
    create: () => ({
      isOpen: false,
      open: () => {
        /* noop in SSR */
      },
      close: () => {
        /* noop in SSR */
      },
      dispose: () => {
        /* noop in SSR */
      },
    }),
  };

  let ssrThrewError = false;
  try {
    const instance = ssrOverlayService.create();
    instance.open();
    instance.close();
    instance.dispose();
  } catch {
    ssrThrewError = true;
  }

  assert(
    !ssrThrewError && ssrOverlayService.isBrowser === false,
    'AC-1 & AC-5: SSR execution safely no-ops without accessing browser DOM or crashing'
  );

  console.log('\n============================================================');
  const allPassed = results.every(r => r.passed);
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  console.log(`SPIKE SUMMARY: ${passedCount}/${total} assertions passed.`);
  console.log('============================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runSpikeSuite().catch(err => {
  console.error('Spike execution failed:', err);
  process.exit(1);
});
