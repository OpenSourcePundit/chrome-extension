import { v4 as uuid } from 'uuid'
import { getSelectionText, getSelectionContext, placeTooltipNearSelection } from './shared/util'

// Add this at the top of content.js
(function injectStyles() {
  const css = `
.whs-tooltip {
  position: absolute;
  z-index: 2147483647;
  background: #111827;
  color: #f9fafb;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 8px 10px;
  font: 12px/1.2 system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  box-shadow: 0 6px 18px rgba(0,0,0,0.2);
  display: flex; gap: 8px; align-items: center;
}
.whs-tooltip button {
  background: #10b981; color: #06221a; border: none;
  border-radius: 6px; padding: 6px 8px; font-weight: 600; cursor: pointer;
}
.whs-tooltip button:hover { filter: brightness(0.95); }
.whs-toast {
  position: fixed; bottom: 20px; right: 20px;
  background: #111827; color: #e5e7eb;
  border: 1px solid #374151; border-radius: 8px;
  padding: 8px 12px; z-index: 2147483647;
}
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();



let tooltip = null
let hideTimer = null


function removeTooltip() {
if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip)
tooltip = null
}


function showToast(msg) {
const toast = document.createElement('div')
toast.className = 'whs-toast'
toast.textContent = msg
document.body.appendChild(toast)
setTimeout(() => toast.remove(), 1600)
}


function ensureTooltip() {
if (tooltip) return tooltip
tooltip = document.createElement('div')
tooltip.className = 'whs-tooltip'
tooltip.innerHTML = `
<span>Save highlight?</span>
<button id="whs-save">Save</button>
`
document.body.appendChild(tooltip)
tooltip.addEventListener('mouseleave', () => {
if (hideTimer) window.clearTimeout(hideTimer)
hideTimer = window.setTimeout(removeTooltip, 400)
})
return tooltip
}


async function onMouseUp() {
const text = getSelectionText()
if (!text) { removeTooltip(); return }
const tip = ensureTooltip()
placeTooltipNearSelection(tip)
const saveBtn = tip.querySelector('#whs-save')
saveBtn.onclick = async () => {
const item = {
id: uuid(),
text,
url: location.href,
title: document.title,
createdAt: Date.now(),
context: getSelectionContext(140)
}
await chrome.runtime.sendMessage({ type: 'SAVE_HIGHLIGHT', payload: item })
showToast('Highlight saved')
removeTooltip()
window.getSelection()?.removeAllRanges()
}
}


window.addEventListener('mouseup', onMouseUp)
window.addEventListener('keyup', (e) => { if (e.key === 'Escape') removeTooltip() })