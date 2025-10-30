/* =========================
   Easy Sheets — Script
   Author: Easy Sheets Team
   ========================= */

(function () {
  // Smooth scrolling for nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // CTA button interactions
  const buyNowBtn = document.getElementById('buyNowBtn');
  const purchaseBtn = document.getElementById('purchaseBtn');

  function openCheckout() {
    window.open('https://yourshoplink.com', '_blank');
  }

  if (buyNowBtn) buyNowBtn.addEventListener('click', openCheckout);
  if (purchaseBtn) purchaseBtn.addEventListener('click', openCheckout);

  // Accessibility: Keyboard focus styles
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
  });
})();
