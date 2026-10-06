var NewJs = (function () {

    var timer = null;
    var lastQ = '';

    function el(id) {
        return document.getElementById(id);
    }

    function openNav() {
        el('nw-nav').classList.add('nw-open');
        el('nw-scrim').classList.add('nw-open');
        document.body.style.overflow = 'hidden';
    }

    function closeNav() {
        el('nw-nav').classList.remove('nw-open');
        el('nw-scrim').classList.remove('nw-open');
        document.body.style.overflow = '';
    }

    function toggleSub(btn) {
        var li = btn.closest('.nw-mi');
        if (li) {
            li.classList.toggle('nw-exp');
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
            if (q === lastQ && el('nw-sugg').innerHTML !== '') {
                openSugg();
                return;
            }
            lastQ = q;
            $ApiRequest('New/Search', JSON.stringify([{ key: 'q', vlu: q }]));
        }, 250);
    }

    function openSugg() {
        el('nw-sugg').classList.add('nw-open');
    }

    function closeSugg() {
        el('nw-sugg').classList.remove('nw-open');
    }

    function chip(btn, value) {
        var chips = el('nw-chips').querySelectorAll('.nw-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.remove('nw-act');
        }
        btn.classList.add('nw-act');
        el('nw-key').value = value;
        filter();
    }

    function filter() {
        var key = el('nw-key');
        var sort = el('nw-sort');
        if (!key || !sort) {
            return;
        }
        $WaitOn();
        $ApiRequest('New/Filter', JSON.stringify([
            { key: 'key', vlu: key.value },
            { key: 'sort', vlu: sort.value }
        ]));
    }

    function pick(value) {
        var chips = el('nw-chips').querySelectorAll('.nw-chip');
        for (var i = 0; i < chips.length; i++) {
            chips[i].classList.toggle('nw-act', chips[i].getAttribute('data-key') === value);
        }
        el('nw-key').value = value;
        filter();
        var t = el('nw-btitle');
        if (t) {
            window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 140, behavior: 'smooth' });
        }
    }

    function markBrand(value) {
        var cards = document.querySelectorAll('.nw-bcard');
        for (var i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('nw-act', cards[i].getAttribute('data-key') === value);
        }
    }

    function reveal() {
        document.addEventListener('click', function (e) {
            var box = el('nw-search');
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
            var h = el('nw-head');
            if (h) {
                h.classList.toggle('nw-scrolled', window.pageYOffset > 8);
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

NewJs.reveal();
