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

    if (window.scrollY > 60) {
        scrollTopButton.classList.add("active");
    } else {
        scrollTopButton.classList.remove("active");
    }
}

function updateScrollSpy() {
    $("section[id]").each(function () {
        const height = $(this).outerHeight();
        const offset = $(this).offset().top - 200;
        const top = $(window).scrollTop();
        const id = $(this).attr("id");

        if (top >= offset && top < offset + height) {
            $(".navbar ul li a").removeClass("active");
            $(`.navbar a[href="#${id}"]`).addClass("active");
        }
    });
}

function renderSkills(skills) {
    const skillsContainer = document.getElementById("skillsContainer");

    if (!skillsContainer) {
        return;
    }

    skillsContainer.innerHTML = skills.map((skill) => `
        <div class="bar">
          <div class="info">
            <img src="${skill.icon}" alt="${skill.name} logo" loading="lazy" />
            <span>${skill.name}</span>
          </div>
        </div>`).join("");
}

function setProjectsStatus(message, isError = false) {
    const status = document.getElementById("projectsStatus");

    if (!status) {
        return;
    }

    status.textContent = message;
    status.classList.toggle("is-hidden", !message);
    status.classList.toggle("is-error", isError);
}

async function loadSkills() {
    const response = await fetch("./skills.json");

    if (!response.ok) {
        throw new Error(`Unable to load skills: ${response.status}`);
    }

    const data = await response.json();
    renderSkills(data);
}

async function loadFeaturedProjects() {
    const projectsContainer = document.getElementById("projectsContainer");

    if (!projectsContainer || !window.PortfolioProjectCatalog) {
        return;
    }

    try {
        const projects = await window.PortfolioProjectCatalog.load("./assets/data/projects.json");
        const featuredProjects = window.PortfolioProjectCatalog.getFeatured(projects, 6);

        if (!featuredProjects.length) {
            setProjectsStatus("Featured projects will be published here soon.", false);
            projectsContainer.innerHTML = "";
            return;
        }

        window.PortfolioProjectCatalog.render(projectsContainer, featuredProjects);
        setProjectsStatus("", false);

        if (!shouldReduceEffects) {
            srtop.reveal(".work .box", { interval: 120 });
        }
    } catch (error) {
        console.error(error);
        projectsContainer.innerHTML = "";
        setProjectsStatus("Projects could not be loaded right now. Please try again shortly.", true);
    }
}

function setContactStatus(message, isError = false) {
    const status = document.getElementById("contact-status");

    if (!status) {
        return;
    }

    status.textContent = message;
    status.classList.toggle("is-error", isError);
}

function initContactForm() {
    const form = document.getElementById("contact-form");
    const submitButton = document.getElementById("contact-submit");

    if (!form || !submitButton) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) {
            setContactStatus("Please complete the required fields before sending your message.", true);
            return;
        }

        if (!window.emailjs) {
            setContactStatus("The contact form is unavailable right now. Please email me directly instead.", true);
            return;
        }

        const originalLabel = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending <i class="fa fa-paper-plane"></i>';
        setContactStatus("Sending your message...", false);

        try {
            emailjs.init("user_TTDmetQLYgWCLzHTDgqxm");
            await emailjs.sendForm("contact_service", "template_contact", "#contact-form");
            form.reset();
            setContactStatus("Thanks! Your message has been sent successfully.", false);
        } catch (error) {
            console.error(error);
            setContactStatus("Message sending failed. Please try again or email me directly.", true);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalLabel;
        }
    });
}

function initTypingEffect() {
    if (!document.querySelector(".typing-text")) {
        return;
    }

    new Typed(".typing-text", {
        strings: ["frontend development", "backend development", "web designing", "android development", "Flutter development", "web development"],
        loop: true,
        typeSpeed: 50,
        backSpeed: 25,
        backDelay: 500,
    });
}

function initTilt() {
    if (shouldReduceEffects || !window.VanillaTilt) {
        return;
    }

    VanillaTilt.init(document.querySelectorAll(".tilt"), {
        max: 15,
    });
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

    $(".navbar a[href^='#']").on("click", function () {
        setMenuState(false);
    });

    $(window).on("scroll load", function () {
        if (!$("#menu").is(":focus")) {
            setMenuState(false);
        }

        updateScrollTopButton();
        updateScrollSpy();
    });

    $("a[href^='#']").on("click", function (event) {
        const targetSelector = $(this).attr("href");
        const targetElement = targetSelector ? document.querySelector(targetSelector) : null;

        if (!targetElement) {
            return;
        }

        event.preventDefault();
        $("html, body").animate({
            scrollTop: $(targetElement).offset().top,
        }, 500, "linear");
    });

    initContactForm();
});

document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
        document.title = "Saumya Chaurasia | Full Stack & Flutter Developer";
        $("#favicon").attr("href", "assets/images/favicon.png");
    } else {
        document.title = "Come Back To Saumya's Portfolio";
        $("#favicon").attr("href", "assets/images/favhand.png");
    }
});

loadSkills().catch((error) => console.error(error));
loadFeaturedProjects();
initTypingEffect();
initTilt();
scheduleChatWidgetLoad();

const srtop = ScrollReveal({
    origin: "top",
    distance: shouldReduceEffects ? "40px" : "80px",
    duration: shouldReduceEffects ? 700 : 1000,
    reset: !shouldReduceEffects,
});

if (shouldReduceEffects) {
    srtop.reveal(".home .content", { delay: 160 });
    srtop.reveal(".home .image", { delay: 200 });
    srtop.reveal(".skills .container", { delay: 180 });
    srtop.reveal(".work .section-head", { delay: 200 });
    srtop.reveal(".contact .container", { delay: 220 });
} else {
    srtop.reveal(".home .content h2", { delay: 200 });
    srtop.reveal(".home .content p", { delay: 220 });
    srtop.reveal(".home .content .btn", { delay: 240 });
    srtop.reveal(".home .image", { delay: 320 });
    srtop.reveal(".home .social-icons li", { interval: 120 });
    srtop.reveal(".about .content h3", { delay: 200 });
    srtop.reveal(".about .content .tag", { delay: 220 });
    srtop.reveal(".about .content p", { delay: 240 });
    srtop.reveal(".about .content .resumebtn", { delay: 260 });
    srtop.reveal(".skills .container", { delay: 180 });
    srtop.reveal(".skills .container .bar", { interval: 100 });
    srtop.reveal(".education .box", { interval: 160 });
    srtop.reveal(".work .section-head", { delay: 180 });
    srtop.reveal(".work .work-actions", { delay: 220 });
    srtop.reveal(".experience .timeline", { delay: 240 });
    srtop.reveal(".experience .timeline .container", { interval: 220 });
    srtop.reveal(".achievements .heading", { delay: 180 });
    srtop.reveal(".achievements .timeline .container", { interval: 180 });
    srtop.reveal(".certifications-heading", { delay: 220 });
    srtop.reveal(".cert-card", { interval: 120 });
    srtop.reveal(".contact .container", { delay: 240 });
}
