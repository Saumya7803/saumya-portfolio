$(document).ready(function () {

    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }

        // scroll spy
        $('section').each(function () {
            let height = $(this).height();
            let offset = $(this).offset().top - 200;
            let top = $(window).scrollTop();
            let id = $(this).attr('id');

            if (top > offset && top < offset + height) {
                $('.navbar ul li a').removeClass('active');
                $('.navbar').find(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // smooth scrolling
    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top,
        }, 500, 'linear')
    });

    // <!-- emailjs to mail contact form data -->
    $("#contact-form").submit(function (event) {
        emailjs.init("user_TTDmetQLYgWCLzHTDgqxm");

        emailjs.sendForm('contact_service', 'template_contact', '#contact-form')
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
                document.getElementById("contact-form").reset();
                alert("Form Submitted Successfully");
            }, function (error) {
                console.log('FAILED...', error);
                alert("Form Submission Failed! Try Again");
            });
        event.preventDefault();
    });
    // <!-- emailjs to mail contact form data -->

});

document.addEventListener('visibilitychange',
    function () {
        if (document.visibilityState === "visible") {
            document.title = "Portfolio | Saumya Chaurasia";
            $("#favicon").attr("href", "assets/images/favicon.png");
        }
        else {
            document.title = "Come Back To Portfolio";
            $("#favicon").attr("href", "assets/images/favhand.png");
        }
    });


// <!-- typed js effect starts -->
var typed = new Typed(".typing-text", {
    strings: ["frontend development", "backend development", "web designing", "android development", "Flutter Developer", "web development"],
    loop: true,
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 500,
});
// <!-- typed js effect ends -->

async function fetchData(type = "skills") {
    let response
    type === "skills" ?
        response = await fetch("skills.json")
        :
        response = await fetch("./projects/projects.json")
    const data = await response.json();
    return data;
}

