const backDrop = document.querySelector(".backdrop");
const dropdownParent = document.querySelector(".dropdown-parent");
const dropdownItems = document.querySelector(".dropdown__items");
const main = document.querySelector(".main");
const category = document.querySelector("#category");
const option1 = document.querySelector("#option1");
const option2 = document.querySelector("#option2");
const option3 = document.querySelector("#option3");
const userContainer = document.querySelector(".user__container");
const specialDropdownItems = document.querySelector(".special-dropdown__items");
const mainImageContainer = document.querySelectorAll(".main-image__container");
const movieRatingValue = document.querySelector("#movieRatingValue");
const commentRatingValues = document.querySelectorAll(".comment-rating__value");
const movieRatingStars = document.querySelectorAll(".movie-rating__star");
const existingCommentRating = document.querySelector("#existingCommentRating");
const searchButton = document.querySelector(".search-button");
const hamburgerSearchButton = document.querySelector(
  ".hamburger-search-button"
);
const cardButton = document.querySelector(".card__btn");
const hamburgerDropdownParent = document.querySelector(
  ".hamburger-menu__dropdown-parent"
);
const hamburgerDropdown = document.querySelector(".hamburger-dropdown");
const hamburgerMenu = document.querySelector(".hamburger-menu");
const hamburgerContent = document.querySelector(".hamburger-content");
// const movieDeleteModal = document.querySelector(".movie-delete__modal");
let existingCommentStars;
if (existingCommentRating) {
  existingCommentStars = existingCommentRating.parentNode.querySelectorAll(
    "[name=rating]"
  );
}

let imageIndex = 1;

dropdownParent.addEventListener("click", () => {
  dropdownItems.classList.toggle("open");
});

if (main) {
  // console.log(existingCommentStars);
  main.addEventListener("click", () => {
    dropdownItems.classList.remove("open");
    if (specialDropdownItems) {
      specialDropdownItems.classList.remove("open");
    }
  });
}

if (userContainer) {
  userContainer.addEventListener("click", () => {
    specialDropdownItems.classList.add("open");
  });
}

if (category) {
  if (option1.value === category.value) {
    option1.setAttribute("selected", "selected");
  } else if (option2.value === category.value) {
    option2.setAttribute("selected", "selected");
  } else if (option3.value === category.value) {
    option3.setAttribute("selected", "selected");
  }
}

if (movieRatingStars) {
  for (let singleStar of movieRatingStars) {
    if (singleStar.value <= +movieRatingValue.value) {
      singleStar.classList.add("rating__star-active");
    }
  }
}

if (commentRatingValues) {
  for (let commentRatingValue of commentRatingValues) {
    const commentRatingStars = commentRatingValue.parentNode.querySelectorAll(
      ".comment-rating__star"
    );
    for (let singleStar of commentRatingStars) {
      if (singleStar.value <= +commentRatingValue.value) {
        singleStar.classList.add("rating__star-active");
      }
    }
  }
}

if (existingCommentRating) {
  for (let star of existingCommentStars) {
    if (star.value === existingCommentRating.value.toString()) {
      star.setAttribute("checked", "checked");
    }
  }
}

function searchField(text) {
  console.log("working");
  console.log(searchButton.disabled);
  console.log(text.value.length);
  if (text.value.length === 0) {
    searchButton.disabled = true;
  } else {
    searchButton.disabled = false;
  }
}

function hamburgerSearchField(text) {
  console.log("working");
  console.log(searchButton.disabled);
  console.log(text.value.length);
  if (text.value.length === 0) {
    hamburgerSearchButton.disabled = true;
  } else {
    hamburgerSearchButton.disabled = false;
  }
}

if (hamburgerDropdownParent) {
  hamburgerDropdownParent.addEventListener("click", () => {
    hamburgerDropdown.classList.toggle("hamburger-dropdown__show");
  });
}

if (hamburgerMenu) {
  hamburgerMenu.addEventListener("click", () => {
    backDrop.classList.add("backdrop-show");
    hamburgerContent.classList.toggle("hamburger-content__show");
  });
}

if (backDrop) {
  backDrop.addEventListener("click", () => {
    backDrop.classList.remove("backdrop-show");
    hamburgerContent.classList.remove("hamburger-content__show");
    if (movieDeleteModal) {
      movieDeleteModal.classList.remove("movie-delete__modal-show");
    }
  });
}

function showImage(n) {
  if (n > mainImageContainer.length) {
    imageIndex = 1;
  }
  if (n < 1) {
    imageIndex = mainImageContainer.length;
  }
  for (let i = 0; i < mainImageContainer.length; i++) {
    mainImageContainer[i].classList.remove("slideshow-open");
  }
  mainImageContainer[imageIndex - 1].classList.add("slideshow-open");
}

if (mainImageContainer.length > 0) {
  showImage(imageIndex);
}

function nextImage(n) {
  imageIndex += n;
  showImage(imageIndex);
}
