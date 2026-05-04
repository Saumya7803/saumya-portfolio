(function (global) {
    const experiences = [
        {
            company: "Graven Automation Pvt. Ltd.",
            duration: "Feb 2026 - Present",
            position: "Full Stack Developer | Flutter Developer | Web & Mobile Apps",
            employmentType: "Full-Time",
            responsibilities: [
                "Developed and maintained full stack web applications using modern technologies.",
                "Built and integrated REST APIs for seamless frontend-backend communication.",
                "Developed cross-platform mobile applications using Flutter.",
                "Assisted in Google Ads campaign optimization and digital marketing strategies."
            ],
            techStack: "MERN Stack (MongoDB, Express.js, React.js, Node.js), Flutter, MySQL, REST APIs"
        },
        {
            company: "Navrise",
            duration: "Apr 2026 - Present",
            position: "Web Developer (Part-Time)",
            employmentType: "Part-Time",
            responsibilities: [
                "Designed and developed a responsive, high-converting company website to strengthen digital presence.",
                "Implemented modern UI/UX design with consistent branding, improving usability and engagement.",
                "Built core pages (Home, About, Services, Portfolio, Contact) aligned with business goals.",
                "Integrated lead generation systems (forms, CTA buttons, WhatsApp integration) to improve conversions.",
                "Optimized website for performance, speed, and SEO best practices.",
                "Integrated tools such as Google Analytics, email notifications, and CRM/lead tracking systems.",
                "Conducted cross-browser testing, debugging, and deployment support.",
                "Maintained and updated website ensuring security, scalability, and performance stability."
            ],
            techStack: "HTML, CSS, JavaScript, React.js, WordPress"
        },
        {
            company: "THE CODING CULT",
            duration: "Jun 2025 - Oct 2025",
            position: "Jr. Associate | Frontend Developer",
            employmentType: "Full-Time",
            responsibilities: [
                "Built responsive user interfaces and worked on frontend development tasks.",
                "Improved user experience through UI refinements and implementation support."
            ],
            techStack: "React.js, Front-End Development"
        },
        {
            company: "Live IT Solutions",
            duration: "Oct 2024 - Jan 2025",
            position: "Full Stack / Python Developer",
            employmentType: "Full-Time",
            responsibilities: [
                "Contributed to full stack web development and Python-backed workflows.",
                "Supported debugging, maintenance, and iterative delivery in production projects."
            ],
            techStack: "Python, Node.js, Full-Stack Development"
        },
        {
            company: "Intern Certify",
            duration: "Aug 2024 - Oct 2024",
            position: "Web Development Intern",
            employmentType: "Internship",
            responsibilities: [
                "Developed responsive website features and frontend components.",
                "Collaborated on testing, debugging, and implementation improvements."
            ],
            techStack: "HTML5, CSS, JavaScript"
        },
        {
            company: "CodSoft",
            duration: "Aug 2024 - Sep 2024",
            position: "Web Development Intern",
            employmentType: "Internship",
            responsibilities: [
                "Built responsive pages and reusable UI sections for web projects.",
                "Worked on frontend issue fixes to improve usability and consistency."
            ],
            techStack: "HTML5, CSS, JavaScript"
        },
        {
            company: "Live IT Solutions",
            duration: "Jun 2024 - Aug 2024",
            position: "Python Developer Intern",
            employmentType: "Internship",
            responsibilities: [
                "Developed Python-based modules and supported backend task implementation.",
                "Performed testing, debugging, and optimization for stable delivery."
            ],
            techStack: "Python"
        }
    ];

    function escapeHtml(text) {
        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function getEmploymentBadgeClass(employmentType) {
        if (employmentType === "Full-Time") {
            return "employment-badge employment-badge--full-time";
        }

        if (employmentType === "Part-Time") {
            return "employment-badge employment-badge--part-time";
        }

        return "employment-badge employment-badge--internship";
    }

    function buildResponsibilityParagraphs(items) {
        return items.map((item) => `<p>&bull; ${escapeHtml(item)}</p>`).join("");
    }

    function buildExperienceCard(experience, index) {
        const sideClass = index % 2 === 0 ? "right" : "left";
        const badgeClass = getEmploymentBadgeClass(experience.employmentType);

        return `
        <div class="container ${sideClass}" style="position: relative; z-index: 5;">
          <div class="content">
            <div class="tag">
              <div class="tag-head">
                <h2>${escapeHtml(experience.company)} | ${escapeHtml(experience.duration)}</h2>
                <span class="${badgeClass}">${escapeHtml(experience.employmentType)}</span>
              </div>
            </div>
            <div class="desc">
              <h3>${escapeHtml(experience.position)}</h3>
              ${buildResponsibilityParagraphs(experience.responsibilities)}
              <p><strong>Tech Stack:</strong> ${escapeHtml(experience.techStack)}</p>
            </div>
          </div>
        </div>`;
    }

    function renderExperienceTimeline(selector) {
        const timeline = document.querySelector(selector);

        if (!timeline) {
            return;
        }

        timeline.innerHTML = experiences.map((experience, index) => buildExperienceCard(experience, index)).join("");
    }

    global.PortfolioExperience = {
        render: renderExperienceTimeline,
        data: experiences
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            renderExperienceTimeline("#experienceTimeline");
        });
    } else {
        renderExperienceTimeline("#experienceTimeline");
    }
})(window);
