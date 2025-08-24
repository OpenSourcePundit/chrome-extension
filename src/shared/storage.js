const KEY = 'highlights_v1'


export async function getAllHighlights() {
    const res = await chrome.storage.local.get(KEY)
    return res[KEY] ?? []
}


export async function saveHighlight(item) {
    const all = await getAllHighlights()
    all.unshift(item)
    await chrome.storage.local.set({ [KEY]: all })
}


export async function deleteHighlight(id) {
    const all = await getAllHighlights()
    const next = all.filter(h => h.id !== id)
    await chrome.storage.local.set({ [KEY]: next })
}


export async function clearAll() {
    await chrome.storage.local.set({ [KEY]: [] })
}


export async function getApiKey() {
    const res = await chrome.storage.sync.get('openai_api_key')
    return res.openai_api_key ?? null
}


export async function setApiKey(k) {
    await chrome.storage.sync.set({ openai_api_key: k })
}