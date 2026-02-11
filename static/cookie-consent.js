(function(){
  const KEY = 'cookieConsentGiven';
  const SETTINGS_KEY = 'cookieSettings';
  
  // Default cookie settings
  const defaultSettings = {
    necessary: true,    // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false
  };

  function setConsent(val){
    try{ localStorage.setItem(KEY, val ? '1' : '0'); }catch(e){}
  }
  
  function getConsent(){
    try{ return localStorage.getItem(KEY) === '1'; }catch(e){ return false; }
  }

  function saveSettings(settings){
    try{ 
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); 
      setConsent(true);
    }catch(e){}
  }

  function getSettings(){
    try{ 
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? JSON.parse(saved) : defaultSettings;
    }catch(e){ 
      return defaultSettings; 
    }
  }

  function showBanner(){
    const el = document.getElementById('cookie-consent');
    if(!el) return;
    el.style.display = 'block';
    requestAnimationFrame(()=> el.classList.add('visible'));
  }
  
  function hideBanner(){
    const el = document.getElementById('cookie-consent');
    if(!el) return;
    el.classList.remove('visible');
    setTimeout(()=> el.style.display = 'none', 300);
  }

  function showModal(){
    const modal = document.getElementById('cookie-settings-modal');
    if(!modal) return;
    
    // Load current settings
    const settings = getSettings();
    document.getElementById('cookie-functional').checked = settings.functional;
    document.getElementById('cookie-analytics').checked = settings.analytics;
    document.getElementById('cookie-marketing').checked = settings.marketing;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(()=> modal.classList.add('visible'));
  }

  function hideModal(){
    const modal = document.getElementById('cookie-settings-modal');
    if(!modal) return;
    modal.classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(()=> modal.style.display = 'none', 300);
  }

  function acceptAll(){
    const allSettings = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    saveSettings(allSettings);
    hideBanner();
    hideModal();
  }

  function saveCustomSettings(){
    const settings = {
      necessary: true,
      functional: document.getElementById('cookie-functional').checked,
      analytics: document.getElementById('cookie-analytics').checked,
      marketing: document.getElementById('cookie-marketing').checked
    };
    saveSettings(settings);
    hideBanner();
    hideModal();
  }

  function init(){
    if(getConsent()) return; // already accepted
    
    // Show banner after small delay
    setTimeout(showBanner, 400);
    
    // Banner buttons
    const accept = document.getElementById('cookie-accept');
    const settingsBtn = document.getElementById('cookie-settings');
    
    if(accept) accept.addEventListener('click', acceptAll);
    if(settingsBtn) settingsBtn.addEventListener('click', ()=>{
      hideBanner();
      showModal();
    });

    // Modal buttons
    const closeBtn = document.querySelector('.cookie-modal-close');
    const saveBtn = document.getElementById('cookie-save-settings');
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const overlay = document.querySelector('.cookie-modal-overlay');

    if(closeBtn) closeBtn.addEventListener('click', hideModal);
    if(overlay) overlay.addEventListener('click', hideModal);
    if(saveBtn) saveBtn.addEventListener('click', saveCustomSettings);
    if(acceptAllBtn) acceptAllBtn.addEventListener('click', acceptAll);

    // ESC key to close modal
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') hideModal();
    });
  }

  // Allow opening the settings from other controls
  function openSettings(){ 
    showModal(); 
  }
  window.showCookieSettings = openSettings;

  // Delegate clicks on any inline settings button
  document.addEventListener('click', function(e){
    const t = e.target;
    if(t && t.classList && t.classList.contains('cookie-settings-inline')){
      e.preventDefault();
      openSettings();
    }
  });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();