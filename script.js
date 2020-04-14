/* eslint-disable no-return-assign */

/** @returns {Element} */
const $ = (selector) => document.querySelector(selector);

let sr = null;
let activated = false;
let errorMessage = '';

const elStart = $('#start');
const elStop = $('#stop');
const elReset = $('#reset');
const elLang = $('#lang');
const elStopPhrase = $('#stopPhrase');
const elRecognitionStatus = $('#recognitionStatus');
const elAudioStatus = $('#audioStatus');
const elSoundStatus = $('#soundStatus');
const elSpeechStatus = $('#speechStatus');
const elError = $('#error');
const elResult = $('#result');
const elListening = $('#listening');

const langStopPhraseMap = new Map([
  ['en', 'stop'],
  ['ja', '終わり'],
]);

function applyFallback () {
  if (!window.SpeechRecognition) {
    window.SpeechRecognition = window.webkitSpeechRecognition
      || window.mozSpeechRecognition;
  }
}

function isSpeechRecognitionAvailable () {
  return Boolean(window.SpeechRecognition);
}

function getLang () {
  const paramPairs = window.location.search
    .slice(1)
    .split('&')
    .map((v) => v.split('='));

  const langParam = paramPairs.find(([key]) => key === 'lang');
  const lang = langParam ? langParam[1] : undefined;
  return lang;
}


function setErrorMessage (message) {
  errorMessage = message;
  elError.textContent = message;
}

function getRecognizedText (event) {
  const text = event.results[0][0].transcript;
  return text;
}

function startListening () {
  activated = true;
  setErrorMessage('');
  elListening.dataset.on = 'true';

  sr.start();
}

function stopListening () {
  activated = false;
  elListening.dataset.on = 'false';

  elRecognitionStatus.dataset.on = 'false';
  elAudioStatus.dataset.on = 'false';
  elSoundStatus.dataset.on = 'false';
  elSpeechStatus.dataset.on = 'false';

  sr.stop();
}

function resetResultText() {
  elResult.textContent = '';
}

function main () {
  applyFallback();

  if (!isSpeechRecognitionAvailable()) {
    setErrorMessage('SpeechRecognition is not available');
    return;
  }

  elStart.addEventListener('click', () => startListening());
  elStop.addEventListener('click', () => stopListening());
  elReset.addEventListener('click', () => resetResultText());
  sr = new window.SpeechRecognition();

  sr.lang = getLang();

  sr.addEventListener('error', (event) => {
    const message = event.message || String(event.error);
    setErrorMessage(message);
    stopListening();
  });

  sr.addEventListener('result', (event) => {
    const text = getRecognizedText(event);
    elResult.textContent += `${text}.`;
  });

  sr.addEventListener('end', () => {
    if (activated && !errorMessage) {
      sr.start();
    }
  });

  sr.addEventListener('start', () => elRecognitionStatus.dataset.on = 'true');
  sr.addEventListener('end', () => elRecognitionStatus.dataset.on = 'false');

  sr.addEventListener('audiostart', () => elAudioStatus.dataset.on = 'true');
  sr.addEventListener('audioend', () => elAudioStatus.dataset.on = 'false');

  sr.addEventListener('soundstart', () => elSoundStatus.dataset.on = 'true');
  sr.addEventListener('soundend', () => elSoundStatus.dataset.on = 'false');

  sr.addEventListener('speechstart', () => elSpeechStatus.dataset.on = 'true');
  sr.addEventListener('speechend', () => elSpeechStatus.dataset.on = 'false');
}

main();
