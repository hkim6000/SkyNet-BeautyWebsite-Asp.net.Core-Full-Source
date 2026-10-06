var SkinCareJs = (function () {

    var timer = null;
    var lastQ = '';

    function el(id) {
        return document.getElementById(id);
    }

    function openNav() {
        el('sk-nav').classList.add('sk-open');
        el('sk-scrim').classList.add('sk-open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        el('sk-nav').classList.remove('sk-open');
        el('sk-scrim').classList.remove('sk-open');
        document.body.style.overflow = '';
    }

    function toggleSub(btn) {
        var li = btn.closest('.sk-mi');
        if (li) {
            li.classList.toggle('sk-exp');
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
            if (q === lastQ && el('sk-sugg').innerHTML !== '') {
                openSugg();
                return;
            }
            lastQ = q;
            $ApiRequest('SkinCare/Search', JSON.stringify([{ key: 'q', vlu: q }]));
        }, 250);
    }

    function openSugg() {
        el('sk-sugg').classList.add('sk-open');
    }

    function closeSugg() {
        el('sk-sugg').classList.remove('sk-open');
    }

    function chip(btn, value) {
        var chips = el('sk-chips').querySelectorAll('.sk-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.remove('sk-act');
        }
        btn.classList.add('sk-act');
        el('sk-key').value = value;
        filter();
    }

    function filter() {
        var key = el('sk-key');
        var sort = el('sk-sort');
        if (!key || !sort) {
            return;
        }
        $WaitOn();
        $ApiRequest('SkinCare/Filter', JSON.stringify([
            { key: 'key', vlu: key.value },
            { key: 'sort', vlu: sort.value }
        ]));
    }

    function pick(value) {
        var chips = el('sk-chips').querySelectorAll('.sk-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('sk-act', chips[i].getAttribute('data-key') === value);
        }
        el('sk-key').value = value;
        filter();
        var t = el('sk-btitle');
        if (t) {
            window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
        }
    }

    function markBrand(value) {
        var cards = document.querySelectorAll('.sk-bcard');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('sk-act', cards[i].getAttribute('data-key') === value);
        }
    }

    function reveal() {
        document.addEventListener('click', function (e) {
            var box = el('sk-search');
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
            var h = el('sk-head');
            if (h) {
                h.classList.toggle('sk-scrolled', window.pageYOffset > 8);
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

SkinCareJs.reveal();
