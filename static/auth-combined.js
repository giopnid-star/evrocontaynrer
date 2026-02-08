document.addEventListener('DOMContentLoaded', function(){
  function setup(containerSelector){
    const container = document.querySelector(containerSelector);
    if(!container) return;
    // create combined button
    const combined = document.createElement('div');
    combined.className = 'auth-combined';
    combined.innerHTML = `
      <button class="auth-combined-btn" aria-haspopup="true" aria-expanded="false">🔐 Вход / 📝</button>
      <div class="auth-combined-menu" role="menu" aria-hidden="true">
        <a href="login.html" role="menuitem">Войти</a>
        <a href="register.html" role="menuitem">Регистрация</a>
      </div>
    `;
    container.appendChild(combined);

    const btn = combined.querySelector('.auth-combined-btn');
    const menu = combined.querySelector('.auth-combined-menu');

    function open(){
      combined.classList.add('open');
      btn.setAttribute('aria-expanded','true');
      menu.setAttribute('aria-hidden','false');
    }
    function close(){
      combined.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      menu.setAttribute('aria-hidden','true');
    }

    btn.addEventListener('click', function(e){
      e.stopPropagation();
      if(combined.classList.contains('open')) close(); else open();
    });

    document.addEventListener('click', function(e){
      if(!e.target.closest('.auth-combined')) close();
    });
  }

  // Attempt to attach to header auth area (index) and contact auth container
  setup('.auth-container');
  setup('#auth-widget');
});