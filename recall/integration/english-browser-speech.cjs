"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/browser-speech.ts
var browser_speech_exports = {};
__export(browser_speech_exports, {
  EnglishSpeech: () => EnglishSpeech,
  englishSpeechText: () => englishSpeechText
});
module.exports = __toCommonJS(browser_speech_exports);

// electron/english-speech.ts
var import_node_child_process = require("node:child_process");
var import_node_crypto = require("node:crypto");
var import_promises = require("node:fs/promises");
var import_node_path = __toESM(require("node:path"), 1);
var command = String.raw`
$ErrorActionPreference='Stop'
[Console]::InputEncoding=New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$synth=$null
$stream=$null
try {
  $request=[Console]::In.ReadToEnd() | ConvertFrom-Json
  Add-Type -AssemblyName System.Speech
  $synth=New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice=$synth.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.TwoLetterISOLanguageName -eq 'en' } | Select-Object -First 1
  if(-not $voice){throw 'NO_LOCAL_ENGLISH_VOICE'}
  $synth.SelectVoice($voice.VoiceInfo.Name)
  $synth.Rate=-1
  $stream=New-Object System.IO.MemoryStream
  $synth.SetOutputToWaveStream($stream)
  $synth.Speak([string]$request.text)
  $synth.SetOutputToNull()
  [Console]::Out.Write((@{mime='audio/wav';voice=$voice.VoiceInfo.Name;language=$voice.VoiceInfo.Culture.Name;base64=[Convert]::ToBase64String($stream.ToArray())} | ConvertTo-Json -Compress))
} catch {
  [Console]::Error.Write($_.Exception.Message)
  exit 1
} finally {
  if($synth){$synth.Dispose()}
  if($stream){$stream.Dispose()}
}
`;
var MAX_AUDIO_BYTES = 8 * 1024 * 1024;
function validateSpeechAudio(value) {
  const a = value;
  if (a?.mime !== "audio/wav" || typeof a.voice !== "string" || a.voice.length > 200 || typeof a.language !== "string" || !/^en(?:-|$)/i.test(a.language) || typeof a.base64 !== "string" || a.base64.length > MAX_AUDIO_BYTES * 1.4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(a.base64)) throw new Error("Windows \u043F\u043E\u0432\u0435\u0440\u043D\u0443\u043B\u0430 \u043D\u0435\u043A\u043E\u0440\u0435\u043A\u0442\u043D\u0435 \u043E\u0437\u0432\u0443\u0447\u0435\u043D\u043D\u044F.");
  const bytes = Buffer.from(a.base64, "base64");
  if (bytes.length <= 44 || bytes.length > MAX_AUDIO_BYTES || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WAVE") throw new Error("Windows \u043D\u0435 \u0441\u0442\u0432\u043E\u0440\u0438\u043B\u0430 \u0437\u0432\u0443\u043A\u043E\u0432\u0438\u0439 \u0444\u0430\u0439\u043B.");
  return { base64: a.base64, mime: "audio/wav", voice: a.voice, language: a.language };
}
async function renderWindowsSpeech(text) {
  if (process.platform !== "win32") throw new Error("\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u0435 \u043E\u0437\u0432\u0443\u0447\u0435\u043D\u043D\u044F Windows \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0435. \u041C\u043E\u0436\u043D\u0430 \u043E\u0431\u0440\u0430\u0442\u0438 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u0438\u0439 \u0430\u043D\u0430\u043B\u043E\u0433.");
  const executable = import_node_path.default.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  return new Promise((resolve, reject) => {
    const child = (0, import_node_child_process.spawn)(executable, ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(command, "utf16le").toString("base64")], { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    let output = "", errors = "", settled = false;
    const end = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(result);
    };
    const timer = setTimeout(() => {
      child.kill();
      end(new Error("\u041E\u0437\u0432\u0443\u0447\u0435\u043D\u043D\u044F Windows \u043D\u0435 \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u043B\u043E \u0437\u0430 20 \u0441\u0435\u043A\u0443\u043D\u0434. \u041C\u043E\u0436\u043D\u0430 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0438 \u0430\u0431\u043E \u043E\u0431\u0440\u0430\u0442\u0438 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u0438\u0439 \u0430\u043D\u0430\u043B\u043E\u0433."));
    }, 2e4);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.length > MAX_AUDIO_BYTES * 1.4) {
        child.kill();
        end(new Error("\u0417\u0432\u0443\u043A\u043E\u0432\u0438\u0439 \u0444\u0430\u0439\u043B \u043F\u0435\u0440\u0435\u0432\u0438\u0449\u0438\u0432 \u0434\u043E\u0437\u0432\u043E\u043B\u0435\u043D\u0438\u0439 \u0440\u043E\u0437\u043C\u0456\u0440."));
      }
    });
    child.stderr.on("data", (chunk) => {
      if (errors.length < 4e3) errors += chunk;
    });
    child.on("error", () => end(new Error("\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0438 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0435 \u043E\u0437\u0432\u0443\u0447\u0435\u043D\u043D\u044F Windows.")));
    child.stdin.on("error", () => {
    });
    child.on("close", (code) => {
      if (settled) return;
      if (code !== 0) {
        end(new Error(errors.includes("NO_LOCAL_ENGLISH_VOICE") ? "\u0423 Windows \u043D\u0435 \u0432\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E \u0430\u043D\u0433\u043B\u0456\u0439\u0441\u044C\u043A\u0438\u0439 \u0433\u043E\u043B\u043E\u0441. \u041C\u043E\u0436\u043D\u0430 \u043E\u0431\u0440\u0430\u0442\u0438 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u0438\u0439 \u0430\u043D\u0430\u043B\u043E\u0433." : "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u0435 \u043E\u0437\u0432\u0443\u0447\u0435\u043D\u043D\u044F Windows \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0435. \u041C\u043E\u0436\u043D\u0430 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0438 \u0430\u0431\u043E \u043E\u0431\u0440\u0430\u0442\u0438 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u0438\u0439 \u0430\u043D\u0430\u043B\u043E\u0433."));
        return;
      }
      try {
        end(void 0, validateSpeechAudio(JSON.parse(output)));
      } catch (error) {
        end(error);
      }
    });
    child.stdin.end(JSON.stringify({ text }), "utf8");
  });
}
var EnglishSpeech = class {
  constructor(root, generate = renderWindowsSpeech) {
    this.root = root;
    this.generate = generate;
  }
  pending = /* @__PURE__ */ new Map();
  queue = Promise.resolve();
  synthesize(text) {
    if (typeof text !== "string" || !text.trim() || text.length > 8e3) return Promise.reject(new Error("\u041D\u0435\u043A\u043E\u0440\u0435\u043A\u0442\u043D\u0438\u0439 \u0442\u0435\u043A\u0441\u0442 \u043E\u0437\u0432\u0443\u0447\u0435\u043D\u043D\u044F."));
    const key = (0, import_node_crypto.createHash)("sha256").update("windows-english-v1\0" + text).digest("hex");
    const existing = this.pending.get(key);
    if (existing) return existing;
    const result = this.queue.catch(() => {
    }).then(async () => {
      const file = import_node_path.default.join(this.root, key + ".json");
      try {
        return validateSpeechAudio(JSON.parse(await (0, import_promises.readFile)(file, "utf8")));
      } catch {
      }
      const audio = validateSpeechAudio(await this.generate(text));
      await (0, import_promises.mkdir)(this.root, { recursive: true });
      await (0, import_promises.writeFile)(file + ".tmp", JSON.stringify(audio), "utf8");
      await (0, import_promises.rename)(file + ".tmp", file);
      await this.prune(file);
      return audio;
    });
    this.queue = result;
    this.pending.set(key, result);
    void result.finally(() => this.pending.delete(key)).catch(() => {
    });
    return result;
  }
  async prune(current) {
    const files = await Promise.all((await (0, import_promises.readdir)(this.root)).filter((n) => /^[a-f0-9]{64}\.json$/.test(n)).map(async (n) => {
      const file = import_node_path.default.join(this.root, n), s = await (0, import_promises.stat)(file);
      return { file, size: s.size, time: s.mtimeMs };
    }));
    let size = files.reduce((n, f) => n + f.size, 0);
    for (const f of files.sort((a, b) => a.time - b.time)) {
      if (size <= 64 * 1024 * 1024) break;
      if (f.file === current) continue;
      await (0, import_promises.unlink)(f.file);
      size -= f.size;
    }
  }
};

// src/modules/english/speech-content.ts
function englishSpeechText(lesson, request) {
  if (!request || typeof request !== "object") throw new Error("Invalid audio request.");
  if (request.kind === "dialogue") return lesson.listening.dialogue.map((turn) => turn.text).join("\n\n");
  if (request.kind === "model") return lesson.speaking.model;
  if (request.kind === "word" && Number.isInteger(request.index) && request.index >= 0 && request.index < lesson.vocabulary.length) return lesson.vocabulary[request.index].en;
  if (request.kind === "catch-word" && Number.isInteger(request.index) && request.index >= 0 && Array.isArray(lesson.listening.catchWords) && request.index < lesson.listening.catchWords.length) return lesson.listening.catchWords[request.index].word;
  throw new Error("This excerpt is not part of the current lesson.");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EnglishSpeech,
  englishSpeechText
});
