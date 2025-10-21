var MyScroll = "";
(function (window, document, $, undefined) {
  "use strict";

  var Init = {
    i: function (e) {
      Init.s();
      Init.methods();
    },
    s: function (e) {
      (this._window = $(window)),
        (this._document = $(document)),
        (this._body = $("body")),
        (this._html = $("html"));
    },
    methods: function (e) {
      Init.w();
      Init.heroBanner();
      Init.dropdown();
      Init.toggleSideBar();
      Init.slick();
      Init.caseStudiesImages();
      Init.formValidation();
      Init.contactPopupForm();
      Init.contactForm();
    },

    w: function (e) {
      // this._window.on("load", Init.l).on("scroll", Init.res);
    },

    heroBanner: function () {
      const animationContainer = document.getElementById("occ-animition");
      const animData = {
        container: animationContainer,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "assets/hero.json", // Replace with your JSON file path
      };

    },

    // Dropdown
    dropdown: function () {
      const selectedAll = document.querySelectorAll(".wrapper-dropdown");

      selectedAll.forEach((selected) => {
        const optionsContainer = selected.children[2];
        const optionsList = selected.querySelectorAll(
          "div.wrapper-dropdown li"
        );

        selected.addEventListener("click", () => {
          let arrow = selected.children[1];

          if (selected.classList.contains("active")) {
            handleDropdown(selected, arrow, false);
          } else {
            let currentActive = document.querySelector(
              ".wrapper-dropdown.active"
            );

            if (currentActive) {
              let anotherArrow = currentActive.children[1];
              handleDropdown(currentActive, anotherArrow, false);
            }

            handleDropdown(selected, arrow, true);
          }
        });

        // update the display of the dropdown
        for (let o of optionsList) {
          o.addEventListener("click", () => {
            selected.querySelector(".selected-display").innerHTML = o.innerHTML;
          });
        }
      });

      // check if anything else ofther than the dropdown is clicked
      window.addEventListener("click", function (e) {
        if (e.target.closest(".wrapper-dropdown") === null) {
          closeAllDropdowns();
        }
      });

      // close all the dropdowns
      function closeAllDropdowns() {
        const selectedAll = document.querySelectorAll(".wrapper-dropdown");
        selectedAll.forEach((selected) => {
          const optionsContainer = selected.children[2];
          let arrow = selected.children[1];

          handleDropdown(selected, arrow, false);
        });
      }

      // open all the dropdowns
      function handleDropdown(dropdown, arrow, open) {
        if (open) {
          arrow.classList.add("rotated");
          dropdown.classList.add("active");
        } else {
          arrow.classList.remove("rotated");
          dropdown.classList.remove("active");
        }
      }
    },

    // SideBar Header
    toggleSideBar: function () {
      // Toggle the sidebar with a slow animation on click
      $('.close-bg-layer').on('click', function () {
        $('.bg-layer').css({ 'transform': 'scale(0)' });
        $('.contact-popup').animate({ 'right': '-100%' })
        $('.about-popUp').animate({ 'right': '-100%' })
        $('.testimonial-popUp').animate({ 'right': '-100%' })
        $('#thanksMessage').addClass('d-none');
        $('#formFields').removeClass('d-none');
      })
      if (window.innerWidth > 1180) {
        $(".hamburger").hover(function () {
          $(".header").addClass("menu-active");
          $(this).addClass("show");
        });
        $(".toggle-menu").mouseleave(function () {
          // Mouse out function
          $(".header").removeClass("menu-active");
          $(".hamburger").removeClass("show");
        });
      } else {
        $(".hamburger").click(function () {
          $(".header").toggleClass("menu-active");
          $(this).toggleClass("show hamburger-close");
        });
        $(".hamburger-close").on("click", function () {
          $(".header").removeClass("menu-active");
          $(".hamburger").removeClass("show hamburger-close");
        });
      }
    },

    // Slick Slider
    slick: function () {
      if ($(".services-slider").length) {
        $(".services-slider").slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 4000,
          infinite: true,
          loop: true,
          arrows: true,
          dots: false,
          centerPadding: "0",
          cssEase: "linear",
          responsive: [
            {
              breakpoint: 1499,
              settings: {
                slidesToShow: 3,
              },
            },
            {
              breakpoint: 1099,
              settings: {
                slidesToShow: 2,
              },
            },
            {
              breakpoint: 490,
              settings: {
                slidesToShow: 1,
              },
            },
          ],
        });
      }
      if ($(".testimonials-slider").length) {
        $(".testimonials-slider").slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: true,
          cssEase: "linear",
          autoplaySpeed: 0,
          speed: 8000,
          infinite: true,
          loop: true,
          arrows: true,
          dots: false,
          pauseOnFocus: false,
          pauseOnHover: false,
          centerPadding: "0",
          responsive: [
            {
              breakpoint: 1499,
              settings: {
                slidesToShow: 3,
              },
            },
            {
              breakpoint: 1099,
              settings: {
                slidesToShow: 2,
              },
            },
            {
              breakpoint: 490,
              settings: {
                autoplay: false,
                autoplaySpeed: 3500,
                speed:300,
                infinite: true,
                cssEase: 'ease-out',
                swipeToSlide: true,
                slidesToShow: 1,
              },
            },
          ],
        });
      }
      if ($(".team-slider").length) {
        $(".team-slider").slick({
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: false,
          autoplaySpeed: 4500,
          infinite: true,
          loop: true,
          arrows: true,
          dots: false,
          centerPadding: "0",
          cssEase: "linear",
          responsive: [
            {
              breakpoint: 1499,
              settings: {
                slidesToShow: 3,
              },
            },
            {
              breakpoint: 1099,
              settings: {
                slidesToShow: 2,
              },
            },
            {
              breakpoint: 490,
              settings: {
                slidesToShow: 1,
              },
            },
          ],
        });
      }
    },

    // Case Study Changable Image
    caseStudiesImages: function () {
      $('.project').on('click', function () {
        $('.project').removeClass('active');
        $(this).addClass('active');

        var $id = $(this).attr('id');
        $('.brand-detail').stop().animate({ opacity: 0 }, 300, function () {
          $('.brand-detail').removeClass('active');
          $('.' + $id).stop().addClass('active').animate({ opacity: 1 }, 300);
        });
      });

    },

    // Form Validation
    formValidation: function () {
      if ($(".contact-form").length) {
        $(".contact-form").validate();
      }
    },

    contactPopupForm: function () {
      $(".contact-btn").on("click", function () {
        var type = $(this).data("type");
        $('#formType').val(type);
        $('.thanksMessage').hide();
        $('.form-content-wrap').show();
        $(".begin-popup").animate({ right: "0px" }, "400");
        $(".begin-popup").find('.overlay').css({ transform: "scale(1)" });
      });
      $(".begin-popupClose").on("click", function () {
        $(".begin-popup").animate({ right: "-100%" }, "400");
        $(".begin-popup").find('.overlay').css({ transform: "scale(0)" });
      });
      $(".overlay").on("click", function () {
        $(".begin-popup").animate({ right: "-100%" }, "400");
        $(".begin-popup").find('.overlay').css({ transform: "scale(0)" });
      });

    },

    // Form Submission
    contactForm: function () {
      $("#contact-form").on("submit", function (e) {
        e.preventDefault();
        if ($("#contact-form").valid()) {
          var formData = new FormData(this);
          $.ajax({
            url: "./assets/mail/contact.php",
            type: "post",
            contentType: false,
            data: formData,
            processData: false,
            success: function (data) {

            },
          });
          $("#contact-form").trigger("reset");
          $('#thanksMessage').removeClass('d-none');
          $('#formFields').addClass('d-none');

        } else {
          return false;
        }
      });
    },
  };

  Init.i();
})(window, document, jQuery);


