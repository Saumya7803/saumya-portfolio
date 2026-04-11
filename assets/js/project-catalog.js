// Internal credit (non-UI): sumitverma7755
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
        const repoInfo = parseGitHubRepo(project.links.code);
        const tags = (project.tags || [])
            .slice(0, 4)
            .map((tag) => `<span class="project-card__tag">${escapeHtml(tag)}</span>`)
            .join("");
        const badgeMarkup = project.featured
            ? '<span class="project-card__badge">Featured</span>'
            : "";
        const githubMetaMarkup = repoInfo
            ? `<p class="project-card__meta" data-repo-key="${escapeHtml(repoInfo.key)}">GitHub stats loading...</p>`
            : '<p class="project-card__meta">GitHub stats unavailable</p>';

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
            ${githubMetaMarkup}
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
        hydrateGitHubMetadata(container);
    }

    return {
        load,
        getFeatured,
        filterByCategory,
        render,
    };
})();
