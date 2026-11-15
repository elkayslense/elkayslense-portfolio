/* Elkayslense — site scripts. Every feature checks that its elements exist,
   so one page can never break another. */
(function () {
    "use strict";

    document.documentElement.classList.add("js");

    var WHATSAPP_NUMBER = "2348120248809";

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById("year");
    if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

    /* ---------- Mobile navigation ---------- */
    var toggle = document.querySelector(".nav-toggle");
    var navLinks = document.getElementById("nav-links");

    if (toggle && navLinks) {
        var setNav = function (open) {
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            navLinks.classList.toggle("is-open", open);
        };
        toggle.addEventListener("click", function () {
            setNav(toggle.getAttribute("aria-expanded") !== "true");
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
                setNav(false);
                toggle.focus();
            }
        });
        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) { setNav(false); }
        });
    }

    /* ---------- Portfolio filtering ---------- */
    var filterButtons = document.querySelectorAll(".filter-btn");
    var items = Array.prototype.slice.call(document.querySelectorAll(".portfolio-item"));
    var filterStatus = document.getElementById("filter-status");

    function visibleItems() {
        return items.filter(function (item) { return !item.hidden; });
    }

    filterButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var filter = btn.dataset.filter;

            filterButtons.forEach(function (b) {
                var on = b === btn;
                b.classList.toggle("active", on);
                b.setAttribute("aria-pressed", String(on));
            });

            items.forEach(function (item) {
                var match = filter === "all" || item.dataset.category === filter;
                var wasHidden = item.hidden;
                item.hidden = !match;
                item.classList.toggle("is-entering", match && wasHidden);
            });

            if (filterStatus) {
                var n = visibleItems().length;
                filterStatus.textContent = "Showing " + n + (n === 1 ? " photo" : " photos") +
                    (filter === "all" ? "" : " in " + btn.textContent.trim());
            }
        });
    });

    /* ---------- Lightbox ---------- */
    var lightbox = document.getElementById("lightbox");

    if (lightbox && items.length) {
        var lbImg = document.getElementById("lightbox-img");
        var lbCaption = document.getElementById("lightbox-caption");
        var closeBtn = lightbox.querySelector(".lightbox-close");
        var prevBtn = lightbox.querySelector(".lightbox-prev");
        var nextBtn = lightbox.querySelector(".lightbox-next");
        var current = null;      // the .portfolio-item currently shown
        var opener = null;       // element to return focus to
        var touchX = null;

        var show = function (item) {
            var img = item.querySelector("img");
            current = item;
            lbImg.src = img.dataset.full || img.currentSrc || img.src;
            lbImg.alt = img.alt;
            var list = visibleItems();
            lbCaption.textContent = img.alt + " (" + (list.indexOf(item) + 1) + " of " + list.length + ")";
            var multi = list.length > 1;
            prevBtn.hidden = nextBtn.hidden = !multi;

            // warm the cache for the neighbours
            [-1, 1].forEach(function (d) {
                var n = list[(list.indexOf(item) + d + list.length) % list.length];
                var src = n && n.querySelector("img").dataset.full;
                if (src) { new Image().src = src; }
            });
        };

        var open = function (item, trigger) {
            opener = trigger;
            show(item);
            lightbox.hidden = false;
            document.body.style.overflow = "hidden";
            closeBtn.focus();
        };

        var close = function () {
            lightbox.hidden = true;
            lbImg.removeAttribute("src");
            document.body.style.overflow = "";
            if (opener) { opener.focus(); }
        };

        var step = function (dir) {
            var list = visibleItems();
            if (list.length < 2) { return; }
            var i = (list.indexOf(current) + dir + list.length) % list.length;
            show(list[i]);
        };

        items.forEach(function (item) {
            var trigger = item.querySelector(".portfolio-open");
            if (trigger) { trigger.addEventListener("click", function () { open(item, trigger); }); }
        });

        closeBtn.addEventListener("click", close);
        prevBtn.addEventListener("click", function () { step(-1); });
        nextBtn.addEventListener("click", function () { step(1); });
        lightbox.addEventListener("click", function (e) { if (e.target === lightbox) { close(); } });

        document.addEventListener("keydown", function (e) {
            if (lightbox.hidden) { return; }
            if (e.key === "Escape") { close(); }
            else if (e.key === "ArrowLeft") { step(-1); }
            else if (e.key === "ArrowRight") { step(1); }
            else if (e.key === "Tab") {   // keep focus inside the dialog
                var f = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
                var first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });

        lightbox.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
        lightbox.addEventListener("touchend", function (e) {
            if (touchX === null) { return; }
            var dx = e.changedTouches[0].clientX - touchX;
            touchX = null;
            if (Math.abs(dx) > 50) { step(dx < 0 ? 1 : -1); }
        }, { passive: true });
    }

    /* ---------- Contact form ----------
       With data-endpoint set (e.g. a Formspree URL) the message is POSTed there.
       With no endpoint, it opens WhatsApp with the message pre-filled, so the form
       never reports a "success" for a message that went nowhere. */
    var form = document.getElementById("contactForm");

    if (form) {
        var status = form.querySelector(".form-status");
        var typeSelect = form.querySelector("[name='session']");
        var submitBtn = form.querySelector("button[type='submit']");

        var say = function (text, kind) {
            status.textContent = text;
            status.className = "form-status" + (kind ? " is-" + kind : "");
        };

        var wanted = new URLSearchParams(window.location.search).get("type");
        if (typeSelect && wanted && typeSelect.querySelector("option[value='" + wanted.replace(/[^a-z-]/gi, "") + "']")) {
            typeSelect.value = wanted;
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }

            var data = new FormData(form);
            if (data.get("_gotcha")) { return; }            // honeypot: silently drop bots

            var endpoint = (form.dataset.endpoint || "").trim();
            var name = String(data.get("name")).trim();
            var email = String(data.get("email")).trim();
            var session = typeSelect ? typeSelect.options[typeSelect.selectedIndex].text : "";
            var message = String(data.get("message")).trim();

            if (!endpoint) {
                var text = "Hello Elkayslense, I'm " + name + " (" + email + ").\n" +
                           "Session: " + session + "\n\n" + message;
                var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
                // "noopener" makes window.open return null even on success, so success can't be detected here.
                window.open(url, "_blank", "noopener");
                say("Opening WhatsApp with your message. Just press send there. If nothing opens, tap the green WhatsApp button.", "success");
                return;
            }

            submitBtn.disabled = true;
            say("Sending…");
            fetch(endpoint, {
                method: "POST",
                headers: { "Accept": "application/json" },
                body: data
            }).then(function (res) {
                if (!res.ok) { throw new Error("HTTP " + res.status); }
                form.reset();
                say("Message sent. Thank you, I'll reply as soon as I can.", "success");
            }).catch(function () {
                say("Sorry, your message could not be sent. Please try again or message me on WhatsApp.", "error");
            }).then(function () { submitBtn.disabled = false; });
        });
    }
})();
