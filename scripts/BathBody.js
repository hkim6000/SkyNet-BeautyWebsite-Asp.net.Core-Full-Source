var BathBodyJs = (function () {

    var timer = null;
    var lastQ = '';

    function el(id) {
        return document.getElementById(id);
    }

    function openNav() {
        el('bb-nav').classList.add('bb-open');
        el('bb-scrim').classList.add('bb-open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        el('bb-nav').classList.remove('bb-open');
        el('bb-scrim').classList.remove('bb-open');
        document.body.style.overflow = '';
    }

    function toggleSub(btn) {
        var li = btn.closest('.bb-mi');
        if (li) {
            li.classList.toggle('bb-exp');
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
            if (q === lastQ && el('bb-sugg').innerHTML !== '') {
                openSugg();
                return;
            }
            lastQ = q;
            $ApiRequest('BathBody/Search', JSON.stringify([{ key: 'q', vlu: q }]));
        }, 250);
    }

    function openSugg() {
        el('bb-sugg').classList.add('bb-open');
    }

    function closeSugg() {
        el('bb-sugg').classList.remove('bb-open');
    }

    function chip(btn, value) {
        var chips = el('bb-chips').querySelectorAll('.bb-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.remove('bb-act');
        }
        btn.classList.add('bb-act');
        el('bb-key').value = value;
        filter();
    }

    function filter() {
        var key = el('bb-key');
        var sort = el('bb-sort');
        if (!key || !sort) {
            return;
        }
        $WaitOn();
        $ApiRequest('BathBody/Filter', JSON.stringify([
            { key: 'key', vlu: key.value },
            { key: 'sort', vlu: sort.value }
        ]));
    }

    function pick(value) {
        var chips = el('bb-chips').querySelectorAll('.bb-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('bb-act', chips[i].getAttribute('data-key') === value);
        }
        el('bb-key').value = value;
        filter();
        var t = el('bb-btitle');
        if (t) {
            window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
        }
    }

    function markBrand(value) {
        var cards = document.querySelectorAll('.bb-bcard');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('bb-act', cards[i].getAttribute('data-key') === value);
        }
    }

    function reveal() {
        document.addEventListener('click', function (e) {
            var box = el('bb-search');
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
            var h = el('bb-head');
            if (h) {
                h.classList.toggle('bb-scrolled', window.pageYOffset > 8);
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

BathBodyJs.reveal();
