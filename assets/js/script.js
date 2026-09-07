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
    const profContainer = document.getElementById("professionalProjectsContainer");
    const acadContainer = document.getElementById("academicProjectsContainer");

    if (!window.PortfolioProjectCatalog) {
        return;
    }

    try {
        const projects = await window.PortfolioProjectCatalog.load("./assets/data/projects.json");
        window._projectCatalogCache = projects;
        
        const professionalProjects = projects.filter((p) => p.category === "professional");
        const academicProjects = projects.filter((p) => p.category === "academic" || p.category === "frontend" || p.category === "fullstack" || p.category === "mobile" || p.category === "ai");

        if (profContainer) {
            window.PortfolioProjectCatalog.render(profContainer, professionalProjects);
        }

        if (acadContainer) {
            window.PortfolioProjectCatalog.render(acadContainer, academicProjects);
        }

        setProjectsStatus("", false);

        if (!shouldReduceEffects && window.srtop) {
            srtop.reveal(".founder-project-card", { delay: 200 });
            srtop.reveal(".sub-projects-section", { interval: 200 });
            srtop.reveal(".work .box", { interval: 120 });
            if (typeof srtop.sync === "function") {
                srtop.sync();
            }
        }
    } catch (error) {
        console.error(error);
        setProjectsStatus("Projects could not be loaded right now. Please try again shortly.", true);
    }
}

window._modalPrevScrollY = window._modalPrevScrollY ?? null;

function openModalContainer(modal) {
    if (!modal) return;
    if (window._modalPrevScrollY === null) {
        window._modalPrevScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    }
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    modal.scrollTop = 0;
    const innerContent = modal.querySelector(".glass-modal, .graven-modal-content, .modal-content");
    if (innerContent) {
        innerContent.scrollTop = 0;
    }

    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
}

function closeModalContainer(modal) {
    if (modal) {
        modal.classList.remove("is-active");
        modal.setAttribute("aria-hidden", "true");
    }
    const activeModals = document.querySelectorAll(".modal-overlay.is-active");
    if (activeModals.length === 0) {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        if (window._modalPrevScrollY !== null) {
            const restoreY = window._modalPrevScrollY;
            window._modalPrevScrollY = null;
            window.scrollTo({
                top: restoreY,
                left: 0,
                behavior: "instant"
            });
        }
    }
}

window.openWorklensModal = function () {
    const modal = document.getElementById("worklensModal");
    if (modal) {
        openModalContainer(modal);
    }
};

window.closeWorklensModal = function () {
    const modal = document.getElementById("worklensModal");
    if (modal) {
        closeModalContainer(modal);
    }
};

function initWorklensModal() {
    const openBtn = document.getElementById("openWorklensModal");
    const closeBtn = document.getElementById("closeWorklensModal");
    const closeBtnBottom = document.getElementById("closeWorklensModalBottom");
    const modal = document.getElementById("worklensModal");

    if (openBtn) {
        openBtn.addEventListener("click", window.openWorklensModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", window.closeWorklensModal);
    }

    if (closeBtnBottom) {
        closeBtnBottom.addEventListener("click", window.closeWorklensModal);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                window.closeWorklensModal();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            window.closeWorklensModal();
            window.closeContributionModal();
        }
    });
}

