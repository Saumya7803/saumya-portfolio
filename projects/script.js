let projectCatalog = [];
let activeFilter = "all";
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

function setProjectsStatus(message, isError = false) {
    const status = document.getElementById("projectsStatus");

    if (!status) {
        return;
    }

    status.textContent = message;
    status.classList.toggle("is-hidden", !message);
    status.classList.toggle("is-error", isError);
}

function setFilterState(filter) {
    activeFilter = filter;

    document.querySelectorAll("#filters .btn").forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function renderProjects(filter = "all") {
    const container = document.getElementById("projectsContainer");

    if (!container) {
        return;
    }

    const projects = window.PortfolioProjectCatalog
        ? window.PortfolioProjectCatalog.filterByCategory(projectCatalog, filter)
        : [];

    if (!projects.length) {
        container.innerHTML = '<p class="projects-empty">No projects match this filter yet.</p>';
        setProjectsStatus("", false);
        return;
    }

    window.PortfolioProjectCatalog.render(container, projects);
    setProjectsStatus("", false);

    if (!shouldReduceEffects && window.srtop) {
        srtop.reveal(".work .box", { interval: 120 });
    }
}

async function initProjectArchive() {
    const container = document.getElementById("projectsContainer");

    if (!container || !window.PortfolioProjectCatalog) {
        return;
    }

    try {
        const rawCatalog = await window.PortfolioProjectCatalog.load("../assets/data/projects.json");
        projectCatalog = rawCatalog.map((p) => {
            const updated = { ...p };
            if (updated.image && updated.image.startsWith("./")) {
                updated.image = "../" + updated.image.slice(2);
            }
            if (updated.companyLogo && updated.companyLogo.startsWith("./")) {
                updated.companyLogo = "../" + updated.companyLogo.slice(2);
            }
            return updated;
        });
        renderProjects(activeFilter);
    } catch (error) {
        console.error(error);
        container.innerHTML = "";
        setProjectsStatus("Project archive could not be loaded right now. Please refresh and try again.", true);
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
    if (projectId === "graven-metal") {
        const metalModal = document.getElementById("gravenMetalModal");
        if (metalModal) {
            openModalContainer(metalModal);
            return;
        }
    }

    const modal = document.getElementById("contributionModal");
    if (!modal) return;

    if (!projectCatalog || !projectCatalog.length) {
        try {
            const resp = await fetch("../assets/data/projects.json?v=" + Date.now());
            projectCatalog = await resp.json();
        } catch (e) {
            console.error(e);
        }
    }

    const project = (projectCatalog || []).find((p) => p.id === projectId);
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
    const metalModal = document.getElementById("gravenMetalModal");
    
    if (modal) {
        modal.classList.remove("is-active");
        modal.setAttribute("aria-hidden", "true");
    }
    if (gravenModal) {
        gravenModal.classList.remove("is-active");
        gravenModal.setAttribute("aria-hidden", "true");
    }
    if (metalModal) {
        metalModal.classList.remove("is-active");
        metalModal.setAttribute("aria-hidden", "true");
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

    const closeMetalBtn = document.getElementById("closeGravenMetalModal");
    const closeMetalBtnBottom = document.getElementById("closeGravenMetalModalBottom");
    const metalModal = document.getElementById("gravenMetalModal");

    if (closeBtn) {
        closeBtn.addEventListener("click", window.closeContributionModal);
    }
    if (closeBtnBottom) {
        closeBtnBottom.addEventListener("click", window.closeContributionModal);
    }
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                window.closeContributionModal();
            }
        });
    }

    if (closeGravenBtn) {
        closeGravenBtn.addEventListener("click", window.closeContributionModal);
    }
    if (closeGravenBtnBottom) {
        closeGravenBtnBottom.addEventListener("click", window.closeContributionModal);
    }
    if (gravenModal) {
        gravenModal.addEventListener("click", (e) => {
            if (e.target === gravenModal) {
                window.closeContributionModal();
            }
        });
    }

    if (closeMetalBtn) {
        closeMetalBtn.addEventListener("click", window.closeContributionModal);
    }
    if (closeMetalBtnBottom) {
        closeMetalBtnBottom.addEventListener("click", window.closeContributionModal);
    }
    if (metalModal) {
        metalModal.addEventListener("click", (e) => {
            if (e.target === metalModal) {
                window.closeContributionModal();
            }
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

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            window.closeContributionModal();
        }
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

    $("#filters").on("click", ".btn", function () {
        const filter = $(this).data("filter");
        setFilterState(filter);
        renderProjects(filter);
    });

    $(window).on("scroll load", function () {
        if (!$("#menu").is(":focus")) {
            setMenuState(false);
        }

        updateScrollTopButton();
    });

    initWorklensModal();
    initContributionModal();
});

document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
        document.title = "Projects | Saumya Chaurasia";
        $("#favicon").attr("href", "../assets/images/favicon.png");
    } else {
        document.title = "Come Back To Saumya's Portfolio";
        $("#favicon").attr("href", "../assets/images/favhand.png");
    }
});

setFilterState(activeFilter);
initProjectArchive();
scheduleChatWidgetLoad();

const srtop = ScrollReveal({
    origin: "top",
    distance: shouldReduceEffects ? "40px" : "80px",
    duration: shouldReduceEffects ? 700 : 1000,
    reset: !shouldReduceEffects,
});

if (shouldReduceEffects) {
    srtop.reveal(".work .section-head", { delay: 170 });
    srtop.reveal(".work .button-group", { delay: 210 });
} else {
    srtop.reveal(".work .section-head", { delay: 180 });
    srtop.reveal(".work .button-group", { delay: 220 });
    srtop.reveal(".work .backbtn", { delay: 260 });
}
