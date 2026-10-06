var BrandsJs = (function () {

    var timer = null;
    var lastQ = '';

    function el(id) {
        return document.getElementById(id);
    }

    function openNav() {
        el('br-nav').classList.add('br-open');
        el('br-scrim').classList.add('br-open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        el('br-nav').classList.remove('br-open');
        el('br-scrim').classList.remove('br-open');
        document.body.style.overflow = '';
    }

    function toggleSub(btn) {
        var li = btn.closest('.br-mi');
        if (li) {
            li.classList.toggle('br-exp');
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
            if (q === lastQ && el('br-sugg').innerHTML !== '') {
                openSugg();
                return;
            }
            lastQ = q;
            $ApiRequest('Brands/Search', JSON.stringify([{ key: 'q', vlu: q }]));
        }, 250);
    }

    function openSugg() {
        el('br-sugg').classList.add('br-open');
    }

    function closeSugg() {
        el('br-sugg').classList.remove('br-open');
    }

    function chip(btn, value) {
        var chips = el('br-chips').querySelectorAll('.br-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.remove('br-act');
        }
        btn.classList.add('br-act');
        el('br-key').value = value;
        filter();
    }

    function filter() {
        var key = el('br-key');
        var sort = el('br-sort');
        if (!key || !sort) {
            return;
        }
        $WaitOn();
        $ApiRequest('Brands/Filter', JSON.stringify([
            { key: 'key', vlu: key.value },
            { key: 'sort', vlu: sort.value }
        ]));
    }

    function pick(value) {
        var chips = el('br-chips').querySelectorAll('.br-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('br-act', chips[i].getAttribute('data-key') === value);
        }
        el('br-key').value = value;
        filter();
        var t = el('br-btitle');
        if (t) {
            window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
        }
    }

    function markBrand(value) {
        var cards = document.querySelectorAll('.br-bcard');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('br-act', cards[i].getAttribute('data-key') === value);
        }
    }

    function reveal() {
        document.addEventListener('click', function (e) {
            var box = el('br-search');
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
            var h = el('br-head');
            if (h) {
                h.classList.toggle('br-scrolled', window.pageYOffset > 8);
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

BrandsJs.reveal();