window.openContributionModal = async function (projectId) {
    if (projectId === "graven-automation") {
        const gravenModal = document.getElementById("gravenAutomationModal");
        if (gravenModal) {
            openModalContainer(gravenModal);
            return;
        }
    }
    if (projectId === "schneider-vfd") {
        const schneiderModal = document.getElementById("schneiderVfdModal");
        if (schneiderModal) {
            openModalContainer(schneiderModal);
            return;
        }
    }
    if (projectId === "graven-metal") {
        const metalModal = document.getElementById("gravenMetalModal");
        if (metalModal) {
            openModalContainer(metalModal);
            return;
        }
    }
    if (projectId === "cleanora") {
        const cleanoraModal = document.getElementById("cleanoraModal");
        if (cleanoraModal) {
            openModalContainer(cleanoraModal);
            return;
        }
    }
    if (projectId === "smart-home-appliances") {
        const smartHomeModal = document.getElementById("smartHomeModal");
        if (smartHomeModal) {
            openModalContainer(smartHomeModal);
            return;
        }
    }
    if (projectId === "navrise-marketing-agency") {
        const navriseModal = document.getElementById("navriseModal");
        if (navriseModal) {
            openModalContainer(navriseModal);
            return;
        }
    }

    const modal = document.getElementById("contributionModal");
    if (!modal) return;

    if (!window._projectCatalogCache) {
        try {
            const resp = await fetch("./assets/data/projects.json?v=" + Date.now());
            window._projectCatalogCache = await resp.json();
        } catch (e) {
            console.error(e);
        }
    }

    const project = (window._projectCatalogCache || []).find((p) => p.id === projectId);
    if (!project) return;

    const titleEl = document.getElementById("contribTitle");
    const roleEl = document.getElementById("contribRole");
    const descEl = document.getElementById("contribDesc");
    const tagsEl = document.getElementById("contribTags");
    const highlightsEl = document.getElementById("contribHighlights");
    const highlightsSec = document.getElementById("contribHighlightsSection");

    if (titleEl) titleEl.textContent = project.name;
    if (roleEl) roleEl.innerHTML = `<i class="fas fa-user-tie"></i> <strong>Role:</strong> ${project.role || "Software Engineer"}`;
    if (descEl) descEl.textContent = project.description || project.summary;
    
    if (highlightsEl) {
        if (project.highlights && project.highlights.length) {
            highlightsEl.innerHTML = project.highlights
                .map((h) => `<li><i class="fas fa-check-circle" style="color: #6f43ff; margin-right: 0.6rem;"></i>${h}</li>`)
                .join("");
            if (highlightsSec) highlightsSec.style.display = "block";
        } else if (highlightsSec) {
            highlightsSec.style.display = "none";
        }
    }

    if (tagsEl) {
        tagsEl.innerHTML = (project.tags || [])
            .map((t) => `<span class="tech-tag">${t}</span>`)
            .join("");
    }

    openModalContainer(modal);
};

window.closeContributionModal = function () {
    const modal = document.getElementById("contributionModal");
    const gravenModal = document.getElementById("gravenAutomationModal");
    const schneiderModal = document.getElementById("schneiderVfdModal");
    const metalModal = document.getElementById("gravenMetalModal");
    const cleanoraModal = document.getElementById("cleanoraModal");
    const smartHomeModal = document.getElementById("smartHomeModal");
    const navriseModal = document.getElementById("navriseModal");
    
    if (modal) {
        modal.classList.remove("is-active");
        modal.setAttribute("aria-hidden", "true");
    }
    if (gravenModal) {
        gravenModal.classList.remove("is-active");
        gravenModal.setAttribute("aria-hidden", "true");
    }
    if (schneiderModal) {
        schneiderModal.classList.remove("is-active");
        schneiderModal.setAttribute("aria-hidden", "true");
    }
    if (metalModal) {
        metalModal.classList.remove("is-active");
        metalModal.setAttribute("aria-hidden", "true");
    }
    if (cleanoraModal) {
        cleanoraModal.classList.remove("is-active");
        cleanoraModal.setAttribute("aria-hidden", "true");
    }
    if (smartHomeModal) {
        smartHomeModal.classList.remove("is-active");
        smartHomeModal.setAttribute("aria-hidden", "true");
    }
    if (navriseModal) {
        navriseModal.classList.remove("is-active");
        navriseModal.setAttribute("aria-hidden", "true");
    }

    const activeModals = document.querySelectorAll(".modal-overlay.is-active");
    if (activeModals.length === 0) {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        if (window._modalPrevScrollY !== null) {
            const restoreY = window._modalPrevScrollY;
            window._modalPrevScrollY = null;
            window.scrollTo({
                top: restoreY,
                left: 0,
                behavior: "instant"
            });
        }
    }
};

