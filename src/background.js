import { saveHighlight, deleteHighlight, getAllHighlights, getApiKey } from './shared/storage'


chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    (async () => {
        try {
            switch (msg.type) {
                case 'SAVE_HIGHLIGHT': {
                    const item = msg.payload
                    await saveHighlight(item)
                    sendResponse({ ok: true })
                    break
                }
                case 'GET_HIGHLIGHTS': {
                    const all = await getAllHighlights()
                    sendResponse({ ok: true, data: all })
                    break
                }
                case 'DELETE_HIGHLIGHT': {
                    await deleteHighlight(msg.payload)
                    const all = await getAllHighlights()
                    sendResponse({ ok: true, data: all })
                    break
                }
                case 'SUMMARIZE_HIGHLIGHTS': {
                    const { ids } = msg.payload || {}
                    const all = await getAllHighlights()
                    const selected = !ids || ids.length === 0 ? all : all.filter(h => ids.includes(h.id))
                    const key = await getApiKey()
                    if (!key) { sendResponse({ ok: false, error: 'Missing OpenAI API key. Set it in Options.' }); break }
                    const prompt = selected.slice(0, 40).map((h, i) => `${i + 1}. "${h.text}" — ${h.title} (${new URL(h.url).hostname})`).join('\n')
                    const summary = await callOpenAI(key, prompt)
                    sendResponse({ ok: true, data: summary })
                    break
                }
                default:
                    sendResponse({ ok: false, error: 'Unknown message type' })
            }
        } catch (e) {
            sendResponse({ ok: false, error: e?.message || String(e) })
        }
    })()
    return true // keep the channel open for async
})


async function callOpenAI(apiKey, prompt) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a concise assistant that summarizes highlight snippets into a tight bullet list.' },
                { role: 'user', content: `Summarize the following web page highlights into 5-8 bullets, merging duplicates and keeping key facts.\n\n${prompt}` }
            ],
            temperature: 0.3,
            max_tokens: 300
        })
    })
    if (!res.ok) throw new Error(`OpenAI error: ${res.status} ${await res.text()}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? '(no summary)'
}