function setMenuState(isOpen) {
    const menuButton = $("#menu");
    const navbar = $(".navbar");

    menuButton.toggleClass("fa-times", isOpen);
    navbar.toggleClass("nav-toggle", isOpen);
    menuButton.attr("aria-expanded", String(isOpen));
    menuButton.attr("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
}

$(document).ready(function () {
    $("#menu").on("click", function () {
        setMenuState(!$(this).hasClass("fa-times"));
    });
});
