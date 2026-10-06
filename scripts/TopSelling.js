var TopSellingJs = (function () {

    var timer = null;
    var lastQ = '';

    function el(id) {
        return document.getElementById(id);
    }

    function openNav() {
        el('ts-nav').classList.add('ts-open');
        el('ts-scrim').classList.add('ts-open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        el('ts-nav').classList.remove('ts-open');
        el('ts-scrim').classList.remove('ts-open');
        document.body.style.overflow = '';
    }

    function toggleSub(btn) {
        var li = btn.closest('.ts-mi');
        if (li) {
            li.classList.toggle('ts-exp');
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
            if (q === lastQ && el('ts-sugg').innerHTML !== '') {
                openSugg();
                return;
            }
            lastQ = q;
            $ApiRequest('TopSelling/Search', JSON.stringify([{ key: 'q', vlu: q }]));
        }, 250);
    }

    function openSugg() {
        el('ts-sugg').classList.add('ts-open');
    }

    function closeSugg() {
        el('ts-sugg').classList.remove('ts-open');
    }

    function chip(btn, value) {
        var chips = el('ts-chips').querySelectorAll('.ts-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.remove('ts-act');
        }
        btn.classList.add('ts-act');
        el('ts-key').value = value;
        filter();
    }

    function filter() {
        var key = el('ts-key');
        var sort = el('ts-sort');
        if (!key || !sort) {
            return;
        }
        $WaitOn();
        $ApiRequest('TopSelling/Filter', JSON.stringify([
            { key: 'key', vlu: key.value },
            { key: 'sort', vlu: sort.value }
        ]));
    }

    function pick(value) {
        var chips = el('ts-chips').querySelectorAll('.ts-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('ts-act', chips[i].getAttribute('data-key') === value);
        }
        el('ts-key').value = value;
        filter();
        var t = el('ts-btitle');
        if (t) {
            window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
        }
    }

    function markBrand(value) {
        var cards = document.querySelectorAll('.ts-bcard');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('ts-act', cards[i].getAttribute('data-key') === value);
        }
    }

    function reveal() {
        document.addEventListener('click', function (e) {
            var box = el('ts-search');
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
            var h = el('ts-head');
            if (h) {
                h.classList.toggle('ts-scrolled', window.pageYOffset > 8);
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

TopSellingJs.reveal();
