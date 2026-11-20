(function(root){
  'use strict';
  class AIProvider{
    constructor(){this.settings={configured:false,transcription:false,provider:'groq'};}
    async request(route,body){
      if(!/^https?:$/.test(location.protocol))throw new Error('Запусти start.bat: AI потребує локального Node-сервера. Урок доступний без AI.');
      let response;try{response=await fetch('/api/ai/'+route,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});}catch{throw new Error('AI недоступний або не відповів вчасно. Відповідь збережено; доступна самоперевірка.');}
      let result;try{result=await response.json();}catch{throw new Error('Запусти застосунок через start.bat для підключення AI.');}if(!response.ok)throw new Error(result.message||'AI не виконав запит.');return result;
    }
    async refresh(){try{this.settings=await this.request('settings');}catch{this.settings={configured:false,transcription:false,provider:'groq'};}return this.settings;}
    async configure(options){this.settings=await this.request('settings',options);return this.settings;}
    models(options){return this.request('models',options);}
    transcribe(audio,mimeType){return this.request('transcribe',{audio,mimeType});}
    nextTurn(context,role,turns){return this.request('dialogue',{context,role,turns});}
    evaluate(area,task,text,turns=[],origin='typed'){return this.request('evaluate',{area,task,text,turns,origin});}
  }
  root.EnglishAIProvider=AIProvider;
})(globalThis);