async function fetchGitHubProjects(username = "Saumya7803") {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&direction=desc&per_page=12`, {
        headers: {
            Accept: "application/vnd.github+json",
        },
    });

    if (!response.ok) {
        throw new Error(`Unable to load GitHub repositories: ${response.status}`);
    }

    const repos = await response.json();

    return repos
        .filter((repo) => !repo.fork)
        .slice(0, 6);
}

function showSkills(skills) {
    let skillsContainer = document.getElementById("skillsContainer");
    let skillHTML = "";
    skills.forEach(skill => {
        skillHTML += `
        <div class="bar">
              <div class="info">
                <img src=${skill.icon} alt="skill" />
                <span>${skill.name}</span>
              </div>
            </div>`
    });
    skillsContainer.innerHTML = skillHTML;
}

const projectGradients = [
    "linear-gradient(135deg, #24c6dc 0%, #514af6 100%)",
    "linear-gradient(135deg, #ffb100 0%, #ff4d6d 100%)",
    "linear-gradient(135deg, #0f9b8e 0%, #38ef7d 100%)",
    "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)",
    "linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)",
    "linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)",
];

function formatRepoName(name = "") {
    return name
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTechLabel(value = "") {
    const labels = {
        css: "CSS3",
        html: "HTML5",
        javascript: "JavaScript",
        python: "Python",
        flask: "Flask",
        react: "React",
        node: "Node.js",
        express: "Express",
        mongodb: "MongoDB",
        mysql: "MySQL",
        api: "API",
        responsive: "Responsive UI",
        animation: "Animations",
        "three.js": "Three.js",
        threejs: "Three.js",
        portfolio: "Portfolio",
    };

    const normalizedValue = value.toLowerCase();
    return labels[normalizedValue] || value;
}

function getProjectTags(project) {
    const keywordMatches = [];
    const searchableText = `${project.name || ""} ${project.description || ""}`.toLowerCase();
    const keywords = ["react", "node", "express", "python", "flask", "html", "css", "javascript", "responsive", "animation", "api", "mongodb", "mysql", "three.js", "threejs", "portfolio"];

    keywords.forEach((keyword) => {
        if (searchableText.includes(keyword)) {
            keywordMatches.push(formatTechLabel(keyword));
        }
    });

    const tags = [project.language, ...keywordMatches]
        .filter(Boolean)
        .map((tag) => formatTechLabel(tag))
        .filter((tag, index, array) => array.indexOf(tag) === index)
        .slice(0, 4);

    return tags.length ? tags : ["GitHub Project"];
}

function getProjectLabel(project) {
    const searchableText = `${project.name || ""} ${project.description || ""}`.toLowerCase();

    if (searchableText.includes("flask") || searchableText.includes("backend") || searchableText.includes("api")) {
        return "Full Stack";
    }

    if (searchableText.includes("3d") || searchableText.includes("animation") || searchableText.includes("interactive")) {
        return "Creative Web";
    }

    if ((project.language || "").toLowerCase() === "python") {
        return "Python Project";
    }

    return "Frontend";
}

function getProjectIcon(project) {
    const searchableText = `${project.name || ""} ${project.description || ""}`.toLowerCase();

    if (searchableText.includes("recipe") || searchableText.includes("ai")) {
        return "fas fa-brain";
    }

    if (searchableText.includes("3d") || searchableText.includes("solar")) {
        return "fas fa-globe";
    }

    if (searchableText.includes("calculator")) {
        return "fas fa-calculator";
    }

    if (searchableText.includes("backend") || searchableText.includes("api")) {
        return "fas fa-server";
    }

    return "fas fa-desktop";
}

function getProjectDescription(description) {
    if (!description) {
        return "Explore the repository for implementation details, source code, and the overall project structure.";
    }

    if (description.length <= 165) {
        return description;
    }

    return `${description.slice(0, 162).trim()}...`;
}

function renderProjectsError(message) {
    const projectsContainer = document.getElementById("projectsContainer");
    const projectsStatus = document.getElementById("projectsStatus");

    if (!projectsContainer || !projectsStatus) {
        return;
    }

    projectsContainer.innerHTML = "";
    projectsStatus.textContent = message;
    projectsStatus.classList.remove("is-hidden");
}

function showProjects(projects) {
    const projectsContainer = document.getElementById("projectsContainer");
    const projectsStatus = document.getElementById("projectsStatus");

    if (!projectsContainer || !projectsStatus) {
        return;
    }

    if (!projects.length) {
        renderProjectsError("GitHub projects are not available right now. Visit my GitHub profile to explore more.");
        return;
    }

    const projectHTML = projects.map((project, index) => {
        const gradient = projectGradients[index % projectGradients.length];
        const projectTags = getProjectTags(project)
            .map((tag) => `<span class="project-card__tag">${tag}</span>`)
            .join("");
        const previewLink = project.homepage && project.homepage.trim() ? project.homepage.trim() : project.html_url;
        const previewLabel = project.homepage && project.homepage.trim() ? "Live Demo" : "Open Repo";
        const badgeLabel = index === 0 ? "Featured" : "GitHub";

        return `
        <article class="box" style="--project-gradient: ${gradient};">
          <div class="project-card__visual">
            <span class="project-card__badge">${badgeLabel}</span>
            <i class="${getProjectIcon(project)} project-card__icon" aria-hidden="true"></i>
          </div>
          <div class="project-card__body">
            <span class="project-card__label">${getProjectLabel(project)}</span>
            <h3 class="project-card__title">${formatRepoName(project.name)}</h3>
            <p class="project-card__desc">${getProjectDescription(project.description)}</p>
            <div class="project-card__tags">${projectTags}</div>
            <div class="project-card__actions">
              <a href="${project.html_url}" class="project-card__link" target="_blank" rel="noreferrer">
                <i class="fab fa-github"></i>
                <span>Code</span>
              </a>
              <a href="${previewLink}" class="project-card__link project-card__link--primary" target="_blank" rel="noreferrer">
                <span>${previewLabel}</span>
                <i class="fas fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>
        </article>`;
    }).join("");

    projectsContainer.innerHTML = projectHTML;
    projectsStatus.classList.add("is-hidden");
    srtop.reveal('.work .box', { interval: 200 });
}

fetchData().then(data => {
    showSkills(data);
});

fetchGitHubProjects()
    .then((data) => {
        showProjects(data);
    })
    .catch(() => {
        renderProjectsError("GitHub projects could not be loaded right now. Please open my GitHub profile to view them.");
    });

// <!-- tilt js effect starts -->
VanillaTilt.init(document.querySelectorAll(".tilt"), {
    max: 15,
});
// <!-- tilt js effect ends -->


// pre loader start
// function loader() {
//     document.querySelector('.loader-container').classList.add('fade-out');
// }
// function fadeOut() {
//     setInterval(loader, 500);
// }
// window.onload = fadeOut;
// pre loader end

// disable developer mode
document.onkeydown = function (e) {
    if (e.keyCode == 123) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
}

// Start of Tawk.to Live Chat
var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
(function () {
    var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/60df10bf7f4b000ac03ab6a8/1f9jlirg6';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
})();
// End of Tawk.to Live Chat


/* ===== SCROLL REVEAL ANIMATION ===== */
const srtop = ScrollReveal({
    origin: 'top',
    distance: '80px',
    duration: 1000,
    reset: true
});

/* SCROLL HOME */
srtop.reveal('.home .content h3', { delay: 200 });
srtop.reveal('.home .content p', { delay: 200 });
srtop.reveal('.home .content .btn', { delay: 200 });

srtop.reveal('.home .image', { delay: 400 });
srtop.reveal('.home .linkedin', { interval: 600 });
srtop.reveal('.home .github', { interval: 800 });
srtop.reveal('.home .x-twitter', { interval: 1000 });
srtop.reveal('.home .telegram', { interval: 600 });
srtop.reveal('.home .instagram', { interval: 600 });
srtop.reveal('.home .dev', { interval: 600 });

/* SCROLL ABOUT */
srtop.reveal('.about .content h3', { delay: 200 });
srtop.reveal('.about .content .tag', { delay: 200 });
srtop.reveal('.about .content p', { delay: 200 });
srtop.reveal('.about .content .box-container', { delay: 200 });
srtop.reveal('.about .content .resumebtn', { delay: 200 });


/* SCROLL SKILLS */
srtop.reveal('.skills .container', { interval: 200 });
srtop.reveal('.skills .container .bar', { delay: 400 });

/* SCROLL EDUCATION */
srtop.reveal('.education .box', { interval: 200 });

/* SCROLL PROJECTS */
srtop.reveal('.work .box', { interval: 200 });
srtop.reveal('.work .section-head', { delay: 200 });
srtop.reveal('.work .work-actions', { delay: 300 });

/* SCROLL EXPERIENCE */
srtop.reveal('.experience .timeline', { delay: 400 });
srtop.reveal('.experience .timeline .container', { interval: 400 });

/* SCROLL CONTACT */
srtop.reveal('.contact .container', { delay: 400 });
srtop.reveal('.contact .container .form-group', { delay: 400 });
