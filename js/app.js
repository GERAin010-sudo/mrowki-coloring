/* ============================================
   MRÓWKI COLORING — SPA App (Strict Corporate)
   ============================================ */

(function() {
  'use strict';

  /* === SVG ICON LIBRARY (stroke-based, minimal) === */
  const ICONS = {
    window: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="0"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
    door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20"/><rect x="7" y="5" width="10" height="12"/><circle cx="15" cy="14" r="1"/></svg>',
    facade: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="18"/><rect x="5" y="7" width="5" height="5"/><rect x="14" y="7" width="5" height="5"/><rect x="5" y="15" width="5" height="5"/><rect x="14" y="15" width="5" height="5"/><line x1="2" y1="4" x2="12" y2="1"/><line x1="22" y1="4" x2="12" y2="1"/></svg>',
    gate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18"/><line x1="2" y1="7" x2="22" y2="7"/><line x1="2" y1="11" x2="22" y2="11"/><line x1="2" y1="15" x2="22" y2="15"/><line x1="2" y1="19" x2="22" y2="19"/></svg>',
    sill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="4"/><line x1="4" y1="10" x2="4" y2="18"/><line x1="20" y1="10" x2="20" y2="18"/><line x1="2" y1="6" x2="2" y2="4"/><line x1="22" y1="6" x2="22" y2="4"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><rect x="9" y="18" width="6" height="4"/></svg>',
    hardhat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 18h20v2H2z"/><path d="M4 18v-4a8 8 0 0116 0v4"/><line x1="12" y1="6" x2="12" y2="2"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="6" width="22" height="12" rx="0"/><line x1="5" y1="6" x2="5" y2="10"/><line x1="9" y1="6" x2="9" y2="12"/><line x1="13" y1="6" x2="13" y2="10"/><line x1="17" y1="6" x2="17" y2="12"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16"/><polyline points="22,4 12,13 2,4"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  };

  /* === PAGE TEMPLATES === */

  function homePage() {
    return `
      <!-- HERO -->
      <section class="hero">
        <div class="hero-bg">
          <img src="assets/images/hero-bg.jpg" alt="Profesjonalne lakierowanie">
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-logo">
            <img src="assets/images/logo.png" alt="Mrówki Coloring">
            <div class="hero-logo-name">MRÓWKI COLORING</div>
          </div>
          <h1 class="hero-title">
            Profesjonalne<br>
            <span class="hero-title-accent">lakierowanie stolarki otworowej</span>
          </h1>
          <p class="hero-subtitle">
            Okna, drzwi, fasady, elewacje, konstrukcje stalowe — stolarka otworowa z aluminium to nasz świat. Od 2000 roku dostarczamy najwyższą jakość wykończenia.
          </p>
          <div class="hero-actions">
            <a href="#oferta" class="btn btn--primary btn--lg" data-page="oferta">ZOBACZ OFERTĘ</a>
            <a href="#kontakt" class="btn btn--outline-light btn--lg" data-page="kontakt">SKONTAKTUJ SIĘ</a>
          </div>
        </div>
        <div class="hero-scroll-indicator">
          <div class="hero-scroll-mouse"></div>
          PRZEWIŃ
        </div>
      </section>

      <!-- PHOTOS STRIP -->
      <div class="photos-strip">
        <img src="assets/images/work-01.jpg" alt="Lakierowanie drzwi aluminiowych">
        <img src="assets/images/work-04.jpg" alt="Maskowanie przed lakierowaniem">
        <img src="assets/images/work-06.jpg" alt="Profesjonalne wykończenie">
        <img src="assets/images/work-07.jpg" alt="Lakierowanie profili okiennych">
      </div>

      <!-- SERVICES -->
      <section class="section" id="services-home">
        <div class="container">
          <div class="section-header text-center reveal">
            <span class="section-label">Nasza oferta</span>
            <h2 class="section-title">Czym się zajmujemy</h2>
            <div class="divider"></div>
            <p class="section-subtitle" style="margin:0 auto;">Specjalizujemy się w profesjonalnym lakierowaniu i naprawach stolarki otworowej z aluminium</p>
          </div>
          <div class="services-grid stagger-children reveal">
            <div class="service-card">
              <div class="service-card-img"><img src="assets/images/work-01.jpg" alt="Stolarka okienna"></div>
              <div class="service-card-body">
                <div class="service-card-title">Stolarka okienna</div>
                <p class="service-card-desc">Lakierowanie profili aluminiowych okiennych z precyzyjnym doborem kolorystyki wg wzorników RAL.</p>
                <div class="service-card-arrow">Więcej <span>${ICONS.arrow}</span></div>
              </div>
            </div>
            <div class="service-card">
              <div class="service-card-img"><img src="assets/images/work-03.jpg" alt="Drzwi aluminiowe"></div>
              <div class="service-card-body">
                <div class="service-card-title">Drzwi aluminiowe</div>
                <p class="service-card-desc">Odświeżanie i lakierowanie drzwi wejściowych — całościowo lub punktowo.</p>
                <div class="service-card-arrow">Więcej <span>${ICONS.arrow}</span></div>
              </div>
            </div>
            <div class="service-card">
              <div class="service-card-img"><img src="assets/images/work-05.jpg" alt="Fasady budynków"></div>
              <div class="service-card-body">
                <div class="service-card-title">Fasady budynków</div>
                <p class="service-card-desc">Lakierowanie aluminiowych elementów fasad z zachowaniem spójności kolorystycznej.</p>
                <div class="service-card-arrow">Więcej <span>${ICONS.arrow}</span></div>
              </div>
            </div>
            <div class="service-card">
              <div class="service-card-img"><img src="assets/images/work-14.jpg" alt="Bramy i windy"></div>
              <div class="service-card-body">
                <div class="service-card-title">Bramy i windy</div>
                <p class="service-card-desc">Naprawa i lakierowanie powierzchni bram, wind i balustrad aluminiowych.</p>
                <div class="service-card-arrow">Więcej <span>${ICONS.arrow}</span></div>
              </div>
            </div>
            <div class="service-card">
              <div class="service-card-img"><img src="assets/images/work-08.jpg" alt="Parapety"></div>
              <div class="service-card-body">
                <div class="service-card-title">Parapety</div>
                <p class="service-card-desc">Precyzyjne lakierowanie parapetów z aluminium w dowolnym kolorze.</p>
                <div class="service-card-arrow">Więcej <span>${ICONS.arrow}</span></div>
              </div>
            </div>
            <div class="service-card">
              <div class="service-card-img"><img src="assets/images/work-15.jpg" alt="Poprawki lakiernicze"></div>
              <div class="service-card-body">
                <div class="service-card-title">Poprawki lakiernicze</div>
                <p class="service-card-desc">Punktowe korekty uszkodzeń — idealnie dobrany odcień, niewidoczna naprawa.</p>
                <div class="service-card-arrow">Więcej <span>${ICONS.arrow}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- STATS -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid reveal stagger-children">
            <div>
              <div class="stat-number" data-target="25">0</div>
              <div class="stat-label">Lat doświadczenia</div>
            </div>
            <div>
              <div class="stat-number" data-target="5000">0</div>
              <div class="stat-label">Zrealizowanych projektów</div>
            </div>
            <div>
              <div class="stat-number" data-target="200">0</div>
              <div class="stat-label">Aktywnych klientów</div>
            </div>
            <div>
              <div class="stat-number" data-target="98">0</div>
              <div class="stat-label">Zadowolenie klientów %</div>
            </div>
          </div>
        </div>
      </section>

      <!-- WHY US -->
      <section class="section section--gray" id="why-us-home">
        <div class="container">
          <div class="section-header text-center reveal">
            <span class="section-label">Dlaczego my</span>
            <h2 class="section-title">Współpraca z nami</h2>
            <div class="divider"></div>
          </div>
          <div class="why-grid reveal stagger-children">
            <div class="why-card">
              <div class="why-card-icon">${ICONS.star}</div>
              <div class="why-card-title">Najwyższa jakość</div>
              <p class="why-card-desc">Profesjonalne materiały i sprawdzone technologie lakiernicze.</p>
            </div>
            <div class="why-card">
              <div class="why-card-icon">${ICONS.shield}</div>
              <div class="why-card-title">Bezpieczeństwo</div>
              <p class="why-card-desc">Pełne zabezpieczenie powierzchni, ochrona antykorozyjna.</p>
            </div>
            <div class="why-card">
              <div class="why-card-icon">${ICONS.truck}</div>
              <div class="why-card-title">Dojeżdżamy do klienta</div>
              <p class="why-card-desc">Mobilna ekipa — realizujemy zlecenia na terenie całej Polski.</p>
            </div>
            <div class="why-card">
              <div class="why-card-icon">${ICONS.target}</div>
              <div class="why-card-title">Precyzja</div>
              <p class="why-card-desc">Każdy projekt traktujemy indywidualnie z dbałością o detale.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- GALLERY STRIP -->
      <div class="photos-strip">
        <img src="assets/images/work-02.jpg" alt="Lakierowanie okien">
        <img src="assets/images/work-10.jpg" alt="Proces lakierowania">
        <img src="assets/images/work-03.jpg" alt="Maskowanie profili">
        <img src="assets/images/work-14.jpg" alt="Lakierowanie bramy">
      </div>

      <!-- CTA -->
      <section class="cta-section">
        <div class="container reveal">
          <h2 class="cta-title">Potrzebujesz wyceny?</h2>
          <p class="cta-subtitle">Skontaktuj się z nami — przygotujemy indywidualną ofertę dopasowaną do Twoich potrzeb.</p>
          <div class="cta-actions">
            <a href="#kontakt" class="btn btn--dark btn--lg" data-page="kontakt">WYŚLIJ ZAPYTANIE</a>
          </div>
          <div class="cta-phone">
            <a href="tel:+48794149921" style="color:white; text-decoration:none;">+48 794 149 921</a>
          </div>
        </div>
      </section>
    `;
  }

  function ofertaPage() {
    return `
      <section class="hero" style="min-height:50vh">
        <div class="hero-bg"><img src="assets/images/work-01.jpg" alt="Oferta"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content" style="padding:var(--space-xl)">
          <span class="section-label" style="color:rgba(255,255,255,0.6)">Nasza oferta</span>
          <h1 class="hero-title" style="font-size:var(--fs-h1)">Usługi lakiernicze</h1>
          <p class="hero-subtitle">Kompleksowe lakierowanie stolarki otworowej z aluminium</p>
        </div>
      </section>

      <section class="offer-section">
        <div class="container">
          <div class="offer-detail reveal">
            <div class="offer-detail-img"><img src="assets/images/work-01.jpg" alt="Stolarka okienna"></div>
            <div>
              <div class="offer-detail-number">01</div>
              <h3 class="offer-detail-title">Stolarka okienna</h3>
              <p class="offer-detail-text">Lakierowanie profili aluminiowych okiennych to nasza główna specjalizacja. Dokonujemy precyzyjnego doboru kolorystyki wg wzorników RAL. Pracujemy na budowach, w halach produkcyjnych i bezpośrednio u klientów.</p>
              <div class="divider"></div>
              <p class="offer-detail-text">Wykonujemy zarówno pełne lakierowanie, jak i punktowe naprawy uszkodzeń transportowych i montażowych.</p>
            </div>
          </div>
          <div class="offer-detail reveal">
            <div class="offer-detail-img"><img src="assets/images/work-04.jpg" alt="Drzwi aluminiowe"></div>
            <div>
              <div class="offer-detail-number">02</div>
              <h3 class="offer-detail-title">Drzwi aluminiowe</h3>
              <p class="offer-detail-text">Odświeżamy i lakierujemy drzwi wejściowe, przesuwne i automatyczne. Pracujemy z systemami wszystkich producentów — od drzwi wewnętrznych po zewnętrzne konstrukcje przeciwpożarowe.</p>
              <div class="divider"></div>
              <p class="offer-detail-text">Gwarantujemy trwałość powłoki i estetykę wykończenia na najwyższym poziomie.</p>
            </div>
          </div>
          <div class="offer-detail reveal">
            <div class="offer-detail-img"><img src="assets/images/work-05.jpg" alt="Fasady budynków"></div>
            <div>
              <div class="offer-detail-number">03</div>
              <h3 class="offer-detail-title">Fasady i elewacje</h3>
              <p class="offer-detail-text">Lakierowanie aluminiowych elementów fasad — słupki, rygiele, klapy i panele elewacyjne. Dbamy o spójność kolorystyczną i estetykę całego budynku.</p>
              <div class="divider"></div>
              <p class="offer-detail-text">Realizujemy projekty na nowobudowanych obiektach oraz renowacje istniejących fasad.</p>
            </div>
          </div>
          <div class="offer-detail reveal">
            <div class="offer-detail-img"><img src="assets/images/work-07.jpg" alt="Bramy i konstrukcje"></div>
            <div>
              <div class="offer-detail-number">04</div>
              <h3 class="offer-detail-title">Bramy, windy, konstrukcje</h3>
              <p class="offer-detail-text">Naprawy i lakierowanie bram garażowych, wind, balustrad oraz wszelkich konstrukcji aluminiowych i stalowych. Zabezpieczenia antykorozyjne i odtworzenia powłok lakierniczych.</p>
              <div class="divider"></div>
              <p class="offer-detail-text">Każde zlecenie traktujemy indywidualnie, dostosowując technologię do specyfiki projektu.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <div class="container reveal">
          <h2 class="cta-title">Zainteresowany naszymi usługami?</h2>
          <p class="cta-subtitle">Skontaktuj się, a przygotujemy szczegółową wycenę.</p>
          <div class="cta-actions">
            <a href="#kontakt" class="btn btn--dark btn--lg" data-page="kontakt">SKONTAKTUJ SIĘ</a>
          </div>
        </div>
      </section>
    `;
  }

  function oNasPage() {
    return `
      <section class="hero" style="min-height:50vh">
        <div class="hero-bg"><img src="assets/images/about-bg.jpg" alt="O nas"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content" style="padding:var(--space-xl)">
          <span class="section-label" style="color:rgba(255,255,255,0.6)">O firmie</span>
          <h1 class="hero-title" style="font-size:var(--fs-h1)">Mrówki Coloring</h1>
          <p class="hero-subtitle">Profesjonalny partner w lakierowaniu stolarki otworowej od 2000 roku.</p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="about-content reveal">
            <div>
              <span class="section-label">Nasza historia</span>
              <h2 class="section-title">25 lat na rynku</h2>
              <div class="divider"></div>
              <p style="color:var(--text-secondary);margin-bottom:var(--space-xl);line-height:var(--lh-normal);">
                Firma Mrówki Coloring zaczynała w 2000 roku jako mała, ale ambitna ekipa malarzy. Już wtedy wiedzieliśmy, że stolarka aluminiowa — okna, drzwi, fasady — potrzebuje specjalistów, którzy rozumieją materiał.
              </p>
              <p style="color:var(--text-secondary);margin-bottom:var(--space-xl);line-height:var(--lh-normal);">
                Dziś to ponad 25 lat doświadczenia, setki zadowolonych klientów i tysiące zrealizowanych projektów na terenie całej Polski. Specjalizujemy się w lakierowaniu natryskowym na budowach, w halach produkcyjnych i u klientów.
              </p>
              <div class="timeline" style="margin-top:var(--space-2xl);">
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-year">2000</div>
                  <div class="timeline-text">Założenie firmy. Pierwsze zlecenia lakiernicze w Poznaniu.</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-year">2005</div>
                  <div class="timeline-text">Rozszerzenie usług o lakierowanie fasad i konstrukcji stalowych.</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-year">2010</div>
                  <div class="timeline-text">Współpraca z największymi deweloperami w Wielkopolsce.</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-year">2020</div>
                  <div class="timeline-text">Ponad 4000 zrealizowanych projektów. Działalność w całej Polsce.</div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-dot"></div>
                  <div class="timeline-year">2025</div>
                  <div class="timeline-text">25 lat na rynku. Nowy rozdział — technologia i innowacja.</div>
                </div>
              </div>
            </div>
            <div class="about-image-wrapper">
              <img src="assets/images/work-18.jpg" alt="Praca lakiernicza na budowie">
              <div class="about-image-badge">
                <div class="about-image-badge-number">25+</div>
                <div class="about-image-badge-text">Lat doświadczenia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- WHY US -->
      <section class="section section--gray">
        <div class="container">
          <div class="section-header text-center reveal">
            <span class="section-label">Nasze atuty</span>
            <h2 class="section-title">Dlaczego warto z nami współpracować</h2>
            <div class="divider"></div>
          </div>
          <div class="why-grid reveal stagger-children">
            <div class="why-card">
              <div class="why-card-icon">${ICONS.star}</div>
              <div class="why-card-title">Doświadczenie</div>
              <p class="why-card-desc">Ponad 25 lat praktyki w lakierowaniu stolarki aluminiowej.</p>
            </div>
            <div class="why-card">
              <div class="why-card-icon">${ICONS.target}</div>
              <div class="why-card-title">Precyzja</div>
              <p class="why-card-desc">Dokładny dobór kolorów RAL i najwyższa staranność wykonania.</p>
            </div>
            <div class="why-card">
              <div class="why-card-icon">${ICONS.truck}</div>
              <div class="why-card-title">Mobilność</div>
              <p class="why-card-desc">Dojeżdżamy na budowy i realizujemy zlecenia w terenie.</p>
            </div>
            <div class="why-card">
              <div class="why-card-icon">${ICONS.shield}</div>
              <div class="why-card-title">Gwarancja</div>
              <p class="why-card-desc">Trwałe powłoki i gwarancja na wykonane prace.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- WORK PHOTOS -->
      <div class="photos-strip">
        <img src="assets/images/work-02.jpg" alt="Praca na budowie">
        <img src="assets/images/work-08.jpg" alt="Lakierowanie profili">
        <img src="assets/images/work-11.jpg" alt="Poprawki lakiernicze">
        <img src="assets/images/work-15.jpg" alt="Realizacja projektu">
      </div>
    `;
  }

  function realizacjePage() {
    return `
      <section class="hero" style="min-height:50vh">
        <div class="hero-bg"><img src="assets/images/work-05.jpg" alt="Realizacje"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content" style="padding:var(--space-xl)">
          <span class="section-label" style="color:rgba(255,255,255,0.6)">Portfolio</span>
          <h1 class="hero-title" style="font-size:var(--fs-h1)">Nasze realizacje</h1>
          <p class="hero-subtitle">Przegląd wybranych projektów lakierniczych.</p>
        </div>
      </section>

      <section class="section" style="padding:var(--space-3xl) 0 var(--space-4xl)">
        <div class="container">
          <div class="gallery-filters reveal">
            <button class="gallery-filter-btn active" data-filter="all">Wszystkie</button>
            <button class="gallery-filter-btn" data-filter="okna">Okna</button>
            <button class="gallery-filter-btn" data-filter="drzwi">Drzwi</button>
            <button class="gallery-filter-btn" data-filter="fasady">Fasady</button>
            <button class="gallery-filter-btn" data-filter="bramy_windy">Bramy</button>
            <button class="gallery-filter-btn" data-filter="parapety">Parapety</button>
            <button class="gallery-filter-btn" data-filter="inne">Inne</button>
          </div>
          <div class="masonry-gallery reveal" id="masonry-gallery">
            <div class="masonry-loading">Ładowanie galerii...</div>
          </div>
        </div>
      </section>

      <!-- Lightbox -->
      <div class="lightbox-pro" id="lightbox-pro">
        <div class="lightbox-pro-backdrop"></div>
        <button class="lightbox-pro-close" id="lightbox-close-pro">&times;</button>
        <button class="lightbox-pro-nav lightbox-pro-prev" id="lightbox-prev">&lsaquo;</button>
        <button class="lightbox-pro-nav lightbox-pro-next" id="lightbox-next">&rsaquo;</button>
        <div class="lightbox-pro-content">
          <img class="lightbox-pro-img" id="lightbox-img-pro" alt="">
          <div class="lightbox-pro-caption">
            <div class="lightbox-pro-title" id="lightbox-title-pro"></div>
            <div class="lightbox-pro-desc" id="lightbox-desc-pro"></div>
          </div>
        </div>
        <div class="lightbox-pro-counter" id="lightbox-counter-pro"></div>
      </div>
    `;
  }

  function kontaktPage() {
    return `
      <section class="hero" style="min-height:50vh">
        <div class="hero-bg"><img src="assets/images/work-18.jpg" alt="Kontakt"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content" style="padding:var(--space-xl)">
          <span class="section-label" style="color:rgba(255,255,255,0.6)">Kontakt</span>
          <h1 class="hero-title" style="font-size:var(--fs-h1)">Skontaktuj się z nami</h1>
          <p class="hero-subtitle">Chętnie odpowiemy na pytania i przedstawimy ofertę.</p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="contact-grid reveal">
            <div>
              <span class="section-label">Napisz lub zadzwoń</span>
              <h2 class="section-title">Dane kontaktowe</h2>
              <div class="divider"></div>
              <div class="contact-info" style="margin-top:var(--space-2xl);">
                <div class="contact-info-item">
                  <div class="contact-info-icon">${ICONS.phone}</div>
                  <div>
                    <div class="contact-info-label">Telefon</div>
                    <div class="contact-info-value"><a href="tel:+48794149921">+48 794 149 921</a></div>
                  </div>
                </div>
                <div class="contact-info-item">
                  <div class="contact-info-icon">${ICONS.mail}</div>
                  <div>
                    <div class="contact-info-label">Email</div>
                    <div class="contact-info-value"><a href="mailto:kontakt@mrowki-coloring.pl">kontakt@mrowki-coloring.pl</a></div>
                  </div>
                </div>
                <div class="contact-info-item">
                  <div class="contact-info-icon">${ICONS.pin}</div>
                  <div>
                    <div class="contact-info-label">Adres</div>
                    <div class="contact-info-value">ul. S. Taczaka 24/01<br>61-819, Poznań</div>
                  </div>
                </div>
                <div class="contact-info-item">
                  <div class="contact-info-icon">${ICONS.clock}</div>
                  <div>
                    <div class="contact-info-label">Godziny pracy</div>
                    <div class="contact-info-value">Pon – Pt: 8:00 – 18:00</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="contact-form-wrapper">
              <h3 style="margin-bottom:var(--space-xl);font-family:var(--font-heading);">Wyślij zapytanie</h3>
              <form id="contact-form">
                <div class="form-group">
                  <label class="form-label">Imię i nazwisko *</label>
                  <input class="form-input" type="text" name="name" required placeholder="Jan Kowalski">
                </div>
                <div class="form-group">
                  <label class="form-label">Firma</label>
                  <input class="form-input" type="text" name="company" placeholder="Nazwa firmy">
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input class="form-input" type="email" name="email" placeholder="jan@firma.pl">
                </div>
                <div class="form-group">
                  <label class="form-label">Telefon *</label>
                  <input class="form-input" type="tel" name="phone" required placeholder="+48 ...">
                </div>
                <div class="form-group">
                  <label class="form-label">Wiadomość</label>
                  <textarea class="form-textarea" name="message" placeholder="Opisz swoje potrzeby..."></textarea>
                </div>
                <button type="submit" class="btn btn--primary" style="width:100%;">WYŚLIJ WIADOMOŚĆ</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /* === ROUTING === */
  const pages = {
    home: homePage,
    oferta: ofertaPage,
    'o-nas': oNasPage,
    realizacje: realizacjePage,
    kontakt: kontaktPage,
  };

  function getPage() {
    const hash = location.hash.replace('#', '') || 'home';
    return hash;
  }

  function navigate(page) {
    const content = document.getElementById('page-content');
    const renderFn = pages[page] || pages.home;
    content.innerHTML = renderFn();
    window.scrollTo(0, 0);

    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    // Init page features
    initScrollReveal();
    initCounters();
    initGallery();
    initLightbox();
    initForm();

    // Close mobile menu
    document.getElementById('mobile-menu-overlay')?.classList.remove('active');
    document.getElementById('nav-toggle')?.classList.remove('active');
  }

  window.addEventListener('hashchange', () => navigate(getPage()));

  /* === NAV EVENTS === */
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      location.hash = page === 'home' ? '' : page;
      if (page === 'home') navigate('home');
    });
  });

  // Dynamic links inside SPA content
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-page]');
    if (link && !link.closest('.navbar') && !link.closest('.mobile-menu-overlay') && !link.closest('.footer')) {
      e.preventDefault();
      const page = link.dataset.page;
      location.hash = page === 'home' ? '' : page;
      if (page === 'home') navigate('home');
    }
  });

  // Mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const mobileOverlay = document.getElementById('mobile-menu-overlay');
  if (toggle && mobileOverlay) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
    });
    mobileOverlay.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        mobileOverlay.classList.remove('active');
      });
    });
  }

  // Scroll effects
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const progress = document.querySelector('.scroll-progress');
    const scrollY = window.scrollY;

    if (navbar) navbar.classList.toggle('scrolled', scrollY > 50);
    if (progress) {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (scrollY / height * 100) + '%';
    }
  });

  /* === SCROLL REVEAL === */
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  }

  /* === COUNTERS === */
  function initCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  function animateCounter(el, target) {
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString() + (target < 100 && target !== 25 ? '%' : '+');
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }
    }, 25);
  }

  /* === GALLERY === */
  const CRM_API = 'http://localhost:3000';
  
  // Fallback hardcoded photos
  const FALLBACK_PHOTOS = [
    { tytul:'Stolarka okienna', opis:'Lakierowanie profili RAL 7016', kategoria:'okna', plik:'', src:'assets/images/work-01.jpg' },
    { tytul:'Przygotowanie powierzchni', opis:'Proces maskowania i szlifowania', kategoria:'okna', plik:'', src:'assets/images/work-05.jpg' },
    { tytul:'Drzwi aluminiowe', opis:'Lakierowanie drzwi wejściowych', kategoria:'drzwi', plik:'', src:'assets/images/work-04.jpg' },
    { tytul:'Fasada biurowca', opis:'Renowacja profili fasadowych', kategoria:'fasady', plik:'', src:'assets/images/work-06.jpg' },
    { tytul:'Realizacja na budowie', opis:'Lakierowanie na miejscu montażu', kategoria:'okna', plik:'', src:'assets/images/work-02.jpg' },
    { tytul:'Elementy stalowe', opis:'Zabezpieczenie antykorozyjne', kategoria:'inne', plik:'', src:'assets/images/work-07.jpg' },
    { tytul:'Drzwi balkonowe', opis:'Lakierowanie i renowacja', kategoria:'drzwi', plik:'', src:'assets/images/work-03.jpg' },
    { tytul:'Panel elewacyjny', opis:'Lakierowanie paneli fasadowych', kategoria:'fasady', plik:'', src:'assets/images/work-10.jpg' },
    { tytul:'Brama garażowa', opis:'Lakierowanie bramy segmentowej', kategoria:'bramy_windy', plik:'', src:'assets/images/work-14.jpg' },
    { tytul:'Stolarka okienna', opis:'Projekt deweloperski', kategoria:'okna', plik:'', src:'assets/images/work-08.jpg' },
    { tytul:'Poprawki lakiernicze', opis:'Naprawa uszkodzeń transportowych', kategoria:'poprawki', plik:'', src:'assets/images/work-09.jpg' },
    { tytul:'Elewacja budynku', opis:'Kompleksowe lakierowanie fasady', kategoria:'fasady', plik:'', src:'assets/images/work-15.jpg' },
  ];

  let galleryData = [];
  let filteredData = [];
  let currentLightboxIndex = 0;

  async function initGallery() {
    const container = document.getElementById('masonry-gallery');
    if (!container) return;

    // Try loading from API, fallback to hardcoded
    try {
      const res = await fetch(`${CRM_API}/api/realizacje`);
      if (res.ok) {
        const apiPhotos = await res.json();
        if (apiPhotos.length > 0) {
          galleryData = apiPhotos.map(p => ({
            ...p,
            src: `${CRM_API}/uploads/${p.plik}`
          }));
        } else {
          galleryData = [...FALLBACK_PHOTOS];
        }
      } else {
        galleryData = [...FALLBACK_PHOTOS];
      }
    } catch(e) {
      galleryData = [...FALLBACK_PHOTOS];
    }

    // Merge: API photos first, then fallback
    if (galleryData.length > 0 && galleryData[0].id) {
      // If we got API data, also add fallback photos
      galleryData = [...galleryData, ...FALLBACK_PHOTOS];
    }

    filteredData = [...galleryData];
    renderMasonryGallery(container);
    initGalleryFilters();
  }

  function renderMasonryGallery(container) {
    if (!filteredData.length) {
      container.innerHTML = '<div class="masonry-empty">Brak zdjęć w galerii</div>';
      return;
    }

    // Masonry heights for visual interest
    const heights = ['masonry-tall', 'masonry-normal', 'masonry-normal', 'masonry-wide', 'masonry-normal', 'masonry-tall'];
    
    container.innerHTML = filteredData.map((photo, i) => `
      <div class="masonry-item ${heights[i % heights.length]}" data-category="${photo.kategoria}" data-index="${i}" style="animation-delay:${i * 0.06}s">
        <img src="${photo.src}" alt="${photo.tytul}" loading="lazy">
        <div class="masonry-overlay">
          <div class="masonry-overlay-inner">
            <span class="masonry-cat">${getCategoryLabel(photo.kategoria)}</span>
            <h3 class="masonry-title">${photo.tytul}</h3>
            ${photo.opis ? `<p class="masonry-desc">${photo.opis}</p>` : ''}
          </div>
          <div class="masonry-zoom">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click events for lightbox
    container.querySelectorAll('.masonry-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        openProLightbox(idx);
      });
    });
  }

  function getCategoryLabel(cat) {
    const labels = { okna:'Okna', drzwi:'Drzwi', fasady:'Fasady', bramy_windy:'Bramy/Windy', parapety:'Parapety', poprawki:'Poprawki', inne:'Inne' };
    return labels[cat] || cat;
  }

  function initGalleryFilters() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        filteredData = filter === 'all' ? [...galleryData] : galleryData.filter(p => p.kategoria === filter);
        const container = document.getElementById('masonry-gallery');
        if (container) renderMasonryGallery(container);
      });
    });
  }

  /* === PRO LIGHTBOX === */
  function openProLightbox(index) {
    currentLightboxIndex = index;
    const lb = document.getElementById('lightbox-pro');
    if (!lb) return;
    updateProLightbox();
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProLightbox() {
    const lb = document.getElementById('lightbox-pro');
    if (lb) lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateProLightbox() {
    const photo = filteredData[currentLightboxIndex];
    if (!photo) return;
    document.getElementById('lightbox-img-pro').src = photo.src;
    document.getElementById('lightbox-title-pro').textContent = photo.tytul;
    document.getElementById('lightbox-desc-pro').textContent = photo.opis || '';
    document.getElementById('lightbox-counter-pro').textContent = `${currentLightboxIndex + 1} / ${filteredData.length}`;
  }

  function initLightbox() {
    const lb = document.getElementById('lightbox-pro');
    if (!lb) return;

    document.getElementById('lightbox-close-pro')?.addEventListener('click', closeProLightbox);
    lb.querySelector('.lightbox-pro-backdrop')?.addEventListener('click', closeProLightbox);
    
    document.getElementById('lightbox-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      currentLightboxIndex = (currentLightboxIndex - 1 + filteredData.length) % filteredData.length;
      updateProLightbox();
    });

    document.getElementById('lightbox-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      currentLightboxIndex = (currentLightboxIndex + 1) % filteredData.length;
      updateProLightbox();
    });

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') closeProLightbox();
      if (e.key === 'ArrowLeft') { currentLightboxIndex = (currentLightboxIndex - 1 + filteredData.length) % filteredData.length; updateProLightbox(); }
      if (e.key === 'ArrowRight') { currentLightboxIndex = (currentLightboxIndex + 1) % filteredData.length; updateProLightbox(); }
    });
  }

  /* === FORM === */
  function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'WYSŁANO ✓';
      btn.style.background = 'var(--success)';
      btn.style.borderColor = 'var(--success)';
      setTimeout(() => {
        btn.textContent = 'WYŚLIJ WIADOMOŚĆ';
        btn.style.background = '';
        btn.style.borderColor = '';
        form.reset();
      }, 3000);
    });
  }

  /* === LOADING === */
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('loading-screen')?.classList.add('hidden');
    }, 500);
  });

  /* === INIT === */
  navigate(getPage());

})();
