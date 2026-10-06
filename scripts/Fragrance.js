var FragranceJs = (function () {

    var timer = null;
    var lastQ = '';

    function el(id) {
        return document.getElementById(id);
    }

    function openNav() {
        el('fr-nav').classList.add('fr-open');
        el('fr-scrim').classList.add('fr-open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        el('fr-nav').classList.remove('fr-open');
        el('fr-scrim').classList.remove('fr-open');
        document.body.style.overflow = '';
    }

    function toggleSub(btn) {
        var li = btn.closest('.fr-mi');
        if (li) {
            li.classList.toggle('fr-exp');
        }
    }

    function search(value) {
        var q = (value || '').trim();
        clearTimeout(timer);
        if (q.length < 2) {
            closeSugg();
            lastQ = '';
            return;
        }
        timer = setTimeout(function () {
            if (q === lastQ && el('fr-sugg').innerHTML !== '') {
                openSugg();
                return;
            }
            lastQ = q;
            $ApiRequest('Fragrance/Search', JSON.stringify([{ key: 'q', vlu: q }]));
        }, 250);
    }

    function openSugg() {
        el('fr-sugg').classList.add('fr-open');
    }

    function closeSugg() {
        el('fr-sugg').classList.remove('fr-open');
    }

    function chip(btn, value) {
        var chips = el('fr-chips').querySelectorAll('.fr-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.remove('fr-act');
        }
        btn.classList.add('fr-act');
        el('fr-key').value = value;
        filter();
    }

    function filter() {
        var key = el('fr-key');
        var sort = el('fr-sort');
        if (!key || !sort) {
            return;
        }
        $WaitOn();
        $ApiRequest('Fragrance/Filter', JSON.stringify([
            { key: 'key', vlu: key.value },
            { key: 'sort', vlu: sort.value }
        ]));
    }

    function pick(value) {
        var chips = el('fr-chips').querySelectorAll('.fr-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('fr-act', chips[i].getAttribute('data-key') === value);
        }
        el('fr-key').value = value;
        filter();
        var t = el('fr-btitle');
        if (t) {
            window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
        }
    }

    function markBrand(value) {
        var cards = document.querySelectorAll('.fr-bcard');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('fr-act', cards[i].getAttribute('data-key') === value);
        }
    }

    function reveal() {
        document.addEventListener('click', function (e) {
            var box = el('fr-search');
            if (box && !box.contains(e.target)) {
                closeSugg();
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeSugg();
                closeNav();
            }
        });
        window.addEventListener('scroll', function () {
            var h = el('fr-head');
            if (h) {
                h.classList.toggle('fr-scrolled', window.pageYOffset > 8);
            }
        }, { passive: true });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 767) {
                closeNav();
            }
        });
    }

    return {
        reveal: function () { reveal(); },
        openNav: function () { openNav(); },
        closeNav: function () { closeNav(); },
        toggleSub: function (btn) { toggleSub(btn); },
        search: function (v) { search(v); },
        openSugg: function () { openSugg(); },
        closeSugg: function () { closeSugg(); },
        chip: function (btn, v) { chip(btn, v); },
        filter: function () { filter(); },
        pick: function (v) { pick(v); },
        markBrand: function (v) { markBrand(v); }
    };

})();

FragranceJs.reveal();
