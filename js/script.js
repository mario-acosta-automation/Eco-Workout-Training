/**
 * script.js - EcoWorkout CV Digital
 * Funcionalidades: menú hamburguesa, precios desde Google Sheets y carrusel de competencias.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ================================================================
    // 1. MENÚ HAMBURGUESA
    // ================================================================
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    menuToggle.addEventListener('click', function () {
        mainNav.classList.toggle('open');
        const icon = this.querySelector('i');
        icon.className = mainNav.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    });

    document.querySelectorAll('.header-nav a').forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('open');
            menuToggle.querySelector('i').className = 'fas fa-bars';
        });
    });

    // ================================================================
    // 2. PRECIOS DESDE GOOGLE SHEETS (CORREGIDO)
    // ================================================================

    // ✅ REEMPLAZA ESTOS DATOS CON LOS TUYOS (obtenidos de la URL de edición)
    const SHEET_ID = 'TU_ID_DE_EDICION_AQUI'; // Ejemplo: '1ABC123_xyz'
    const SHEET_GID = '1546839515';           // El gid de la pestaña 'precios pagina'
    const SHEET_NAME = 'precios pagina';      // Nombre exacto de la pestaña

    // URL para la API de Google Visualization (usando gid, más fiable)
    const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;

    // URL alternativa usando el nombre de la pestaña (por si falla la anterior)
    const URL_ALT = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

    const pricingContainer = document.getElementById('pricing-container');

    // Mostrar mensaje de carga
    pricingContainer.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Cargando planes...</div>`;

    // Función para renderizar los precios
    function renderPricing(data) {
        if (!data.table || !data.table.rows || data.table.rows.length === 0) {
            pricingContainer.innerHTML = '<p style="color: #4a6a4a;">No hay planes disponibles. Contáctame directamente.</p>';
            return;
        }

        const cols = data.table.cols.map(col => col.label);
        let html = '';
        data.table.rows.forEach(row => {
            const cells = row.c;
            if (!cells || cells.length === 0) return;
            const values = {};
            cells.forEach((cell, index) => {
                const label = cols[index] || `Columna ${index + 1}`;
                values[label] = cell ? cell.v : '';
            });
            const keys = Object.keys(values);
            const plan = values[keys[0]] || 'Plan';
            const precio = values[keys[1]] || '';
            const desc = values[keys[2]] || '';

            html += `
                <div class="pricing-card">
                    <h4>${plan}</h4>
                    <div class="price">${precio}</div>
                    ${desc ? `<div class="desc">${desc}</div>` : ''}
                </div>
            `;
        });

        pricingContainer.innerHTML = html || '<p style="color: #4a6a4a;">No se encontraron datos.</p>';
    }

    // Función para intentar la carga con diferentes URLs
    function fetchPricing(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(text => {
                // Extraer el JSON de la respuesta (tiene prefijo)
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}') + 1;
                if (jsonStart === -1 || jsonEnd === 0) throw new Error('Formato de respuesta inválido');
                const jsonString = text.substring(jsonStart, jsonEnd);
                const parsed = JSON.parse(jsonString);
                renderPricing(parsed);
            })
            .catch(error => {
                console.error('Error con la URL:', url, error);
                // Si falla la primera URL, probar la alternativa
                if (url === URL) {
                    console.warn('Intentando con URL alternativa (usando sheet)...');
                    fetchPricing(URL_ALT);
                } else {
                    // Si ambas fallan, mostrar mensaje de error
                    pricingContainer.innerHTML = `
                        <div style="background:#fce4ec; padding:1rem; border-radius:12px; border-left:4px solid #c62828;">
                            <strong>⚠️ No se pudieron cargar los precios.</strong><br>
                            Verifica que tu hoja esté publicada (Archivo > Compartir > Publicar en la web) y que el ID de la hoja sea el correcto.
                            <br><br>
                            <strong>ID usado:</strong> ${SHEET_ID}<br>
                            <strong>gid usado:</strong> ${SHEET_GID}<br>
                            <strong>Nombre de pestaña:</strong> ${SHEET_NAME}
                        </div>
                    `;
                }
            });
    }

    // Verificar que el ID no sea el de ejemplo
    if (SHEET_ID === 'TU_ID_DE_EDICION_AQUI') {
        pricingContainer.innerHTML = `
            <div style="background:#fff3e0; padding:1rem; border-radius:12px; border-left:4px solid #e65100;">
                <strong>⚠️ Configuración pendiente:</strong> Reemplaza <code>TU_ID_DE_EDICION_AQUI</code> en el archivo <code>js/script.js</code> con el ID de tu hoja de cálculo (el que aparece en la URL de edición).
            </div>
        `;
    } else {
        // Iniciar la carga
        fetchPricing(URL);
    }

    // ================================================================
    // 3. CARRUSEL DE COMPETENCIAS (sin cambios)
    // ================================================================
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');

    const competenciasData = [
        { nombre: 'Corre como el viento (FAC)', img: 'assets/competencias/corre-viento.jpg' },
        { nombre: 'Carrera por la Policía', img: 'assets/competencias/carrera-policia.jpg' },
        { nombre: 'Batalla de Ayacucho dos siglos de Gloria', img: 'assets/competencias/batalla-ayacucho.jpg' },
        { nombre: 'Bimbo global Racer', img: 'assets/competencias/bimbo-global.jpg' },
        { nombre: 'Primer Festival de Cross Country MTB', img: 'assets/competencias/festival-cross.jpg' },
        { nombre: 'Campeonato distrital', img: 'assets/competencias/campeonato-distrital.jpg' },
        { nombre: 'Ruta Fucsia Colombina (Parceros MTB/Ruta)', img: 'assets/competencias/ruta-fucsia.jpg' },
        { nombre: 'MMB 10K', img: 'assets/competencias/mmb10k.jpg' },
        { nombre: 'NatGeo 10K', img: 'assets/competencias/natgeo10k.jpg' },
        { nombre: 'Carrera de la Mujer 10K', img: 'assets/competencias/mujer10k.jpg' },
        { nombre: 'Carrera verde', img: 'assets/competencias/carrera-verde.jpg' }
    ];

    const ITEMS_PER_SLIDE = 3;
    let currentIndex = 0;
    let slides = [];

    function buildSlides() {
        const groups = [];
        for (let i = 0; i < competenciasData.length; i += ITEMS_PER_SLIDE) {
            groups.push(competenciasData.slice(i, i + ITEMS_PER_SLIDE));
        }
        return groups;
    }

    function renderCarousel() {
        slides = buildSlides();
        track.innerHTML = '';
        dotsContainer.innerHTML = '';

        if (slides.length === 0) {
            track.innerHTML = '<p style="padding:1rem; text-align:center; color:#4a6a4a;">No hay competencias para mostrar.</p>';
            return;
        }

        slides.forEach((group) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'carousel-slide';

            group.forEach(item => {
                const card = document.createElement('div');
                card.className = 'competencia-card';

                const img = document.createElement('img');
                img.src = item.img;
                img.alt = item.nombre;
                img.loading = 'lazy';
                img.onerror = function() {
                    this.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'no-img';
                    fallback.innerHTML = '<i class="fas fa-running"></i>';
                    card.insertBefore(fallback, this);
                };

                const title = document.createElement('span');
                title.className = 'slide-title';
                title.textContent = item.nombre;

                card.appendChild(img);
                card.appendChild(title);
                slideDiv.appendChild(card);
            });

            track.appendChild(slideDiv);
        });

        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement('button');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }

        updateCarousel();
    }

    function updateCarousel() {
        if (slides.length === 0) return;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;
        updateCarousel();
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    let autoPlayInterval = null;
    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 3500);
    }
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    const carouselContainer = document.querySelector('.carousel-container');
    carouselContainer.addEventListener('mouseenter', stopAutoPlay);
    carouselContainer.addEventListener('mouseleave', startAutoPlay);
    carouselContainer.addEventListener('touchstart', stopAutoPlay);
    carouselContainer.addEventListener('touchend', startAutoPlay);

    renderCarousel();
    startAutoPlay();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel();
        }, 150);
    });
});
