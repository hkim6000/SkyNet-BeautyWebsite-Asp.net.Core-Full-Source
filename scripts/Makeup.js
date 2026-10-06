var MakeupJs = (function () {

    var timer = null;
    var lastQ = '';

    function el(id) {
        return document.getElementById(id);
    }

    function openNav() {
        el('mk-nav').classList.add('mk-open');
        el('mk-scrim').classList.add('mk-open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        el('mk-nav').classList.remove('mk-open');
        el('mk-scrim').classList.remove('mk-open');
        document.body.style.overflow = '';
    }

    function toggleSub(btn) {
        var li = btn.closest('.mk-mi');
        if (li) {
            li.classList.toggle('mk-exp');
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
            if (q === lastQ && el('mk-sugg').innerHTML !== '') {
                openSugg();
                return;
            }
            lastQ = q;
            $ApiRequest('Makeup/Search', JSON.stringify([{ key: 'q', vlu: q }]));
        }, 250);
    }

    function openSugg() {
        el('mk-sugg').classList.add('mk-open');
    }

    function closeSugg() {
        el('mk-sugg').classList.remove('mk-open');
    }

    function chip(btn, value) {
        var chips = el('mk-chips').querySelectorAll('.mk-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.remove('mk-act');
        }
        btn.classList.add('mk-act');
        el('mk-key').value = value;
        filter();
    }

    function filter() {
        var key = el('mk-key');
        var sort = el('mk-sort');
        if (!key || !sort) {
            return;
        }
        $WaitOn();
        $ApiRequest('Makeup/Filter', JSON.stringify([
            { key: 'key', vlu: key.value },
            { key: 'sort', vlu: sort.value }
        ]));
    }

    function pick(value) {
        var chips = el('mk-chips').querySelectorAll('.mk-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('mk-act', chips[i].getAttribute('data-key') === value);
        }
        el('mk-key').value = value;
        filter();
        var t = el('mk-btitle');
        if (t) {
            window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
        }
    }

    function markBrand(value) {
        var cards = document.querySelectorAll('.mk-bcard');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('mk-act', cards[i].getAttribute('data-key') === value);
        }
    }

    function reveal() {
        document.addEventListener('click', function (e) {
            var box = el('mk-search');
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
            var h = el('mk-head');
            if (h) {
                h.classList.toggle('mk-scrolled', window.pageYOffset > 8);
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

MakeupJs.reveal();
