/**
 * THIỆP MỜI LỄ TỐT NGHIỆP - BRIGHT PEARL & CHAMPAGNE GOLD EDITION
 * Script tối ưu Điện Thoại:
 * 1. Cảm biến nghiêng con quay hồi chuyển (DeviceOrientation / Gyroscope 3D Tilt)
 * 2. Vệt bụi sao & chùm pháo hoa mini khi chạm ngón tay (Touch Particle Trail)
 * 3. Phản hồi rung xúc giác (Haptic Vibration) khi bấm nút
 * 4. Mở phong bì 3D, Tung nón cử nhân, Đồng hồ đếm ngược, Sổ lời chúc
 */

(function () {
  // Lấy dữ liệu cấu hình
  const conf = window.GRADUATION_INVITE || {};
  const titleCase = s => String(s || '').toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase());

  // Hỗ trợ cá nhân hóa tên khách mời:
  // 1. Ưu tiên hàng đầu: Query parameter ?to=Tên+Khách hoặc ?guest=... hoặc ?name=...
  // 2. Tra cứu slug trong conf.guests (chỉ khi chạy web http/https và không phải file .html)
  const defaultGuest = conf.guestName || 'Bạn và Gia đình';
  const urlParams = new URLSearchParams(window.location.search);
  const paramGuest = urlParams.get('to') || urlParams.get('guest') || urlParams.get('name');

  if (paramGuest && paramGuest.trim()) {
    conf.guestName = paramGuest.trim();
  } else if (window.location.protocol !== 'file:') {
    // Chỉ phân tích pathname khi chạy trên máy chủ web (http/https), bỏ qua khi mở trực tiếp file:/// trên máy
    const segments = window.location.pathname.split('/').filter(Boolean);
    const lastSegment = decodeURIComponent(segments.pop() || '').toLowerCase();
    const ignored = ['', 'index', 'index.html', 'tao-link', 'tao-link.html', 'admin', 'admin.html'];

    let foundName = null;
    if (lastSegment && !ignored.includes(lastSegment) && !lastSegment.endsWith('.html')) {
      if (conf.guests && typeof conf.guests === 'object') {
        const matchedKey = Object.keys(conf.guests).find(k => k.toLowerCase() === lastSegment);
        if (matchedKey && conf.guests[matchedKey]) {
          foundName = conf.guests[matchedKey];
        }
      }
    }
    conf.guestName = foundName || defaultGuest;
  } else {
    conf.guestName = defaultGuest;
  }

  // Cập nhật tiêu đề trang web theo tên khách mời
  if (conf.guestName && conf.guestName !== defaultGuest) {
    document.title = `Thiệp Mời Tốt Nghiệp Kỹ Sư - Kính mời ${conf.guestName}`;
  }

  // Tiện ích thao tác DOM
  const $ = id => document.getElementById(id);
  const setText = (id, text) => {
    const el = $(id);
    if (el && text !== undefined && text !== null) {
      el.textContent = text;
    }
  };

  // Rung xúc giác trên điện thoại
  function triggerHaptic(pattern = [30]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // Đổ dữ liệu vào giao diện
  const shortName = conf.shortName || titleCase(conf.graduateName || 'Lai Trung Tín');
  setText('envelopeName', shortName);
  setText('openingGuest', conf.guestName || 'Bạn và Gia đình');
  setText('guestName', conf.guestName || 'Bạn và Gia đình');
  if ($('wishSender') && conf.guestName && conf.guestName !== defaultGuest) {
    $('wishSender').value = conf.guestName;
  }
  setText('graduateName', conf.graduateName || 'LAI TRUNG TÍN');
  setText('degree', conf.degree || 'Kỹ sư');
  setText('university', conf.university || 'ĐẠI HỌC CẦN THƠ');
  setText('faculty', conf.faculty || 'Khoa Chuyên Ngành');
  setText('message', conf.message);
  setText('quote', conf.quote ? `"${conf.quote.replace(/^"|"$/g, '')}"` : '');
  setText('signOff', conf.signOff || 'Rất mong được gặp bạn!');
  setText('familyNote', conf.familyNote || 'Trân trọng kính mời');
  setText('graduateSignature', titleCase(conf.graduateName || 'Lai Trung Tín'));

  // Năm tốt nghiệp
  const ceremonyDate = new Date(conf.ceremonyDate || '2026-10-31T14:00:00+07:00');
  const year = Number.isFinite(ceremonyDate.getTime()) ? ceremonyDate.getFullYear() : new Date().getFullYear();
  setText('classYear', year);

  // Thời gian & Địa điểm
  setText('time', conf.time || '14:00');
  setText('displayDate', conf.displayDate || 'Thứ Bảy, 31 tháng 10 năm 2026');
  if (conf.timeNote) setText('timeNote', conf.timeNote);
  setText('venue', conf.venue || 'Hội trường Rùa, Đại học Cần Thơ');
  setText('address', conf.address || 'Khu II, Đường 3/2, Xuân Khánh, Ninh Kiều, TP. Cần Thơ');

  // Điện thoại liên hệ
  const phone = conf.phone || '0706942875';
  const formattedPhone = phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1.$2.$3');
  setText('phoneDisplay', `${shortName}: ${formattedPhone}`);
  if ($('callBtn')) $('callBtn').href = `tel:${phone}`;
  if ($('zaloBtn')) $('zaloBtn').href = `https://zalo.me/${phone}`;

  if ($('mapLink') && conf.mapUrl) {
    $('mapLink').href = conf.mapUrl;
  }

  // =========================================================================
  // 1. CANVAS BỤI VÀNG & HIỆU ỨNG CHẠM TAY TRÊN ĐIỆN THOẠI (TOUCH PARTICLE ENGINE)
  // =========================================================================
  const canvas = $('sparkleCanvas');
  const particles = [];
  const touchParticles = [];

  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    // Hạt bụi vàng bay nền
    class AmbientStar {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.size = Math.random() * 2.2 + 0.6;
        this.speedY = -(Math.random() * 0.4 + 0.15);
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.alpha = Math.random() * 0.7 + 0.2;
        this.alphaSpeed = (Math.random() * 0.02 + 0.006) * (Math.random() > 0.5 ? 1 : -1);
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.alpha += this.alphaSpeed;
        if (this.alpha > 0.85 || this.alpha < 0.15) this.alphaSpeed = -this.alphaSpeed;
        if (this.y < -15 || this.x < -15 || this.x > width + 15) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        ctx.fillStyle = '#d4af37';
        ctx.shadowBlur = this.size * 3;
        ctx.shadowColor = '#f5d77f';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Hạt sao bừng sáng khi chạm ngón tay trên điện thoại
    class TouchSparkle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3.5 + 1.5;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 0.8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = Math.random() * 0.035 + 0.02;
        this.color = Math.random() > 0.4 ? '#dfba73' : (Math.random() > 0.5 ? '#fce29d' : '#ffffff');
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.94;
        this.vy *= 0.94;
        this.life -= this.decay;
      }
      draw() {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffd97d';
        ctx.beginPath();
        // Vẽ hình ngôi sao 4 cánh nhỏ
        const r = this.size;
        ctx.moveTo(this.x, this.y - r);
        ctx.lineTo(this.x + r * 0.3, this.y - r * 0.3);
        ctx.lineTo(this.x + r, this.y);
        ctx.lineTo(this.x + r * 0.3, this.y + r * 0.3);
        ctx.lineTo(this.x, this.y + r);
        ctx.lineTo(this.x - r * 0.3, this.y + r * 0.3);
        ctx.lineTo(this.x - r, this.y);
        ctx.lineTo(this.x - r * 0.3, this.y - r * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    const maxAmbient = Math.min(45, Math.floor((width * height) / 22000));
    for (let i = 0; i < maxAmbient; i++) {
      particles.push(new AmbientStar());
    }

    function addTouchSparklesAt(x, y, count = 5) {
      for (let i = 0; i < count; i++) {
        touchParticles.push(new TouchSparkle(x, y));
      }
    }

    // Lắng nghe sự kiện chạm tay trên điện thoại
    window.addEventListener('touchstart', e => {
      const touch = e.touches[0];
      if (touch) addTouchSparklesAt(touch.clientX, touch.clientY, 8);
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      const touch = e.touches[0];
      if (touch) addTouchSparklesAt(touch.clientX, touch.clientY, 2);
    }, { passive: true });

    // Rê chuột trên máy tính
    window.addEventListener('mousemove', e => {
      if (Math.random() > 0.4) addTouchSparklesAt(e.clientX, e.clientY, 1);
    }, { passive: true });

    function renderEngine() {
      ctx.clearRect(0, 0, width, height);

      // Render hạt bụi nền
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      // Render hạt tương tác chạm
      for (let i = touchParticles.length - 1; i >= 0; i--) {
        const p = touchParticles[i];
        p.update();
        p.draw();
        if (p.life <= 0) touchParticles.splice(i, 1);
      }

      requestAnimationFrame(renderEngine);
    }
    renderEngine();
  }

  // =========================================================================
  // 2. HIỆU ỨNG 3D PARALLAX TILT & HOLOGRAM THEO GÓC NGHIÊNG ĐIỆN THOẠI
  // =========================================================================
  const tiltCard = $('tiltCard');
  const hologramSheen = $('hologramSheen');
  let currentTiltX = 0, currentTiltY = 0;
  let targetTiltX = 0, targetTiltY = 0;

  function applyTilt() {
    currentTiltX += (targetTiltX - currentTiltX) * 0.12;
    currentTiltY += (targetTiltY - currentTiltY) * 0.12;

    if (tiltCard) {
      tiltCard.style.transform = `rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
    }
    if (hologramSheen) {
      const angle = 120 + currentTiltY * 2.5 + currentTiltX * 1.5;
      hologramSheen.style.setProperty('--sheen-angle', `${angle}deg`);
      hologramSheen.style.opacity = Math.min(0.45, 0.2 + (Math.abs(currentTiltX) + Math.abs(currentTiltY)) * 0.02);
    }
    requestAnimationFrame(applyTilt);
  }
  applyTilt();

  // 1. Cảm biến con quay hồi chuyển trên điện thoại (DeviceOrientation)
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', e => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma: nghiêng trái (-)/phải (+), beta: nghiêng tới/lui
        const gamma = Math.max(-25, Math.min(25, e.gamma));
        const beta = Math.max(-25, Math.min(25, e.beta - 45)); // Tư thế cầm điện thoại ~45 độ
        targetTiltY = gamma * 0.38;
        targetTiltX = -beta * 0.32;
      }
    }, { passive: true });
  }

  // 2. Di chuột trên máy tính
  const tiltContainer = $('tiltCardContainer');
  if (tiltContainer) {
    tiltContainer.addEventListener('mousemove', e => {
      const rect = tiltContainer.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetTiltY = (x / (rect.width / 2)) * 8;
      targetTiltX = -(y / (rect.height / 2)) * 8;
    });

    tiltContainer.addEventListener('mouseleave', () => {
      targetTiltX = 0;
      targetTiltY = 0;
    });
  }

  // =========================================================================
  // 3. HIỆU ỨNG PHÁO HOA KIM TUYẾN & TUNG NÓN CỬ NHÂN
  // =========================================================================
  function launchConfetti(count = 45) {
    const layer = $('confettiLayer');
    if (!layer) return;

    // Bảng màu kim tuyến: Xanh Hy Vọng & Bạc Ánh Kim
    const currentPalette = ['#3283dc', '#1e67b5', '#b9d8fa', '#ffffff', '#fae4a8'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      const startX = Math.random() * 100;
      const endX = startX + (Math.random() * 30 - 15);
      const rot = Math.random() * 920 - 460;
      const dur = (2.6 + Math.random() * 2.2).toFixed(2);
      const delay = (Math.random() * 0.5).toFixed(2);
      const color = currentPalette[i % currentPalette.length];

      p.style.left = startX + 'vw';
      p.style.background = color;
      p.style.width = (Math.random() * 7 + 6) + 'px';
      p.style.height = (Math.random() * 10 + 10) + 'px';
      p.style.setProperty('--x-start', '0px');
      p.style.setProperty('--x-end', (endX - startX) * 8 + 'px');
      p.style.setProperty('--rot', rot + 'deg');
      p.style.setProperty('--dur', dur + 's');
      p.style.animationDelay = delay + 's';

      layer.appendChild(p);
      setTimeout(() => p.remove(), 5500);
    }
  }

  function tossGraduationCaps(numCaps = 14) {
    triggerHaptic([40, 50, 40, 50, 60]);
    const emojis = ['🎓', '🎓', '✨', '🎓', '🎉', '🎓', '📜'];
    for (let i = 0; i < numCaps; i++) {
      const cap = document.createElement('div');
      cap.className = 'tossed-cap';
      cap.textContent = emojis[i % emojis.length];

      const startX = (15 + Math.random() * 70) + 'vw';
      const midX = (Math.random() * 80 - 40) + 'px';
      const endX = (Math.random() * 160 - 80) + 'px';
      const rot = (Math.random() * 720 - 360) + 'deg';
      const dur = (2.2 + Math.random() * 1.5).toFixed(2);

      cap.style.left = startX;
      cap.style.setProperty('--startX', '0px');
      cap.style.setProperty('--midX', midX);
      cap.style.setProperty('--endX', endX);
      cap.style.setProperty('--rot', rot);
      cap.style.setProperty('--dur', dur + 's');
      cap.style.animationDelay = (Math.random() * 0.4).toFixed(2) + 's';

      document.body.appendChild(cap);
      setTimeout(() => cap.remove(), 4000);
    }
    launchConfetti(50);
  }

  $('tossCapBtn')?.addEventListener('click', () => {
    tossGraduationCaps();
    showToast('🎓 Chúc mừng Tân Kỹ Sư rạng rỡ! ✨');
  });

  // =========================================================================
  // 4. MỞ PHONG BÌ THƯ NGỌC TRAI TƯƠI SÁNG
  // =========================================================================
  const envelope = $('envelope');
  const openingScreen = $('openingScreen');

  function openEnvelope() {
    if (!envelope || envelope.classList.contains('opening-anim')) return;

    triggerHaptic([35, 40, 50]);
    envelope.classList.add('opening-anim');
    launchConfetti(55);

    tryPlayAudio();

    setTimeout(() => {
      if (openingScreen) {
        openingScreen.classList.add('hide');
        document.body.classList.remove('locked');
      }
      setTimeout(() => {
        document.querySelectorAll('.card-section .reveal').forEach(el => el.classList.add('visible'));
      }, 150);
    }, 700);
  }

  $('waxSealBtn')?.addEventListener('click', openEnvelope);
  $('openInviteBtn')?.addEventListener('click', openEnvelope);

  // =========================================================================
  // 5. ĐỒNG HỒ ĐẾM NGƯỢC HOÀNG KIM
  // =========================================================================
  function updateCountdown() {
    const target = ceremonyDate.getTime();
    if (!Number.isFinite(target)) return;

    let diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    diff %= 86400000;
    const hours = Math.floor(diff / 3600000);
    diff %= 3600000;
    const minutes = Math.floor(diff / 60000);
    diff %= 60000;
    const seconds = Math.floor(diff / 1000);

    setText('days', String(days).padStart(2, '0'));
    setText('hours', String(hours).padStart(2, '0'));
    setText('minutes', String(minutes).padStart(2, '0'));
    setText('seconds', String(seconds).padStart(2, '0'));
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // =========================================================================
  // 6. XÁC NHẬN THAM DỰ (RSVP) & TOAST
  // =========================================================================
  const toast = $('toast');
  let toastTimer = null;
  function showToast(message, icon = '✨') {
    if (!toast) return;
    const msgEl = toast.querySelector('.toast-msg');
    const iconEl = toast.querySelector('.toast-icon');
    if (msgEl) msgEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function handleConfirmAttendance() {
    triggerHaptic([30, 40, 50]);
    const confirmBtn = $('confirmBtn');
    const heroConfirmBtn = $('heroConfirmBtn');
    const textEl = $('confirmBtnText');

    if (textEl) textEl.textContent = 'Đã xác nhận tham dự';
    if (confirmBtn) confirmBtn.classList.add('confirmed');
    if (heroConfirmBtn) {
      heroConfirmBtn.textContent = '✓ Đã xác nhận tham dự';
      heroConfirmBtn.style.background = 'rgba(197, 155, 68, 0.2)';
    }

    showToast('Cảm ơn bạn! Hẹn gặp bạn tại buổi lễ tốt nghiệp 🎓', '🎓');
    launchConfetti(45);
    localStorage.setItem('grad_confirmed', 'true');
  }

  $('confirmBtn')?.addEventListener('click', handleConfirmAttendance);
  $('heroConfirmBtn')?.addEventListener('click', handleConfirmAttendance);

  if (localStorage.getItem('grad_confirmed') === 'true') {
    const textEl = $('confirmBtnText');
    if (textEl) textEl.textContent = 'Đã xác nhận tham dự';
    if ($('heroConfirmBtn')) $('heroConfirmBtn').textContent = '✓ Đã xác nhận tham dự';
  }

  // =========================================================================
  // 7. LƯU LỊCH NHẮC HẸN (GOOGLE CALENDAR)
  // =========================================================================
  $('calendarBtn')?.addEventListener('click', () => {
    triggerHaptic([25]);
    if (!Number.isFinite(ceremonyDate.getTime())) {
      showToast('Chưa thiết lập ngày diễn ra buổi lễ.');
      return;
    }

    const end = new Date(ceremonyDate.getTime() + 3 * 60 * 60 * 1000);
    const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = encodeURIComponent(`Lễ Tốt Nghiệp - ${conf.graduateName || 'Tân Cử Nhân'}`);
    const details = encodeURIComponent(conf.message || 'Lễ tốt nghiệp trang trọng.');
    const location = encodeURIComponent([conf.venue, conf.address].filter(Boolean).join(', '));

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(ceremonyDate)}/${fmt(end)}&details=${details}&location=${location}`;
    window.open(googleUrl, '_blank', 'noopener');
    showToast('Đang mở Google Calendar để lưu lịch hẹn 📅', '📅');
  });

  // =========================================================================
  // 8. GỬI LỜI CHÚC MỪNG RIÊNG TƯ ĐẾN TÂN KỸ SƯ (KHÔNG CÔNG KHAI)
  // =========================================================================
  function getSavedWishes() {
    try {
      const stored = localStorage.getItem('grad_wishes');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveWishLocally(wish) {
    try {
      const list = getSavedWishes();
      list.unshift(wish);
      localStorage.setItem('grad_wishes', JSON.stringify(list));
    } catch (err) {}
  }

  // Gửi lời chúc vào file JSON (API /api/wishes hoặc kho lưu JSON trực tuyến)
  async function sendWishToCloud(wish) {
    // 1. Gửi đến endpoint backend /api/wishes (tự động ghi thẳng vào file wishes.json khi chạy server.js)
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wish)
      });
      if (res.ok) return;
    } catch (err) {}

    // 2. Gửi đến link file JSON trực tuyến (nếu cấu hình trong config.js)
    const jsonEndpoint = conf.wishesJsonUrl || conf.wishesWebhookUrl;
    if (jsonEndpoint && typeof jsonEndpoint === 'string' && jsonEndpoint.trim()) {
      try {
        fetch(jsonEndpoint.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wish)
        }).catch(() => {});
      } catch (e) {}
    }
  }

  const wishForm = $('wishForm');
  const wishSuccessCard = $('wishSuccessCard');

  wishForm?.addEventListener('submit', e => {
    e.preventDefault();
    const sender = ($('wishSender')?.value || '').trim();
    const msg = ($('wishMessage')?.value || '').trim();

    if (!sender || !msg) {
      showToast('Vui lòng nhập tên và lời chúc của bạn nhé!');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ngày ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const newWish = {
      name: sender,
      message: msg,
      time: timeStr,
      timestamp: Date.now()
    };

    // 1. Lưu vào bộ nhớ máy
    saveWishLocally(newWish);

    // 2. Đẩy về Google Sheets / Webhook trung tâm (nếu có cấu hình)
    sendWishToCloud(newWish);

    // 3. Ẩn form và hiện thông báo cảm ơn riêng tư
    wishForm.style.display = 'none';
    if (wishSuccessCard) {
      wishSuccessCard.style.display = 'block';
    }

    showToast('Cảm ơn bạn đã gửi lời chúc ý nghĩa! 💖', '💖');
    tossGraduationCaps(6);
  });

  $('sendAnotherWishBtn')?.addEventListener('click', () => {
    if (wishSuccessCard) wishSuccessCard.style.display = 'none';
    if (wishForm) {
      wishForm.style.display = 'block';
      if ($('wishMessage')) $('wishMessage').value = '';
    }
  });

  // =========================================================================
  // 10. ÂM NHẠC & DU DƯƠNG NHẸ NHÀNG (WEB AUDIO PIANO / MP3)
  // =========================================================================
  const musicPlayer = $('musicPlayer');
  const soundToggle = $('soundToggle');
  const floatingMusicBtn = $('floatingMusicBtn');
  let isPlayingAudio = false;
  let synthInterval = null;
  let audioCtx = null;

  if (conf.music?.enabled && conf.music?.src && musicPlayer) {
    musicPlayer.src = conf.music.src;
  }

  function playSynthMelody() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const notes = [
        261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 261.63,
        293.66, 349.23, 440.00, 587.33, 523.25, 440.00, 349.23, 392.00
      ];
      let step = 0;

      function playNote(freq) {
        if (!isPlayingAudio || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 1.25);
      }

      synthInterval = setInterval(() => {
        playNote(notes[step % notes.length]);
        step++;
      }, 550);
    } catch (e) {}
  }

  function setAudioVisual(playing) {
    isPlayingAudio = playing;
    if (playing) {
      soundToggle?.classList.add('playing');
      floatingMusicBtn?.classList.add('playing');
    } else {
      soundToggle?.classList.remove('playing');
      floatingMusicBtn?.classList.remove('playing');
      if (synthInterval) {
        clearInterval(synthInterval);
        synthInterval = null;
      }
    }
  }

  async function tryPlayAudio() {
    if (musicPlayer && conf.music?.enabled && conf.music?.src) {
      try {
        await musicPlayer.play();
        setAudioVisual(true);
      } catch (err) {}
    }
  }

  function toggleAudio() {
    triggerHaptic([20]);
    if (isPlayingAudio) {
      if (musicPlayer && !musicPlayer.paused) {
        musicPlayer.pause();
      }
      setAudioVisual(false);
      showToast('Đã tắt nhạc nền ♫', '♫');
    } else {
      if (musicPlayer && conf.music?.enabled && conf.music?.src) {
        musicPlayer.play().then(() => setAudioVisual(true)).catch(() => {
          playSynthMelody();
          setAudioVisual(true);
        });
      } else {
        playSynthMelody();
        setAudioVisual(true);
      }
      showToast('Đang phát giai điệu chúc mừng ♫', '♫');
    }
  }

  soundToggle?.addEventListener('click', toggleAudio);
  floatingMusicBtn?.addEventListener('click', toggleAudio);

  // =========================================================================
  // 11. SCROLL REVEAL BẰNG INTERSECTION OBSERVER
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));

})();
