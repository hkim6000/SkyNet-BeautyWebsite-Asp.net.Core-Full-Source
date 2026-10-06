var HomeJs = (function () {

    var timer = null;
    var lastQ = '';

    function el(id) {
        return document.getElementById(id);
    }

    function openNav() {
        el('hm-nav').classList.add('hm-open');
        el('hm-scrim').classList.add('hm-open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        el('hm-nav').classList.remove('hm-open');
        el('hm-scrim').classList.remove('hm-open');
        document.body.style.overflow = '';
    }

    function toggleSub(btn) {
        var li = btn.closest('.hm-mi');
        if (li) {
            li.classList.toggle('hm-exp');
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
            if (q === lastQ && el('hm-sugg').innerHTML !== '') {
                openSugg();
                return;
            }
            lastQ = q;
            $ApiRequest('Home/Search', JSON.stringify([{ key: 'q', vlu: q }]));
        }, 250);
    }

    function openSugg() {
        el('hm-sugg').classList.add('hm-open');
    }

    function closeSugg() {
        el('hm-sugg').classList.remove('hm-open');
    }

    function chip(btn, value) {
        var chips = el('hm-chips').querySelectorAll('.hm-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.remove('hm-act');
        }
        btn.classList.add('hm-act');
        el('hm-key').value = value;
        filter();
    }

    function filter() {
        var key = el('hm-key');
        var sort = el('hm-sort');
        if (!key || !sort) {
            return;
        }
        $WaitOn();
        $ApiRequest('Home/Filter', JSON.stringify([
            { key: 'key', vlu: key.value },
            { key: 'sort', vlu: sort.value }
        ]));
    }

    function pick(value) {
        var chips = el('hm-chips').querySelectorAll('.hm-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('hm-act', chips[i].getAttribute('data-key') === value);
        }
        el('hm-key').value = value;
        filter();
        var t = el('hm-btitle');
        if (t) {
            window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
        }
    }

    function markBrand(value) {
        var cards = document.querySelectorAll('.hm-bcard');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('hm-act', cards[i].getAttribute('data-key') === value);
        }
    }

    function reveal() {
        document.addEventListener('click', function (e) {
            var box = el('hm-search');
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
            var h = el('hm-head');
            if (h) {
                h.classList.toggle('hm-scrolled', window.pageYOffset > 8);
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

HomeJs.reveal();
