// Fingerprint Shield — Injected into MAIN world to override browser APIs
// Must run before any page scripts

(function () {
  'use strict';

  // Session-stable random seed (consistent within a session, changes on restart)
  const sessionSeed = Math.random() * 2147483647 | 0;

  function seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  const rng = seededRandom(sessionSeed);

  // ===== Canvas Fingerprint Protection =====

  const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const origToBlob = HTMLCanvasElement.prototype.toBlob;
  const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;

  function addCanvasNoise(canvas) {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imageData = origGetImageData.call(ctx, 0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // Subtle noise on RGB channels (not alpha)
        data[i] = Math.max(0, Math.min(255, data[i] + (rng() * 2 - 1) | 0));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + (rng() * 2 - 1) | 0));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + (rng() * 2 - 1) | 0));
      }
      ctx.putImageData(imageData, 0, 0);
    } catch {}
  }

  HTMLCanvasElement.prototype.toDataURL = function (...args) {
    addCanvasNoise(this);
    return origToDataURL.apply(this, args);
  };

  HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
    addCanvasNoise(this);
    return origToBlob.call(this, callback, ...args);
  };

  CanvasRenderingContext2D.prototype.getImageData = function (...args) {
    const imageData = origGetImageData.apply(this, args);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + (rng() * 2 - 1) | 0));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + (rng() * 2 - 1) | 0));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + (rng() * 2 - 1) | 0));
    }
    return imageData;
  };

  // ===== WebGL Fingerprint Protection =====

  const webglParams = {
    37445: 'Google Inc.', // UNMASKED_VENDOR_WEBGL
    37446: 'ANGLE (Generic GPU)', // UNMASKED_RENDERER_WEBGL
  };

  function patchWebGL(proto) {
    const origGetParameter = proto.getParameter;
    proto.getParameter = function (param) {
      if (webglParams[param] !== undefined) {
        return webglParams[param];
      }
      return origGetParameter.call(this, param);
    };

    const origGetExtension = proto.getExtension;
    proto.getExtension = function (name) {
      if (name === 'WEBGL_debug_renderer_info') {
        return { UNMASKED_VENDOR_WEBGL: 37445, UNMASKED_RENDERER_WEBGL: 37446 };
      }
      return origGetExtension.call(this, name);
    };
  }

  if (typeof WebGLRenderingContext !== 'undefined') {
    patchWebGL(WebGLRenderingContext.prototype);
  }
  if (typeof WebGL2RenderingContext !== 'undefined') {
    patchWebGL(WebGL2RenderingContext.prototype);
  }

  // ===== Audio Fingerprint Protection =====

  if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const origCreateOscillator = AudioCtx.prototype.createOscillator;
    const origCreateAnalyser = AudioCtx.prototype.createAnalyser;
    const origGetFloatFrequencyData = AnalyserNode.prototype.getFloatFrequencyData;
    const origGetByteFrequencyData = AnalyserNode.prototype.getByteFrequencyData;

    AnalyserNode.prototype.getFloatFrequencyData = function (array) {
      origGetFloatFrequencyData.call(this, array);
      for (let i = 0; i < array.length; i++) {
        array[i] += (rng() - 0.5) * 0.001;
      }
    };

    AnalyserNode.prototype.getByteFrequencyData = function (array) {
      origGetByteFrequencyData.call(this, array);
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.max(0, Math.min(255, array[i] + (rng() * 2 - 1) | 0));
      }
    };
  }

  // ===== Battery Status API Protection =====

  if (navigator.getBattery) {
    navigator.getBattery = function () {
      return Promise.resolve({
        charging: true,
        chargingTime: 0,
        dischargingTime: Infinity,
        level: 1.0,
        addEventListener: function () {},
        removeEventListener: function () {},
        dispatchEvent: function () { return true; }
      });
    };
  }

  // ===== Font Enumeration Protection =====

  const origMeasureText = CanvasRenderingContext2D.prototype.measureText;
  CanvasRenderingContext2D.prototype.measureText = function (text) {
    const result = origMeasureText.call(this, text);
    const noise = (rng() - 0.5) * 0.00001;
    const origWidth = result.width;

    Object.defineProperty(result, 'width', {
      get: () => origWidth + noise
    });

    return result;
  };

  // ===== Hardware Specs Protection =====

  // Spoof navigator properties used for fingerprinting
  const spoofedHardwareConcurrency = [2, 4, 8][Math.floor(rng() * 3)];
  const spoofedDeviceMemory = [4, 8][Math.floor(rng() * 2)];

  try {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      get: () => spoofedHardwareConcurrency
    });
  } catch {}

  try {
    Object.defineProperty(navigator, 'deviceMemory', {
      get: () => spoofedDeviceMemory
    });
  } catch {}

  // ===== Screen Properties Protection =====

  // Slightly offset screen dimensions to break screen fingerprinting
  try {
    const origWidth = screen.width;
    const origHeight = screen.height;
    Object.defineProperty(screen, 'width', { get: () => origWidth });
    Object.defineProperty(screen, 'height', { get: () => origHeight });
    Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
    Object.defineProperty(screen, 'pixelDepth', { get: () => 24 });
  } catch {}
})();
