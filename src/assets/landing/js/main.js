// /assets/landing/js/main.js
(function (global) {
    "use strict";

    // ----- helpers -----
    function qsAll(root, sel) { return Array.from(root.querySelectorAll(sel)); }
    function hasEl(root, sel) { return root.querySelector(sel) !== null; }

    // CounterUp thay bằng IntersectionObserver (không cần Waypoints/CounterUp)
    function setupCounters(root) {
        const counters = qsAll(root, '[data-toggle="counter-up"]');
        if (!counters.length || typeof IntersectionObserver === 'undefined') {
            return { disconnect(){} };
        }

        const animate = (el, to, time = 2000, delay = 5) => {
            const start = performance.now();
            const from = 0;
            function tick(now) {
                const p = Math.min(1, (now - start) / time);
                const val = Math.floor(from + (to - from) * p);
                el.textContent = String(val);
                if (p < 1) requestAnimationFrame(tick);
            }
            setTimeout(() => requestAnimationFrame(tick), delay);
        };

        // ✅ Không dùng ShadowRoot làm root
        const ioRoot =
            (root instanceof Element && !(root instanceof ShadowRoot)) ? root : null;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    const el = e.target;
                    const to = Number(el.getAttribute('data-to') || el.textContent || '0');
                    const time = Number(el.getAttribute('data-time') || '2000');
                    const delay = Number(el.getAttribute('data-delay') || '5');
                    animate(el, to, time, delay);
                    io.unobserve(el);
                }
            });
        }, { root: ioRoot, threshold: 0.3 });

        counters.forEach(el => io.observe(el));
        return { disconnect: () => io.disconnect() };
    }

    // WOW.js thay bằng IntersectionObserver cho các phần tử .wow
    function setupWow(root) {
        const wows = qsAll(root, '.wow');
        if (!wows.length || typeof IntersectionObserver === 'undefined') {
            return { disconnect(){} };
        }

        wows.forEach(el => el.style.visibility = 'hidden');

        // ✅ Không dùng ShadowRoot làm root
        const ioRoot =
            (root instanceof Element && !(root instanceof ShadowRoot)) ? root : null;

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    const el = e.target;
                    el.style.visibility = 'visible';
                    el.classList.add('animated'); // giữ tương thích animate.css
                    io.unobserve(el);
                }
            });
        }, { root: ioRoot, threshold: 0.2 });

        wows.forEach(el => io.observe(el));
        return { disconnect: () => io.disconnect() };
    }

    // Owl Carousel (giữ nguyên plugin gốc)
    function setupOwl(root, $) {
        const instances = [];
        if ($ && $.fn && $.fn.owlCarousel) {
            qsAll(root, '.categories-carousel').forEach((el) => {
                const inst = $(el).owlCarousel({
                    autoplay: true,
                    smartSpeed: 1000,
                    dots: false,
                    loop: true,
                    margin: 25,
                    nav : true,
                    navText : [
                        '<i class="fas fa-chevron-left"></i>',
                        '<i class="fas fa-chevron-right"></i>'
                    ],
                    responsiveClass: true,
                    responsive: {
                        0:{ items:1 },
                        576:{ items:1 },
                        768:{ items:1 },
                        992:{ items:2 },
                        1200:{ items:3 }
                    }
                });
                instances.push(inst);
            });

            qsAll(root, '.testimonial-carousel').forEach((el) => {
                const inst = $(el).owlCarousel({
                    autoplay: true,
                    smartSpeed: 1500,
                    center: false,
                    dots: true,
                    loop: true,
                    margin: 25,
                    nav : false,
                    navText : [
                        '<i class="fa fa-angle-right"></i>',
                        '<i class="fa fa-angle-left"></i>'
                    ],
                    responsiveClass: true,
                    responsive: {
                        0:{ items:1 },
                        576:{ items:1 },
                        768:{ items:1 },
                        992:{ items:2 },
                        1200:{ items:2 }
                    }
                });
                instances.push(inst);
            });
        }
        return {
            destroy() {
                if ($ && $.fn && $.fn.owlCarousel) {
                    instances.forEach(inst => {
                        try { inst.trigger('destroy.owl.carousel'); } catch(_) {}
                    });
                }
            }
        };
    }

    // Spinner (#spinner trong root)
    function setupSpinner(root) {
        const el = root.getElementById ? root.getElementById('spinner') : root.querySelector('#spinner');
        if (!el) return () => {};
        const t = setTimeout(() => {
            el.classList.remove('show');
        }, 1);
        return () => clearTimeout(t);
    }

    // Sticky Navbar & Back-to-top (window scroll – nhưng chỉ tác động element trong root)
    function setupScrollUI(root, $) {
        const sticky = root.querySelector('.sticky-top');
        const backTop = root.querySelector('.back-to-top');

        const onScroll = () => {
            const top = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

            if (sticky) {
                if (top > 200) {
                    sticky.classList.add('shadow-sm');
                    sticky.style.top = '0px';
                } else {
                    sticky.classList.remove('shadow-sm');
                    sticky.style.top = '-100px';
                }
            }

            if (backTop) {
                if (top > 300) {
                    backTop.style.display = 'block';
                    backTop.style.opacity = '1';
                } else {
                    backTop.style.opacity = '0';
                    backTop.style.display = 'none';
                }
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        const onClickBack = (ev) => {
            ev.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        if (backTop) backTop.addEventListener('click', onClickBack);

        // initial
        onScroll();

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (backTop) backTop.removeEventListener('click', onClickBack);
        };
    }

    // ----- public API -----
    let tearDowns = [];
    function initLanding(root, $) {
        // spinner
        const clearSpinner = setupSpinner(root);
        tearDowns.push(clearSpinner);

        // “WOW” thay bằng IO
        const wowCtrl = setupWow(root);
        tearDowns.push(() => wowCtrl.disconnect());

        // Owl
        const owlCtrl = setupOwl(root, $);
        tearDowns.push(() => owlCtrl.destroy());

        // Counter
        const counterCtrl = setupCounters(root);
        tearDowns.push(() => counterCtrl.disconnect());

        // Sticky & Back-to-top
        const removeScrollUI = setupScrollUI(root, $);
        tearDowns.push(removeScrollUI);
    }

    function destroyLanding() {
        // gọi tất cả teardown theo thứ tự ngược
        let fn;
        while ((fn = tearDowns.pop())) {
            try { fn(); } catch(_) {}
        }
    }

    (global).Landing = { initLanding, destroyLanding };
})(window);
