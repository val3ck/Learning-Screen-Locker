// Library compatibility adapter: all cloud calls go through the local gateway.
class AIMentor {
  constructor() { window.dailyAI = window.dailyAI || new EnglishAIProvider(); }
  hasApiKey() { return !!window.dailyAI.settings.configured; }
  getApiKey() { return ''; }
  getModel() { return window.dailyAI.settings.model || 'local gateway'; }
  setApiKey() { window.dailyApp?.openSettings(); }
  setModel() { window.dailyApp?.openSettings(); }
  async evaluateSentence(text, targetWord='') {
    const feedback = await window.dailyAI.evaluate('writing', 'Write a natural sentence using '+targetWord, text);
    return {feedback};
  }
  async evaluateSpeaking(text, topic='') {
    const feedback = await window.dailyAI.evaluate('speaking',topic,text,[],'text transcript');
    return {feedback};
  }
  async transcribeAudio(base64,mimeType) { return (await window.dailyAI.transcribe(base64,mimeType)).text; }
}
window.aiMentor = new AIMentor();
