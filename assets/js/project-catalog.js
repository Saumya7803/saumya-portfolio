window.PortfolioProjectCatalog = (function () {
    const githubRepoCache = new Map();

    function escapeHtml(value = "") {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function parseGitHubRepo(url = "") {
        if (!url) return null;
        try {
            const parsed = new URL(url);

            if (parsed.hostname !== "github.com") {
                return null;
            }

            const [owner, rawRepo] = parsed.pathname.split("/").filter(Boolean);

            if (!owner || !rawRepo) {
                return null;
            }

            const repo = rawRepo.replace(/\.git$/i, "");
            return {
                key: `${owner}/${repo}`,
            };
        } catch (error) {
            return null;
        }
    }

    function formatStarCount(value = 0) {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1).replace(".0", "")}k`;
        }

        return String(value);
    }

    function formatUpdatedDate(value) {
        if (!value) {
            return "N/A";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return new Intl.DateTimeFormat("en", {
            month: "short",
            year: "numeric",
        }).format(date);
    }

    async function loadGitHubRepoStats(repoKey) {
        if (!repoKey) {
            return null;
        }

        if (githubRepoCache.has(repoKey)) {
            return githubRepoCache.get(repoKey);
        }

        const statsPromise = fetch(`https://api.github.com/repos/${repoKey}`, {
            headers: {
                Accept: "application/vnd.github+json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                }

                return response.json();
            })
            .then((payload) => ({
                stars: payload.stargazers_count || 0,
                updatedAt: payload.pushed_at || "",
            }))
            .catch(() => null);

        githubRepoCache.set(repoKey, statsPromise);
        return statsPromise;
    }

    function hydrateGitHubMetadata(container) {
        const metadataNodes = Array.from(container.querySelectorAll("[data-repo-key]"));

        metadataNodes.forEach(async (node) => {
            const stats = await loadGitHubRepoStats(node.dataset.repoKey);

            if (!stats) {
                node.textContent = "GitHub stats unavailable";
                return;
            }

            node.textContent = `★ ${formatStarCount(stats.stars)} • Updated ${formatUpdatedDate(stats.updatedAt)}`;
        });
    }

    async function load(path) {
        const cacheBuster = (path.includes("?") ? "&" : "?") + "v=" + Date.now();
        const response = await fetch(path + cacheBuster);

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

    function resolveAssetPath(path) {
        if (!path) return "";
        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("../") || path.startsWith("/")) {
            return path;
        }
        const isSubfolder = window.location.pathname.includes("/projects/");
        if (isSubfolder) {
            return "../" + path.replace(/^\.\//, "");
        }
        return path;
    }

    function renderCard(project) {
        const isProfessional = project.category === "professional" || project.isProfessional;
        const hasCodeLink = Boolean(project.links && project.links.code);
        const repoInfo = hasCodeLink ? parseGitHubRepo(project.links.code) : null;
        const imgSrc = resolveAssetPath(project.image);
        const logoSrc = resolveAssetPath(project.companyLogo);
        
        const tags = (project.tags || [])
            .map((tag) => `<span class="project-card__tag">${escapeHtml(tag)}</span>`)
            .join("");

        if (isProfessional) {
            const logoMarkup = project.companyLogo
                ? `<img src="${escapeHtml(logoSrc)}" class="company-logo" alt="${escapeHtml(project.company || project.name)} logo" />`
                : `<i class="fas fa-building company-icon" aria-hidden="true"></i>`;

            const featurePillsList = (project.featurePills || ["Product Catalog", "Authentication", "REST APIs", "RFQ System"]).slice(0, 4);
            const featurePillsMarkup = featurePillsList
                .map((f) => `<span class="feature-pill"><i class="fas fa-check" aria-hidden="true"></i> ${escapeHtml(f)}</span>`)
                .join("");

            return `
            <article class="box box--professional" data-category="professional">
              <div class="project-card__media project-card__media--prominent">
                <span class="project-card__badge-small">💼 Professional</span>
                <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(project.imageAlt || project.name)}" loading="lazy" />
              </div>
              <div class="project-card__body">
                <div class="project-card__title-row">
                  ${logoMarkup}
                  <h3 class="project-card__title">${escapeHtml(project.name)}</h3>
                </div>
                <p class="project-card__role-sub">
                  <i class="fas fa-user-tie" aria-hidden="true"></i>
                  ${escapeHtml(project.roleDisplay || (project.role + " • " + (project.company || "Company")))}
                </p>
                <p class="project-card__desc">${escapeHtml(project.summary || project.description || "")}</p>
                
                <div class="project-card__feature-pills">
                  ${featurePillsMarkup}
                </div>

                <div class="project-card__tags project-card__tags--compact">${tags}</div>

                <div class="project-card__footer-info">
                  <span><strong>Platform:</strong> ${escapeHtml(project.platform || "Android • Web")}</span>
                  <span><strong>Status:</strong> ${escapeHtml(project.status || "Production")}</span>
                </div>

                <div class="project-card__actions project-card__actions--right">
                  <button type="button" class="btn-contribution-compact" onclick="window.openContributionModal &amp;&amp; window.openContributionModal('${escapeHtml(project.id)}')">
                    <span>View Contribution</span>
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </article>`;
        }

        const badgeMarkup = project.featured ? '<span class="project-card__badge">Featured</span>' : "";
        const labelMarkup = `<span class="project-card__label">${escapeHtml(project.label || "Project")}</span>`;
        const roleMarkup = project.role ? `<p class="project-card__role"><i class="fas fa-user-tag" aria-hidden="true"></i> ${escapeHtml(project.role)}</p>` : `<p class="project-card__owner">Built by Saumya Chaurasia</p>`;

        let metaMarkup = "";
        if (repoInfo) {
            metaMarkup = `<p class="project-card__meta" data-repo-key="${escapeHtml(repoInfo.key)}">GitHub stats loading...</p>`;
        }

        let actionsMarkup = "";
        if (project.isPrivate) {
            actionsMarkup = `
            <button type="button" class="project-card__link project-card__link--primary" onclick="window.openWorklensModal &amp;&amp; window.openWorklensModal()">
              <i class="fas fa-file-alt" aria-hidden="true"></i>
              <span>Case Study</span>
            </button>
            <span class="project-card__link" style="background: rgba(16, 25, 66, 0.08); border-color: rgba(16, 25, 66, 0.2); color: #5d6785; cursor: default;">
              <i class="fas fa-rocket" aria-hidden="true"></i>
              <span>Coming Soon</span>
            </span>`;
        } else {
            if (hasCodeLink) {
                actionsMarkup += `
                <a href="${escapeHtml(project.links.code)}" class="project-card__link" target="_blank" rel="noreferrer">
                  <i class="fab fa-github" aria-hidden="true"></i>
                  <span>Code</span>
                </a>`;
            }
            if (project.links && project.links.demo) {
                actionsMarkup += `
                <a href="${escapeHtml(project.links.demo)}" class="project-card__link project-card__link--primary" target="_blank" rel="noreferrer">
                  <span>Live Demo</span>
                  <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
                </a>`;
            }
        }

        return `
        <article class="box" data-category="${escapeHtml(project.category)}" data-featured="${project.featured ? "true" : "false"}">
          <div class="project-card__media">
            ${badgeMarkup}
            <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(project.imageAlt || project.name)}" loading="lazy" />
          </div>
          <div class="project-card__body">
            ${labelMarkup}
            <h3 class="project-card__title">${escapeHtml(project.name)}</h3>
            ${roleMarkup}
            ${metaMarkup}
            <p class="project-card__desc">${escapeHtml(project.summary || project.description || "")}</p>
            <div class="project-card__tags">${tags}</div>
            <div class="project-card__actions">
              ${actionsMarkup}
            </div>
          </div>
        </article>`;
    }

    function render(container, projects) {
        container.innerHTML = projects.map((project) => renderCard(project)).join("");
        hydrateGitHubMetadata(container);
    }

    return {
        load,
        getFeatured,
        filterByCategory,
        render,
    };
})();
