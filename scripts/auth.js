// Auth frontend: handles login/register/logout and current user UI
(function(){
  function qs(sel, ctx){ return (ctx||document).querySelector(sel); }
  function qsa(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  function openModal(){ const m = qs('#auth-modal'); if(!m) return; m.hidden = false; document.body.style.overflow='hidden'; }
  function closeModal(){ const m = qs('#auth-modal'); if(!m) return; m.hidden = true; document.body.style.overflow=''; }

  function setHeaderForUser(user){
    const loginLink = qs('#nav-login');
    if(!loginLink) return;
    if(user){
      loginLink.textContent = user.email;
      // add logout
      loginLink.href = '#';
      loginLink.addEventListener('click', function(e){ e.preventDefault(); doLogout(); }, { once:true });
    } else {
      loginLink.innerHTML = '로그인 <svg class="icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c2-4 6-6 8-6s6 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      qs('#nav-login').href = '#';
      qs('#nav-login').addEventListener('click', function(e){ e.preventDefault(); openModal(); });
    }
  }

  async function fetchMe(){ try{ const r = await fetch('/api/me', { credentials:'include' }); if(!r.ok) return null; const j = await r.json(); return j.user || null; }catch(e){ return null; } }

  async function doLogin(email,password){
    const r = await fetch('/api/login',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }), credentials:'include' });
    return r;
  }
  async function doRegister(email,password){
    const r = await fetch('/api/register',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }), credentials:'include' });
    return r;
  }
  async function doLogout(){ const r = await fetch('/api/logout',{ method:'POST', credentials:'include' }); if(r.ok){ setHeaderForUser(null); } }

  document.addEventListener('DOMContentLoaded', async function(){
    // wire modal
    const modal = qs('#auth-modal');
    if(modal){
      qs('.auth-close', modal).addEventListener('click', closeModal);
      qs('.auth-modal-backdrop', modal).addEventListener('click', closeModal);
      const form = qs('#auth-form');
      const msg = qs('.auth-msg');
      form.addEventListener('submit', async function(e){
        e.preventDefault();
        const fm = new FormData(form); const email = fm.get('email'); const password = fm.get('password');
        const mode = form.querySelector('button[type=submit]').dataset.mode || 'login';
        msg.textContent = '';
        try{
          if(mode === 'login'){
            const r = await doLogin(email,password);
            const j = await r.json();
            if(!r.ok){ msg.textContent = j.error || '로그인 실패'; return; }
            closeModal();
            setHeaderForUser(j.user);
          }
        }catch(err){ msg.textContent = '에러'; }
      });
      // register button
      qsa('button[data-mode="register"]', modal).forEach(function(btn){ btn.addEventListener('click', async function(){ const email = qs('#auth-form [name=email]').value; const password = qs('#auth-form [name=password]').value; const r = await doRegister(email,password); const j = await r.json(); if(!r.ok){ qs('.auth-msg').textContent = j.error || '회원가입 실패'; return; } setHeaderForUser(j.user); closeModal(); }); });
    }

    // initial user check
    const user = await fetchMe();
    setHeaderForUser(user);
  });
})();

