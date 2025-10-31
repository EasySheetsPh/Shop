function handleFormSubmit(form, endpoint) {
	form.addEventListener('submit', async function(e) {
		e.preventDefault();
		const submitBtn = form.querySelector('button[type="submit"]');
		const originalText = submitBtn.textContent;
		submitBtn.disabled = true;
		submitBtn.textContent = 'Sending...';

		try {
			const formData = new FormData(form);
			const response = await fetch(endpoint, {
				method: 'POST',
				body: formData,
				headers: { 'Accept': 'application/json' }
			});

			if (response.ok) {
				const successMsg = document.createElement('div');
				successMsg.className = 'success-message';
				successMsg.textContent = 'Message sent! We\'ll reply within 24 hours.';
				form.insertAdjacentElement('beforebegin', successMsg);
				form.reset();
				submitBtn.textContent = originalText;
				submitBtn.disabled = false;
				setTimeout(() => successMsg.remove(), 4000);
			} else {
				const errorMsg = document.createElement('div');
				errorMsg.className = 'error-message';
				errorMsg.textContent = 'Error sending message. Please try again.';
				form.insertAdjacentElement('beforebegin', errorMsg);
				submitBtn.textContent = originalText;
				submitBtn.disabled = false;
				setTimeout(() => errorMsg.remove(), 4000);
			}
		} catch (error) {
			const errorMsg = document.createElement('div');
			errorMsg.className = 'error-message';
			errorMsg.textContent = 'Network error. Please check your connection.';
			form.insertAdjacentElement('beforebegin', errorMsg);
			submitBtn.textContent = originalText;
			submitBtn.disabled = false;
			setTimeout(() => errorMsg.remove(), 4000);
		}
	});
}

function initNavIndicator(){
	const nav = document.querySelector('header nav');
	if(!nav) return;
	const links = Array.from(nav.querySelectorAll('a'));

	let indicator = nav.querySelector('.nav-indicator');
	if(!indicator){
		indicator = document.createElement('div');
		indicator.className = 'nav-indicator';
		nav.appendChild(indicator);
	}

	let bubble = nav.querySelector('.nav-bubble');
	const prefersCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
	const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if(!bubble && !prefersCoarse && !reducedMotion){
		bubble = document.createElement('div');
		bubble.className = 'nav-bubble';
		nav.insertBefore(bubble, indicator);
	}

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
			const bubbleLeft = left - 8;
			const bubbleWidth = Math.max(30, width + 16);
			bubble.style.width = bubbleWidth + 'px';
			bubble.style.transform = `translateX(${bubbleLeft}px)`;
			bubble.classList.add('visible');
		}
	}

	function hideIndicator(){
		const active = nav.querySelector('a.nav-active');
		if(active){ placeIndicator(active); return; }
		indicator.classList.remove('visible');
		if(bubble) bubble.classList.remove('visible');
	}

	function findActiveLink(){
		const path = location.pathname.split('/').pop() || 'index.html';
		let active = links.find(l => {
			try{ const url = new URL(l.href, location.href); return (url.pathname.split('/').pop() || '') === path; }catch(e){ return false; }
		});
		if(!active && (path === '' || path === 'index.html')){
			active = links.find(l => l.getAttribute('href') === 'index.html' || l.getAttribute('href') === '#home');
		}
		return active;
	}

	let currentActive = findActiveLink();
	if(currentActive){
		currentActive.classList.add('nav-active');
		placeIndicator(currentActive);
	}

	links.forEach(link => {
		link.addEventListener('mouseenter', () => placeIndicator(link));
		link.addEventListener('focus', () => placeIndicator(link));

		link.addEventListener('click', (ev) => {
			createRipple(ev, link);
			if(currentActive) currentActive.classList.remove('nav-active');
			link.classList.add('nav-active');
			currentActive = link;
			placeIndicator(link);
		});

		let tooltipTimer = null;
		link.addEventListener('mouseenter', () => {
			if(bubble) placeIndicator(link);
			if(prefersCoarse || reducedMotion) return;
			tooltipTimer = setTimeout(() => showTooltip(link), 450);
		});
		link.addEventListener('mouseleave', () => { clearTimeout(tooltipTimer); hideTooltip(); });
		link.addEventListener('blur', () => { clearTimeout(tooltipTimer); hideTooltip(); });
	});

	function createRipple(ev, el){
		if(prefersCoarse) return;
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
		requestAnimationFrame(() => span.classList.add('animate'));
		setTimeout(() => { span.remove(); }, 300);
	}

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
		const r = link.getBoundingClientRect();
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

	window.addEventListener('resize', () => {
		const hovered = nav.querySelector('a:hover, a:focus');
		if(hovered) placeIndicator(hovered);
		else if(currentActive) placeIndicator(currentActive);
	});
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNavIndicator);
else initNavIndicator();