// Show Selection (Redirect a Link to Section)
function showSection(selector) {
  $(".header").removeClass("menu-active");
  $(".hamburger").removeClass("show hamburger-close");
  if (window.innerWidth > 1024) {
    MyScroll.scrollTo(selector);
  } else {
    $('html, body').animate({
      scrollTop: $(selector).offset().top
    }, 1000);
  }
}

// Accordions
const accordions = document.querySelectorAll(".accordion");
const openAccordion = (accordion) => {
  const content = accordion.querySelector(".accordion_content");
  accordion.classList.add("accordion_active");
  content.style.maxHeight = content.scrollHeight + "px";
};

const closeAccordion = (accordion) => {
  const content = accordion.querySelector(".accordion_content");
  accordion.classList.remove("accordion_active");
  content.style.maxHeight = null;
};

accordions.forEach((accordion, index) => {
  const intro = accordion.querySelector(".accordion_intro");
  const content = accordion.querySelector(".accordion_content");

  intro.onclick = () => {
    if (content.style.maxHeight) {
      closeAccordion(accordion);
    } else {
      accordions.forEach((accordion) => closeAccordion(accordion));
      openAccordion(accordion);
    }
  };
});

//default click first accordion
const firstAccordion = document.querySelectorAll(".accordion_intro")[0];
firstAccordion.click();