function initContributionModal() {
    const closeBtn = document.getElementById("closeContribModal");
    const closeBtnBottom = document.getElementById("closeContribModalBottom");
    const modal = document.getElementById("contributionModal");

    const closeGravenBtn = document.getElementById("closeGravenModal");
    const closeGravenBtnBottom = document.getElementById("closeGravenModalBottom");
    const gravenModal = document.getElementById("gravenAutomationModal");

    const closeSchneiderBtn = document.getElementById("closeSchneiderVfdModal");
    const closeSchneiderBtnBottom = document.getElementById("closeSchneiderVfdModalBottom");
    const schneiderModal = document.getElementById("schneiderVfdModal");

    const closeMetalBtn = document.getElementById("closeGravenMetalModal");
    const closeMetalBtnBottom = document.getElementById("closeGravenMetalModalBottom");
    const metalModal = document.getElementById("gravenMetalModal");

    const closeCleanoraBtn = document.getElementById("closeCleanoraModal");
    const closeCleanoraBtnBottom = document.getElementById("closeCleanoraModalBottom");
    const cleanoraModal = document.getElementById("cleanoraModal");

    const closeSmartHomeBtn = document.getElementById("closeSmartHomeModal");
    const closeSmartHomeBtnBottom = document.getElementById("closeSmartHomeModalBottom");
    const smartHomeModal = document.getElementById("smartHomeModal");

    const closeNavriseBtn = document.getElementById("closeNavriseModal");
    const closeNavriseBtnBottom = document.getElementById("closeNavriseModalBottom");
    const navriseModal = document.getElementById("navriseModal");

    if (closeBtn) closeBtn.addEventListener("click", window.closeContributionModal);
    if (closeBtnBottom) closeBtnBottom.addEventListener("click", window.closeContributionModal);
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) window.closeContributionModal();
        });
    }

    if (closeGravenBtn) closeGravenBtn.addEventListener("click", window.closeContributionModal);
    if (closeGravenBtnBottom) closeGravenBtnBottom.addEventListener("click", window.closeContributionModal);
    if (gravenModal) {
        gravenModal.addEventListener("click", (e) => {
            if (e.target === gravenModal) window.closeContributionModal();
        });
    }

    if (closeSchneiderBtn) closeSchneiderBtn.addEventListener("click", window.closeContributionModal);
    if (closeSchneiderBtnBottom) closeSchneiderBtnBottom.addEventListener("click", window.closeContributionModal);
    if (schneiderModal) {
        schneiderModal.addEventListener("click", (e) => {
            if (e.target === schneiderModal) window.closeContributionModal();
        });
    }

    if (closeMetalBtn) closeMetalBtn.addEventListener("click", window.closeContributionModal);
    if (closeMetalBtnBottom) closeMetalBtnBottom.addEventListener("click", window.closeContributionModal);
    if (metalModal) {
        metalModal.addEventListener("click", (e) => {
            if (e.target === metalModal) window.closeContributionModal();
        });
    }

    if (closeCleanoraBtn) closeCleanoraBtn.addEventListener("click", window.closeContributionModal);
    if (closeCleanoraBtnBottom) closeCleanoraBtnBottom.addEventListener("click", window.closeContributionModal);
    if (cleanoraModal) {
        cleanoraModal.addEventListener("click", (e) => {
            if (e.target === cleanoraModal) window.closeContributionModal();
        });
    }

    if (closeSmartHomeBtn) closeSmartHomeBtn.addEventListener("click", window.closeContributionModal);
    if (closeSmartHomeBtnBottom) closeSmartHomeBtnBottom.addEventListener("click", window.closeContributionModal);
    if (smartHomeModal) {
        smartHomeModal.addEventListener("click", (e) => {
            if (e.target === smartHomeModal) window.closeContributionModal();
        });
    }

    if (closeNavriseBtn) closeNavriseBtn.addEventListener("click", window.closeContributionModal);
    if (closeNavriseBtnBottom) closeNavriseBtnBottom.addEventListener("click", window.closeContributionModal);
    if (navriseModal) {
        navriseModal.addEventListener("click", (e) => {
            if (e.target === navriseModal) window.closeContributionModal();
        });
    }

    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.gravenautomation&pli=1";
    const btnPlayStoreInstall = document.getElementById("btnPlayStoreInstall");
    const btnViewOnPlayStore = document.getElementById("btnViewOnPlayStore");

    if (btnPlayStoreInstall) {
        btnPlayStoreInstall.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(playStoreUrl, "_blank", "noopener,noreferrer");
        });
    }
    if (btnViewOnPlayStore) {
        btnViewOnPlayStore.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(playStoreUrl, "_blank", "noopener,noreferrer");
        });
    }

    const schneiderPlayStoreUrl = "https://play.google.com/store/apps/details?id=com.gravenautomation.electric_app";
    const btnSchneiderPlayStoreInstall = document.getElementById("btnSchneiderPlayStoreInstall");
    const btnSchneiderFooterVisit = document.getElementById("btnSchneiderFooterVisit");

    if (btnSchneiderPlayStoreInstall) {
        btnSchneiderPlayStoreInstall.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(schneiderPlayStoreUrl, "_blank", "noopener,noreferrer");
        });
    }
    if (btnSchneiderFooterVisit) {
        btnSchneiderFooterVisit.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(schneiderPlayStoreUrl, "_blank", "noopener,noreferrer");
        });
    }

    const smartHomeUrl = "https://smarthomeappliances.in/";
    const btnSmartHomeVisit = document.getElementById("btnSmartHomeVisit");
    const btnSmartHomeFooterVisit = document.getElementById("btnSmartHomeFooterVisit");

    if (btnSmartHomeVisit) {
        btnSmartHomeVisit.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(smartHomeUrl, "_blank", "noopener,noreferrer");
        });
    }
    if (btnSmartHomeFooterVisit) {
        btnSmartHomeFooterVisit.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(smartHomeUrl, "_blank", "noopener,noreferrer");
        });
    }

    const navriseUrl = "https://navrise-agency-website.vercel.app/";
    const btnNavriseVisit = document.getElementById("btnNavriseVisit");
    const btnNavriseFooterVisit = document.getElementById("btnNavriseFooterVisit");

    if (btnNavriseVisit) {
        btnNavriseVisit.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(navriseUrl, "_blank", "noopener,noreferrer");
        });
    }
    if (btnNavriseFooterVisit) {
        btnNavriseFooterVisit.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(navriseUrl, "_blank", "noopener,noreferrer");
        });
    }

    const gravenMetalUrl = "https://graven-metal-frontend.vercel.app/";
    const btnGravenMetalVisit = document.getElementById("btnGravenMetalVisit");
    const btnGravenMetalFooterVisit = document.getElementById("btnGravenMetalFooterVisit");

    if (btnGravenMetalVisit) {
        btnGravenMetalVisit.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(gravenMetalUrl, "_blank", "noopener,noreferrer");
        });
    }
    if (btnGravenMetalFooterVisit) {
        btnGravenMetalFooterVisit.addEventListener("click", (e) => {
            e.preventDefault();
            window.open(gravenMetalUrl, "_blank", "noopener,noreferrer");
        });
    }
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
        strings: ["software engineering", "full stack development", "Flutter development", "REST API integration", "AI product building", "production deployment"],
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

