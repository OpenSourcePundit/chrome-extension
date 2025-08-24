export function getSelectionText() {
const sel = window.getSelection?.()
return sel ? sel.toString().trim() : ''
}


export function getSelectionContext(max = 140) {
const sel = window.getSelection?.()
if (!sel || sel.rangeCount === 0) return undefined
const range = sel.getRangeAt(0)
const container = range.commonAncestorContainer
const rootText = (container.textContent || '').replace(/\s+/g, ' ').trim()
if (!rootText) return undefined
const text = sel.toString().trim()
const idx = rootText.indexOf(text)
if (idx < 0) return rootText.slice(0, max)
const start = Math.max(0, idx - Math.floor((max - text.length) / 2))
const end = Math.min(rootText.length, start + max)
return rootText.slice(start, end)
}


export function placeTooltipNearSelection(el) {
const sel = window.getSelection?.()
if (!sel || sel.rangeCount === 0) return
const rect = sel.getRangeAt(0).getBoundingClientRect()
const top = window.scrollY + rect.top - 8
const left = window.scrollX + rect.left + Math.min(rect.width / 2, 120)
el.style.top = `${top}px`
el.style.left = `${left}px`
}