// LK Team: comportamento da landing page
document.documentElement.classList.add('js');

// Número do WhatsApp com DDI e DDD, só dígitos (ex.: '5548999999999').
// Enquanto estiver vazio, o link abre o WhatsApp para a pessoa escolher o contato.
const WHATSAPP = '5548991210221';

document.querySelectorAll('[data-wa]').forEach((a) => {
  const texto = encodeURIComponent(a.dataset.wa);
  a.href = `https://wa.me/${WHATSAPP}?text=${texto}`;
  a.target = '_blank';
  a.rel = 'noopener';
});

// Fundo da navegação ao rolar
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Entrada dos elementos ao aparecer na tela (escalonada dentro de cada grupo)
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
reveals.forEach((el) => {
  const irmaos = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
  el.style.setProperty('--d', `${Math.min(irmaos.indexOf(el), 6) * 0.08}s`);
  io.observe(el);
});

// Rede de conexões do topo: liga cada card satélite ao card central com curvas
const network = document.getElementById('network');
const networkSvg = document.getElementById('networkLines');
const node = document.getElementById('node');
if (network && networkSvg && node) {
  const sats = [...document.querySelectorAll('.sat')];
  const NS = 'http://www.w3.org/2000/svg';
  const pares = sats.map((sat) => {
    const base = document.createElementNS(NS, 'path');
    const flow = document.createElementNS(NS, 'path');
    base.setAttribute('class', 'node-line');
    base.setAttribute('stroke', sat.dataset.side === 'l' ? 'url(#gradL)' : 'url(#gradR)');
    base.style.animationDelay = `${Math.random() * 2}s`;
    flow.setAttribute('class', 'node-line flow');
    networkSvg.append(base, flow);
    return { sat, base, flow };
  });

  function desenharLinhas() {
    if (getComputedStyle(networkSvg).display === 'none') return;
    const box = network.getBoundingClientRect();
    const n = node.getBoundingClientRect();
    const lados = { l: [], r: [] };
    pares.forEach((p) => lados[p.sat.dataset.side].push(p));
    Object.entries(lados).forEach(([lado, lista]) => {
      lista.forEach((p, i) => {
        const s = p.sat.getBoundingClientRect();
        const sx = (lado === 'l' ? s.right : s.left) - box.left;
        const sy = s.top + s.height / 2 - box.top;
        const ex = (lado === 'l' ? n.left : n.right) - box.left;
        const ey = n.top - box.top + n.height * ((i + 1) / (lista.length + 1));
        const dx = (ex - sx) * 0.55;
        const d = `M${sx},${sy} C${sx + dx},${sy} ${ex - dx},${ey} ${ex},${ey}`;
        p.base.setAttribute('d', d);
        p.flow.setAttribute('d', d);
      });
    });
  }

  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let alvo = { x: 0, y: 0 };
  let atual = { x: 0, y: 0 };
  if (!reduzir) {
    network.addEventListener('mousemove', (e) => {
      const r = network.getBoundingClientRect();
      alvo = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
    });
    network.addEventListener('mouseleave', () => { alvo = { x: 0, y: 0 }; });
  }
  function loop() {
    atual.x += (alvo.x - atual.x) * 0.08;
    atual.y += (alvo.y - atual.y) * 0.08;
    sats.forEach((sat, i) => {
      const f = 10 + (i % 3) * 6;
      sat.style.translate = `${atual.x * f}px ${atual.y * f}px`;
    });
    desenharLinhas();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// Ampliar fotos de resultado
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  document.querySelectorAll('.shot').forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lightbox.showModal();
    });
  });
  lightbox.addEventListener('click', () => lightbox.close());
}

document.getElementById('ano').textContent = new Date().getFullYear();

// Balãozinho de mensagem perto do botão flutuante de WhatsApp, simulando chat do WhatsApp
const waBubble = document.getElementById('waBubble');
if (waBubble) {
  const CHAVE_BOLHA = 'lk-wa-bubble-fechado';
  let bolhaMostrada = false;

  function iniciarSequenciaWaBubble() {
    if (bolhaMostrada || sessionStorage.getItem(CHAVE_BOLHA)) return;
    bolhaMostrada = true;

    const msg1 = document.getElementById('waMsg1');
    const msg2 = document.getElementById('waMsg2');

    if (msg1) {
      const minutos = new Date().getHours() * 60 + new Date().getMinutes();
      const saudacao = (minutos >= 360 && minutos <= 719) ? 'bom dia'
        : (minutos >= 720 && minutos <= 1110) ? 'boa tarde'
        : 'boa noite';
      msg1.textContent = `Oii, ${saudacao}! 👋`;
      msg1.classList.add('in');
      waBubble.classList.add('show-close'); // só mostra o X depois que a mensagem aparece
    }

    if (msg2) {
      setTimeout(() => {
        msg2.classList.add('in'); // mostra "digitando..."
        setTimeout(() => {
          msg2.textContent = 'Dúvidas? É só me chamar por aqui! ❤️';
        }, 3500);
      }, 900);
    }
  }
  window.LK_iniciarSequenciaWaBubble = iniciarSequenciaWaBubble;

  // Sem popup nesta página (ex.: desafio.html): mostra sozinho depois de um tempinho.
  // Em páginas com popup (ex.: index.html), quem decide a hora é o script do popup.
  if (!document.getElementById('promoPopup')) {
    setTimeout(iniciarSequenciaWaBubble, 5000);
  }

  const fecharBolha = waBubble.querySelector('.wa-bubble-close');
  if (fecharBolha) {
    fecharBolha.addEventListener('click', () => {
      waBubble.style.display = 'none';
      sessionStorage.setItem(CHAVE_BOLHA, '1');
    });
  }
}