function initHeroStatsCounter() {
    const statNumbers = document.querySelectorAll(".stat-number");
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute("data-count"), 10);
                if (isNaN(target)) return;

                let count = 0;
                const duration = 1200;
                const stepTime = Math.max(30, Math.floor(duration / target));

                const timer = setInterval(() => {
                    count++;
                    el.textContent = count + "+";
                    if (count >= target) {
                        el.textContent = target + "+";
                        clearInterval(timer);
                    }
                }, stepTime);

                obs.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    statNumbers.forEach((num) => observer.observe(num));
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
    initWorklensModal();
    initContributionModal();
    initHeroStatsCounter();
});

document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
        document.title = "Saumya Chaurasia | Software Engineer & AI Product Builder";
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
    reset: false,
});

if (shouldReduceEffects) {
    srtop.reveal(".home .content", { delay: 160 });
    srtop.reveal(".home .image", { delay: 200 });
    srtop.reveal(".skills .container", { delay: 180 });
    srtop.reveal(".work .section-head", { delay: 200 });
    srtop.reveal(".contact .container", { delay: 220 });
} else {
    srtop.reveal(".home .content h2", { delay: 180 });
    srtop.reveal(".hero-designation", { delay: 200 });
    srtop.reveal(".hero-intro", { delay: 220 });
    srtop.reveal(".hero-cta-group", { delay: 240 });
    srtop.reveal(".home .social-icons li", { interval: 100 });
    srtop.reveal(".hero-badges", { delay: 280 });
    srtop.reveal(".hero-stats", { delay: 300 });
    srtop.reveal(".home .image", { delay: 320 });
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
