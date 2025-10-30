// Nav indicator: creates a moving underline under header nav links on hover/focus
(function(){
	function initNavIndicator(){
		const nav = document.querySelector('header nav');
		if(!nav) return;
		const links = Array.from(nav.querySelectorAll('a'));

		// create indicator element
		let indicator = nav.querySelector('.nav-indicator');
		if(!indicator){
			indicator = document.createElement('div');
			indicator.className = 'nav-indicator';
			// insert indicator
			nav.appendChild(indicator);
		}

		// create bubble element (soft background) if supported
		let bubble = nav.querySelector('.nav-bubble');
		const prefersCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
		const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if(!bubble && !prefersCoarse && !reducedMotion){
			bubble = document.createElement('div');
			bubble.className = 'nav-bubble';
			nav.insertBefore(bubble, indicator);
		}

		// Helper to compute left and width for indicator
		function computePlacement(el){
			const navRect = nav.getBoundingClientRect();
			const r = el.getBoundingClientRect();
			const style = getComputedStyle(el);
			const padLeft = parseFloat(style.paddingLeft) || 0;
			const padRight = parseFloat(style.paddingRight) || 0;
			const left = r.left - navRect.left + padLeft;
			const width = Math.max(12, r.width - (padLeft + padRight));
			return { left, width };
		}

		function placeIndicator(el){
			if(!el) return;
			const { left, width } = computePlacement(el);
			indicator.style.width = width + 'px';
			indicator.style.transform = `translateX(${left}px)`;
			indicator.classList.add('visible');
			if(bubble){
				// slightly larger than indicator for soft feel
				const bubbleLeft = left - 8;
				const bubbleWidth = Math.max(30, width + 16);
				bubble.style.width = bubbleWidth + 'px';
				bubble.style.transform = `translateX(${bubbleLeft}px)`;
				bubble.classList.add('visible');
			}
		}

		function hideIndicator(){
			// if there is an active link, keep indicator there
			const active = nav.querySelector('a.nav-active');
			if(active){ placeIndicator(active); return; }
			indicator.classList.remove('visible');
			if(bubble) bubble.classList.remove('visible');
		}

		// Determine active link by matching pathname or filename
		function findActiveLink(){
			const path = location.pathname.split('/').pop() || 'index.html';
			// prefer exact match of href file name
			let active = links.find(l => {
				try{ const url = new URL(l.href, location.href); return (url.pathname.split('/').pop() || '') === path; }catch(e){ return false; }
			});
			// fallback: if path is index.html treat link to index
			if(!active && (path === '' || path === 'index.html')){
				active = links.find(l => l.getAttribute('href') === 'index.html' || l.getAttribute('href') === '#home');
			}
			return active;
		}

		// set initial active
		let currentActive = findActiveLink();
		if(currentActive){
			currentActive.classList.add('nav-active');
			// place indicator under active initially
			placeIndicator(currentActive);
		}

		links.forEach(link => {
			// show indicator on hover/focus
			link.addEventListener('mouseenter', () => placeIndicator(link));
			link.addEventListener('focus', () => placeIndicator(link));

			// ripple on click + set active
			link.addEventListener('click', (ev) => {
				createRipple(ev, link);
				if(currentActive) currentActive.classList.remove('nav-active');
				link.classList.add('nav-active');
				currentActive = link;
				placeIndicator(link);
			});

			// tooltip on long hover (desktop, not coarse pointers)
			let tooltipTimer = null;
			link.addEventListener('mouseenter', () => {
				if(bubble) placeIndicator(link);
				if(prefersCoarse || reducedMotion) return;
				// slightly snappier tooltip delay (ms)
				tooltipTimer = setTimeout(() => showTooltip(link), 450);
			});
			link.addEventListener('mouseleave', () => { clearTimeout(tooltipTimer); hideTooltip(); });
			link.addEventListener('blur', () => { clearTimeout(tooltipTimer); hideTooltip(); });
		});

		// ripple creation helper
		function createRipple(ev, el){
			if(prefersCoarse) return; // avoid ripple on touch devices
			const rect = el.getBoundingClientRect();
			const size = Math.max(rect.width, rect.height) * 1.2;
			const x = ev.clientX - rect.left - size/2;
			const y = ev.clientY - rect.top - size/2;
			const span = document.createElement('span');
			span.className = 'nav-ripple';
			span.style.width = span.style.height = size + 'px';
			span.style.left = x + 'px';
			span.style.top = y + 'px';
			el.appendChild(span);
			// trigger animation
			requestAnimationFrame(() => span.classList.add('animate'));
			// removal timeout matched to CSS (260ms + small buffer)
			setTimeout(() => { span.remove(); }, 300);
		}

		// tooltip helpers
		let tooltip = null;
		function ensureTooltip(){
			if(tooltip) return tooltip;
			tooltip = document.createElement('div');
			tooltip.id = 'nav-tooltip';
			tooltip.className = 'nav-tooltip';
			document.body.appendChild(tooltip);
			return tooltip;
		}
		function showTooltip(link){
			const tip = ensureTooltip();
			tip.textContent = link.textContent.trim();
			// position above the link
			const r = link.getBoundingClientRect();
			// ensure it's measured
			tip.style.left = '0px';
			tip.style.top = '0px';
			const left = r.left + (r.width/2) - (tip.offsetWidth/2);
			tip.style.left = Math.max(8, left) + 'px';
			tip.style.top = (window.scrollY + r.top - 10 - tip.offsetHeight) + 'px';
			tip.classList.add('visible');
			link.setAttribute('aria-describedby', 'nav-tooltip');
		}
		function hideTooltip(){ if(tooltip) tooltip.classList.remove('visible'); }

		nav.addEventListener('mouseleave', hideIndicator);

		// On resize recalc placement (keep under active or hovered one)
		window.addEventListener('resize', () => {
			// choose hovered/focused or active
			const hovered = nav.querySelector('a:hover, a:focus');
			if(hovered) placeIndicator(hovered);
			else if(currentActive) placeIndicator(currentActive);
		});
	}

	if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNavIndicator);
	else initNavIndicator();
})();
