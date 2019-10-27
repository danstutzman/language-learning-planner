export function initSynthesizer(numRetry?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    pollVoices(0, resolve, reject)
  })
}

function pollVoices(numRetry: number, resolve: () => void,
reject: (e: Error) => void) {

  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    resolve()
  } else if (numRetry < 5) {
    setTimeout(() => pollVoices(numRetry + 1, resolve, reject), 100)
  } else {
    reject(new Error("Failed to load voices after timeout"))
  }
}

export default function speakL2(l2: string) {
  const utterance = new SpeechSynthesisUtterance(l2)

  const voices = window.speechSynthesis.getVoices()
  for (const voice of voices) {
    if (voice.lang.startsWith('es')) {
      utterance.voice = voice
      break
    }
  }

  window.speechSynthesis.speak(utterance)
}
