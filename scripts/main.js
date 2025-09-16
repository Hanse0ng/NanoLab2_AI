// Slideshow with autoplay toggle
(function(){
  function $all(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }
  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  document.addEventListener('DOMContentLoaded', function(){
    var slideItems = $all('.slides .slide-item');
    if(!slideItems.length) return;
    var dots = $all('.dot');
    var prev = $('.slide-btn.prev');
    var next = $('.slide-btn.next');
    var autoplayBtn = $('.slide-btn.autoplay');
    var idx = slideItems.findIndex(function(si){ return si.classList.contains('active'); });
    if(idx < 0) idx = 0;

    function setActive(i){
      if(i<0) i = slideItems.length-1;
      if(i>=slideItems.length) i = 0;
      slideItems.forEach(function(item,si){
        var overlay = item.querySelector('.slide-overlay');
        if(si===i){ item.classList.add('active'); if(overlay) overlay.classList.add('active'); }
        else { item.classList.remove('active'); if(overlay) overlay.classList.remove('active'); }
      });
      dots.forEach(function(d,di){ d.classList.toggle('active', di===i); });
      idx = i;
    }

    // init
    slideItems.forEach(function(it){ it.classList.remove('active'); var ov=it.querySelector('.slide-overlay'); if(ov) ov.classList.remove('active'); });
    setActive(idx);

    // autoplay
    var autoplayInterval = null;
    var autoplayDelay = 6000; // ms
    function startAutoplay(){ if(autoplayInterval) return; autoplayInterval = setInterval(function(){ setActive((idx+1)%slideItems.length); }, autoplayDelay); if(autoplayBtn){ autoplayBtn.textContent='⏸'; autoplayBtn.setAttribute('aria-pressed','true'); autoplayBtn.dataset.playing='true'; } }
    function stopAutoplay(){ if(!autoplayInterval) return; clearInterval(autoplayInterval); autoplayInterval = null; if(autoplayBtn){ autoplayBtn.textContent='▶'; autoplayBtn.setAttribute('aria-pressed','false'); autoplayBtn.dataset.playing='false'; } }
    // default: paused (do not start)
    if(autoplayBtn){ autoplayBtn.dataset.playing = 'false'; autoplayBtn.textContent='▶'; autoplayBtn.setAttribute('aria-pressed','false'); autoplayBtn.addEventListener('click', function(e){ e.preventDefault(); var playing = this.dataset.playing === 'true'; if(playing) stopAutoplay(); else startAutoplay(); }); }

    // controls
    if(prev) prev.addEventListener('click', function(e){ e.preventDefault(); setActive(idx-1); });
    if(next) next.addEventListener('click', function(e){ e.preventDefault(); setActive(idx+1); });
    dots.forEach(function(d,di){ d.addEventListener('click', function(){ setActive(di); }); d.setAttribute('role','button'); d.setAttribute('tabindex','0'); });

    // keyboard
    document.addEventListener('keydown', function(e){ if(e.key==='ArrowLeft') { setActive(idx-1); } if(e.key==='ArrowRight') { setActive(idx+1); } });
  });
})();

// Header nav collapse (prevent wrap, toggle 'more')
(function(){
  function ready(fn){ if(document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    var header = document.querySelector('.site-header');
    if(!header) return;
    var left = header.querySelector('.left');
    var right = header.querySelector('.right');
    var nav = header.querySelector('.main-nav');
    var more = header.querySelector('.nav-more');
    var expanded = document.getElementById('nav-expanded');
    if(!left || !right || !nav || !more || !expanded) return;

    function showNav(){
      nav.style.display = '';
      more.style.display = 'none';
      more.setAttribute('aria-expanded','false');
      expanded.hidden = true;
      expanded.classList.remove('open');
    }
    function showMore(){
      nav.style.display = 'none';
      more.style.display = 'inline-flex';
    }

    function totalWidth(el){ return el.getBoundingClientRect().width; }

    function checkFit(){
      // Ensure nav visible for measurement
      nav.style.display = '';
      more.style.display = 'none';

      // Measure geometry
      var headerRect = header.getBoundingClientRect();
      var navRect = nav.getBoundingClientRect();
      var rightRect = right.getBoundingClientRect();

      // Available right edge for nav is header's right minus right area width (with small buffer)
      var availRight = headerRect.right - rightRect.width - 8; // 8px buffer

      // If nav's right edge exceeds available right edge, it doesn't fit
      if(navRect.right > availRight){
        showMore();
      } else {
        showNav();
      }
    }

    function populateExpanded(){
      if(expanded.dataset.populated === 'true') return;
      expanded.innerHTML = '<div class="nav-expanded-inner">' + nav.innerHTML + '</div>';
      expanded.dataset.populated = 'true';
    }

    more.addEventListener('click', function(e){
      e.preventDefault();
      populateExpanded();
      var isOpen = expanded.hidden === false;
      if(isOpen){
        expanded.hidden = true;
        expanded.classList.remove('open');
        more.setAttribute('aria-expanded','false');
      } else {
        expanded.hidden = false;
        expanded.classList.add('open');
        more.setAttribute('aria-expanded','true');
      }
    });

    // initial
    checkFit();
    var resizeTimer = null;
    window.addEventListener('resize', function(){
      if(resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(checkFit);
    });
  });
})();

