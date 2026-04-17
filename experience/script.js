const shouldReduceEffects = window.matchMedia("(max-width: 768px), (prefers-reduced-motion: reduce)").matches;
let chatWidgetLoaded = false;

function setMenuState(isOpen) {
    const menuButton = $("#menu");
    const navbar = $(".navbar");

    menuButton.toggleClass("fa-times", isOpen);
    navbar.toggleClass("nav-toggle", isOpen);
    menuButton.attr("aria-expanded", String(isOpen));
    menuButton.attr("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
}

function updateScrollTopButton() {
    const scrollTopButton = document.querySelector("#scroll-top");

    if (!scrollTopButton) {
        return;
    }

    scrollTopButton.classList.toggle("active", window.scrollY > 60);
}

function initChatWidget() {
    if (chatWidgetLoaded) {
        return;
    }

    chatWidgetLoaded = true;

    var Tawk_API = window.Tawk_API || {}, Tawk_LoadStart = new Date();
    window.Tawk_API = Tawk_API;

    (function () {
        var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = "https://embed.tawk.to/60df10bf7f4b000ac03ab6a8/1f9jlirg6";
        s1.charset = "UTF-8";
        s1.setAttribute("crossorigin", "*");
        s0.parentNode.insertBefore(s1, s0);
    })();
}

function scheduleChatWidgetLoad() {
    const onFirstInteraction = () => {
        initChatWidget();
    };

    window.addEventListener("pointerdown", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("touchstart", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });

    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => initChatWidget(), { timeout: 3500 });
    } else {
        window.setTimeout(() => initChatWidget(), 3500);
    }
}

$(document).ready(function () {
    $("#menu").on("click", function () {
        setMenuState(!$(this).hasClass("fa-times"));
    });

    $(window).on("scroll load", function () {
        if (!$("#menu").is(":focus")) {
            setMenuState(false);
        }

        updateScrollTopButton();
    });
});

document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
        document.title = "Experience | Saumya Chaurasia";
        $("#favicon").attr("href", "/assets/images/favicon.png");
    } else {
        document.title = "Come Back To Saumya's Portfolio";
        $("#favicon").attr("href", "/assets/images/favhand.png");
    }
});

scheduleChatWidgetLoad();

const srtop = ScrollReveal({
    origin: "top",
    distance: shouldReduceEffects ? "40px" : "80px",
    duration: shouldReduceEffects ? 700 : 1000,
    reset: !shouldReduceEffects,
});

if (shouldReduceEffects) {
    srtop.reveal(".experience .timeline", { delay: 200 });
} else {
    srtop.reveal(".experience .timeline", { delay: 260 });
    srtop.reveal(".experience .timeline .container", { interval: 220 });
}
