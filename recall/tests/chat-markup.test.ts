import test from 'node:test';
import assert from 'node:assert/strict';
import {chatMarkup} from '../src/chat-markup';
test('Chat formats code and emphasis while escaping model HTML',()=>{
 const html=chatMarkup('Use **export** and `portFrom`.\n\n```js\nif (a < b) return "ok";\n```\n<img src=x onerror=alert(1)>');
 assert.ok(html.includes('<strong>export</strong>'));assert.ok(html.includes('<code>portFrom</code>'));
 assert.ok(html.includes('<pre><code>if (a &lt; b) return &quot;ok&quot;;</code></pre>'));
 assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;img'));
 assert.ok(chatMarkup('```js\nconst unfinished = 1;').endsWith('</code></pre>'));
 assert.ok(!chatMarkup('**<script>alert(1)</script>**').includes('<script>'));
});
