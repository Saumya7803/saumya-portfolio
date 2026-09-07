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
        const isFeaturedSaaS = project.id === "graven-onedesk" || project.isFeaturedProfessional;
        const isProfessional = project.category === "professional" || project.isProfessional;
        const hasCodeLink = Boolean(project.links && project.links.code);
        const repoInfo = hasCodeLink ? parseGitHubRepo(project.links.code) : null;
        const imgSrc = resolveAssetPath(project.image);
        const logoSrc = resolveAssetPath(project.companyLogo || "./assets/images/logos/graven-onedesk.png");
        
        const tags = (project.tags || [])
            .map((tag) => `<span class="project-card__tag">${escapeHtml(tag)}</span>`)
            .join("");

        if (isFeaturedSaaS) {
            const dashImg = resolveAssetPath("./assets/images/projects/onedesk/dashboard_light.png");
            const commImg = resolveAssetPath("./assets/images/projects/onedesk/communication_hub.png");
            const invImg = resolveAssetPath("./assets/images/projects/onedesk/tax_invoice.png");
            const procImg = resolveAssetPath("./assets/images/projects/onedesk/procurement_queue.png");
            const hrImg = resolveAssetPath("./assets/images/projects/onedesk/self_service_attendance.png");

            return `
            <article class="featured-professional-card" data-category="professional" id="gravenOnedeskFeaturedCard">
              <div class="featured-saas-top-grid">
                <!-- LEFT SIDE -->
                <div class="featured-saas-left">
                  <div class="featured-saas-badge">
                    <i class="fas fa-crown" aria-hidden="true"></i>
                    <span>Featured Professional Project</span>
                  </div>

                  <div class="featured-saas-brand">
                    <div class="featured-saas-logo-wrap">
                      <img src="${escapeHtml(logoSrc)}" alt="Graven OneDesk Logo" class="featured-saas-logo" onerror="this.src='${resolveAssetPath("./assets/images/favicon.png")}';" />
                    </div>
                    <div>
                      <h2 class="featured-saas-title">Graven OneDesk</h2>
                      <p class="featured-saas-subtitle">Business Management &amp; Enterprise SaaS Platform</p>
                    </div>
                  </div>

                  <p class="featured-saas-desc">
                    Comprehensive enterprise business-management platform connecting communication, sales, procurement, invoicing, HR, employee self-service, and business operations.
                  </p>

                  <div class="featured-saas-tech-badges">
                    <span class="saas-tech-badge"><i class="fas fa-layer-group"></i> Full-Stack Development</span>
                    <span class="saas-tech-badge"><i class="fas fa-cloud"></i> SaaS Platform</span>
                    <span class="saas-tech-badge"><i class="fas fa-briefcase"></i> Business Management</span>
                    <span class="saas-tech-badge"><i class="fas fa-comments"></i> Communication Hub</span>
                    <span class="saas-tech-badge"><i class="fas fa-file-invoice-dollar"></i> GST Integration</span>
                    <span class="saas-tech-badge"><i class="fas fa-network-wired"></i> API Integrations</span>
                  </div>

                  <div class="featured-saas-meta-grid">
                    <div class="saas-meta-item">
                      <span class="saas-meta-label"><i class="fas fa-user-check"></i> Role</span>
                      <span class="saas-meta-val">Full Stack Developer</span>
                    </div>
                    <div class="saas-meta-item">
                      <span class="saas-meta-label"><i class="fas fa-laptop-code"></i> Type</span>
                      <span class="saas-meta-val">Business Management / SaaS Platform</span>
                    </div>
                    <div class="saas-meta-item">
                      <span class="saas-meta-label"><i class="fas fa-signal"></i> Status</span>
                      <span class="saas-meta-val saas-status-live"><span class="saas-live-dot"></span> Live / Production</span>
                    </div>
                  </div>

                  <div class="featured-saas-cta-group">
                    <button type="button" class="btn-saas-primary" onclick="window.openContributionModal &amp;&amp; window.openContributionModal('graven-onedesk')">
                      <span>View Case Study</span>
                      <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </button>
                    <a href="https://gravenonedesk.in/" target="_blank" rel="noopener noreferrer" class="btn-saas-secondary">
                      <span>Visit Live Product</span>
                      <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>
                    </a>
                  </div>
                </div>

                <!-- RIGHT SIDE -->
                <div class="featured-saas-right">
                  <div class="saas-showcase-window">
                    <div class="saas-window-bar">
                      <div class="saas-window-dots">
                        <span class="dot dot-red"></span>
                        <span class="dot dot-yellow"></span>
                        <span class="dot dot-green"></span>
                      </div>
                      <div class="saas-window-address">
                        <i class="fas fa-lock lock-icon"></i>
                        <span>gravenonedesk.in/dashboard</span>
                      </div>
                      <div class="saas-window-tag">
                        <span class="badge-live-pulse"><span class="pulse-ring"></span>Production</span>
                      </div>
                    </div>
                    
                    <div class="saas-screen-viewport">
                      <img id="onedeskMainPreview" src="${escapeHtml(dashImg)}" alt="Graven OneDesk Dashboard Screenshot" class="saas-main-screen" />
                    </div>
                  </div>

                  <!-- Quick switcher thumbnails for interactive real preview -->
                  <div class="saas-preview-thumbs">
                    <button type="button" class="saas-thumb-btn is-active" data-preview="${escapeHtml(dashImg)}" data-title="Dashboard" onclick="window.switchOnedeskPreview &amp;&amp; window.switchOnedeskPreview(this)">
                      <i class="fas fa-chart-pie"></i>
                      <span>Dashboard</span>
                    </button>
                    <button type="button" class="saas-thumb-btn" data-preview="${escapeHtml(commImg)}" data-title="Communication Hub" onclick="window.switchOnedeskPreview &amp;&amp; window.switchOnedeskPreview(this)">
                      <i class="fas fa-inbox"></i>
                      <span>Comm Hub</span>
                    </button>
                    <button type="button" class="saas-thumb-btn" data-preview="${escapeHtml(invImg)}" data-title="GST &amp; Invoices" onclick="window.switchOnedeskPreview &amp;&amp; window.switchOnedeskPreview(this)">
                      <i class="fas fa-file-invoice"></i>
                      <span>Invoices</span>
                    </button>
                    <button type="button" class="saas-thumb-btn" data-preview="${escapeHtml(procImg)}" data-title="Procurement Queue" onclick="window.switchOnedeskPreview &amp;&amp; window.switchOnedeskPreview(this)">
                      <i class="fas fa-truck-loading"></i>
                      <span>Procurement</span>
                    </button>
                    <button type="button" class="saas-thumb-btn" data-preview="${escapeHtml(hrImg)}" data-title="Employee Self-Service" onclick="window.switchOnedeskPreview &amp;&amp; window.switchOnedeskPreview(this)">
                      <i class="fas fa-user-clock"></i>
                      <span>HR &amp; Self-Service</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- CONTRIBUTION HIGHLIGHTS (Compact Section) -->
              <div class="featured-saas-contributions">
                <div class="saas-contrib-header">
                  <i class="fas fa-star saas-star-icon"></i>
                  <h4>Core Engineering &amp; Architecture Contributions</h4>
                </div>
                
                <div class="saas-contrib-grid">
                  <!-- Col 1: Communication Hub -->
                  <div class="saas-contrib-card">
                    <div class="saas-contrib-card-head">
                      <span class="saas-contrib-icon icon-purple"><i class="fas fa-envelope-open-text"></i></span>
                      <h5>Communication Hub</h5>
                    </div>
                    <ul class="saas-contrib-list">
                      <li><i class="fas fa-check-circle"></i> Email system using SMTP</li>
                      <li><i class="fas fa-check-circle"></i> WhatsApp integration</li>
                      <li><i class="fas fa-check-circle"></i> Unified inbox &amp; conversations</li>
                      <li><i class="fas fa-check-circle"></i> Reply workflows</li>
                      <li><i class="fas fa-check-circle"></i> Templates and attachments</li>
                    </ul>
                  </div>

                  <!-- Col 2: GST & Invoicing -->
                  <div class="saas-contrib-card">
                    <div class="saas-contrib-card-head">
                      <span class="saas-contrib-icon icon-emerald"><i class="fas fa-receipt"></i></span>
                      <h5>GST &amp; Invoicing</h5>
                    </div>
                    <ul class="saas-contrib-list">
                      <li><i class="fas fa-check-circle"></i> GSTZen integration</li>
                      <li><i class="fas fa-check-circle"></i> GST invoice workflows</li>
                      <li><i class="fas fa-check-circle"></i> E-Invoice / IRP</li>
                      <li><i class="fas fa-check-circle"></i> E-Way Bill</li>
                      <li><i class="fas fa-check-circle"></i> HSN/SAC and GST calculations</li>
                    </ul>
                  </div>

                  <!-- Col 3: Business Operations -->
                  <div class="saas-contrib-card">
                    <div class="saas-contrib-card-head">
                      <span class="saas-contrib-icon icon-blue"><i class="fas fa-briefcase"></i></span>
                      <h5>Business Operations</h5>
                    </div>
                    <ul class="saas-contrib-list">
                      <li><i class="fas fa-check-circle"></i> Procurement Queue</li>
                      <li><i class="fas fa-check-circle"></i> Price requests</li>
                      <li><i class="fas fa-check-circle"></i> Customer/CRM workflows</li>
                      <li><i class="fas fa-check-circle"></i> Products &amp; Inventory</li>
                      <li><i class="fas fa-check-circle"></i> Quotations</li>
                    </ul>
                  </div>

                  <!-- Col 4: HR & Employee Self-Service -->
                  <div class="saas-contrib-card">
                    <div class="saas-contrib-card-head">
                      <span class="saas-contrib-icon icon-indigo"><i class="fas fa-user-shield"></i></span>
                      <h5>HR &amp; Employee Self-Service</h5>
                    </div>
                    <ul class="saas-contrib-list">
                      <li><i class="fas fa-check-circle"></i> HR Dashboard</li>
                      <li><i class="fas fa-check-circle"></i> Employee management</li>
                      <li><i class="fas fa-check-circle"></i> Attendance</li>
                      <li><i class="fas fa-check-circle"></i> Leave</li>
                      <li><i class="fas fa-check-circle"></i> Payroll</li>
                      <li><i class="fas fa-check-circle"></i> Payslips</li>
                      <li><i class="fas fa-check-circle"></i> Employee requests</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>`;
        }

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
