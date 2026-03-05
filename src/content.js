(function() {
  if (window.__screenshotExtensionActive) return;
  window.__screenshotExtensionActive = true;

  const overlay = document.createElement('div');
  overlay.id = 'screenshot-extension-overlay';
  document.body.appendChild(overlay);

  const highlight = document.createElement('div');
  highlight.id = 'screenshot-extension-highlight';
  document.body.appendChild(highlight);
  
  const actionUi = document.createElement('div');
  actionUi.id = 'screenshot-extension-actions';
  actionUi.innerHTML = `
    <button id="screenshot-btn-download">Download</button>
    <button id="screenshot-btn-copy">Copy to Clipboard</button>
    <button id="screenshot-btn-cancel">Cancel</button>
  `;
  document.body.appendChild(actionUi);

  let currentTarget = null;
  let locked = false;

  function onMouseMove(e) {
    if (locked) return;
    
    overlay.style.pointerEvents = 'none';
    highlight.style.pointerEvents = 'none';
    actionUi.style.pointerEvents = 'none'; // so we don't hover it accidentally
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    
    overlay.style.pointerEvents = 'auto';
    actionUi.style.pointerEvents = 'auto';
    
    if (target && target !== currentTarget && target !== document.body && target !== document.documentElement) {
      currentTarget = target;
      updateHighlight(target);
    } else if (!target || target === document.body || target === document.documentElement) {
      currentTarget = null;
      highlight.style.display = 'none';
    }
  }
  
  function updateHighlight(target) {
    const rect = target.getBoundingClientRect();
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.style.display = 'block';
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.target.id === 'screenshot-btn-download' || e.target.id === 'screenshot-btn-copy') {
      const action = e.target.id === 'screenshot-btn-download' ? 'download' : 'copy';
      const target = currentTarget;
      cleanup(); // cleanup hides highlight and buttons BEFORE capturing
      
      if (target) {
        const rect = target.getBoundingClientRect();
        chrome.runtime.sendMessage({
          type: "ELEMENT_SELECTED",
          action: action,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          dpr: window.devicePixelRatio
        }, async (response) => {
          if (response && response.success && action === 'copy') {
            try {
              const res = await fetch(response.dataUrl);
              const blob = await res.blob();
              await navigator.clipboard.write([
                new ClipboardItem({
                  [blob.type]: blob
                })
              ]);
            } catch (err) {
              console.error('Failed to copy image: ', err);
              alert('Failed to copy to clipboard.');
            }
          }
        });
      }
      return;
    }
    
    if (e.target.id === 'screenshot-btn-cancel') {
      cleanup();
      return;
    }
    
    if (!locked && currentTarget) {
      locked = true;
      const rect = currentTarget.getBoundingClientRect();
      
      // Briefly show it to get dimensions, but opacity 0 to prevent flicker
      actionUi.style.opacity = '0';
      actionUi.style.display = 'flex';
      
      const uiWidth = actionUi.offsetWidth || 150;
      const uiHeight = actionUi.offsetHeight || 40;
      
      // Position action UI
      let topPos = rect.bottom + 10;
      if (topPos + uiHeight > window.innerHeight) {
        topPos = rect.top - uiHeight - 10;
      }
      
      let leftPos = rect.right - uiWidth;
      // If it's too far left, align to the left side of the element instead
      if (leftPos < 0) {
        leftPos = rect.left;
        // If still off screen, push it inside
        if (leftPos < 0) leftPos = 10;
      }
      
      actionUi.style.top = `${topPos}px`;
      actionUi.style.left = `${leftPos}px`;
      actionUi.style.opacity = '1';
      
      // Make highlight thicker/different color to show locked state
      highlight.style.border = '2px solid #ff3366';
      highlight.style.background = 'rgba(255, 51, 102, 0.1)';
      
    } else if (locked) {
      // Unlock if clicked somewhere else
      locked = false;
      actionUi.style.display = 'none';
      highlight.style.border = '2px solid #007bff';
      highlight.style.background = 'rgba(0, 123, 255, 0.2)';
      
      // Trigger a fake mousemove to update the target under cursor
      onMouseMove(e);
    }
  }
  
  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup();
    }
  }

  function cleanup() {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (highlight.parentNode) highlight.parentNode.removeChild(highlight);
    if (actionUi.parentNode) actionUi.parentNode.removeChild(actionUi);
    window.__screenshotExtensionActive = false;
  }

  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  
})();