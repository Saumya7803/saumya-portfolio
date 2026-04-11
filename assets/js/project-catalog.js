// Internal credit (non-UI): sumitverma7755
window.PortfolioProjectCatalog = (function () {
    function escapeHtml(value = "") {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    async function load(path) {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`Unable to load project catalog: ${response.status}`);
        }

        return response.json();
    }

    function getFeatured(projects, limit = 6) {
        return projects.filter((project) => project.featured).slice(0, limit);
    }

    function filterByCategory(projects, filter = "all") {
        if (filter === "all") {
            return projects;
        }

        if (filter === "featured") {
            return projects.filter((project) => project.featured);
        }

        return projects.filter((project) => project.category === filter);
    }

    function getPrimaryAction(project) {
        if (project.links.demo) {
            return {
                href: project.links.demo,
                label: "Live Demo",
            };
        }

        return {
            href: project.links.code,
            label: "Open Repo",
        };
    }

    function renderCard(project) {
        const primaryAction = getPrimaryAction(project);
        const ownerName = project.owner || "Saumya Chaurasia";
        const tags = (project.tags || [])
            .map((tag) => `<span class="project-card__tag">${escapeHtml(tag)}</span>`)
            .join("");
        const badgeMarkup = project.featured
            ? '<span class="project-card__badge">Featured</span>'
            : "";

        return `
        <article class="box" data-category="${escapeHtml(project.category)}" data-featured="${project.featured ? "true" : "false"}">
          <div class="project-card__media">
            ${badgeMarkup}
            <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.imageAlt || project.name)}" loading="lazy" />
          </div>
          <div class="project-card__body">
            <span class="project-card__label">${escapeHtml(project.label || "Project")}</span>
            <h3 class="project-card__title">${escapeHtml(project.name)}</h3>
            <p class="project-card__owner">Built by ${escapeHtml(ownerName)}</p>
            <p class="project-card__desc">${escapeHtml(project.summary || project.description || "")}</p>
            <div class="project-card__tags">${tags}</div>
            <div class="project-card__actions">
              <a href="${escapeHtml(project.links.code)}" class="project-card__link" target="_blank" rel="noreferrer">
                <i class="fab fa-github" aria-hidden="true"></i>
                <span>Code</span>
              </a>
              <a href="${escapeHtml(primaryAction.href)}" class="project-card__link project-card__link--primary" target="_blank" rel="noreferrer">
                <span>${escapeHtml(primaryAction.label)}</span>
                <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </article>`;
    }

    function render(container, projects) {
        container.innerHTML = projects.map((project) => renderCard(project)).join("");
    }

    return {
        load,
        getFeatured,
        filterByCategory,
        render,
    };
})();
