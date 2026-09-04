/**
 * script.js - EcoWorkout CV Digital
 * Adriana Castañeda García - Personal & Sport Trainer
 * 
 * Funcionalidades:
 * 1. Menú hamburguesa para navegación en móviles.
 * 2. Carga de precios desde Google Sheets (API gviz).
 * 3. Carrusel de competencias deportivas con imágenes.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ================================================================
    // 1. MENÚ HAMBURGUESA
    // ================================================================
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('open');
            const icon = this.querySelector('i');
            if (mainNav.classList.contains('open')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });

        // Cerrar menú al hacer clic en un enlace (para móviles)
        document.querySelectorAll('.header-nav a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }

    // ================================================================
    // 2. PRECIOS DESDE GOOGLE SHEETS
    // ================================================================
    // ID de edición de la hoja de cálculo (copiado de la URL de edición)
    const SHEET_ID = '1rCJeF_AtAovZBUlTz-EGWngYx0-lbLqKkGixX4EWSpg';
    const SHEET_GID = '1546839515';  // ID de la pestaña 'precios pagina'

    // URL para la API de Google Visualization
    const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;

    const pricingContainer = document.getElementById('pricing-container');

    if (pricingContainer) {
        // Mostrar mensaje de carga
        pricingContainer.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i> Cargando planes...</div>`;

        fetch(URL)
            .then(response => response.text())
            .then(text => {
                // La respuesta viene con un prefijo: /*O_o*/ google.visualization.Query.setResponse({...})
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}') + 1;
                if (jsonStart === -1 || jsonEnd === 0) {
                    throw new Error('Formato de respuesta inválido');
                }
                const jsonString = text.substring(jsonStart, jsonEnd);
                const parsed = JSON.parse(jsonString);
                renderPricing(parsed);
            })
            .catch(error => {
                console.error('Error cargando precios:', error);
                pricingContainer.innerHTML = `
                    <div style="background:#fce4ec; padding:1rem; border-radius:12px; border-left:4px solid #c62828;">
                        <strong>⚠️ No se pudieron cargar los precios.</strong><br>
                        Verifica que tu hoja esté publicada (Archivo > Compartir > Publicar en la web) y que el ID de la hoja sea correcto.
                    </div>
                `;
            });
    }

    /**
     * Función que renderiza las tarjetas de precios a partir de los datos de la hoja.
     * Espera que la hoja tenga al menos dos columnas: nombre del plan y precio.
     */
    function renderPricing(data) {
        if (!data.table || !data.table.rows || data.table.rows.length === 0) {
            pricingContainer.innerHTML = '<p style="color: #4a6a4a;">No hay planes disponibles en este momento. Contáctame directamente.</p>';
            return;
        }

        const cols = data.table.cols.map(col => col.label);

        let html = '';
        data.table.rows.forEach(row => {
            const cells = row.c;
            if (!cells || cells.length === 0) return;

            // Construir un objeto con los valores de cada columna
            const values = {};
            cells.forEach((cell, index) => {
                const label = cols[index] || `Columna ${index + 1}`;
                values[label] = cell ? cell.v : '';
            });

            // Asumimos que la primera columna es el nombre del plan y la segunda el precio
            const keys = Object.keys(values);
            const plan = values[keys[0]] || 'Plan';
            const precio = values[keys[1]] || '';
            // Si hay una tercera columna, la usamos como descripción (opcional)
            const desc = values[keys[2]] || '';

            html += `
                <div class="pricing-card">
                    <h4>${plan}</h4>
                    <div class="price">${precio}</div>
                    ${desc ? `<div class="desc">${desc}</div>` : ''}
                </div>
            `;
        });

        pricingContainer.innerHTML = html || '<p style="color: #4a6a4a;">No se encontraron datos de precios.</p>';
    }

    // ================================================================
    // 3. CARRUSEL DE COMPETENCIAS DEPORTIVAS
    // ================================================================
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');

    // Lista de competencias con sus imágenes (ajusta las rutas según tus archivos)
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
                    // Si la imagen no existe, mostrar un ícono de respaldo
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

        // Crear puntos de navegación (dots)
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

    // Eventos de los botones
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
    }

    // Auto-play (con pausa al hover/touch)
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
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
        carouselContainer.addEventListener('touchstart', stopAutoPlay);
        carouselContainer.addEventListener('touchend', startAutoPlay);
    }

    // Inicializar carrusel
    renderCarousel();
    startAutoPlay();

    // Recalcular al redimensionar (para mantener la posición)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel();
        }, 150);
    });

});
