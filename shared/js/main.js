const dropdownParent = document.querySelector(".dropdown-parent");
const dropdown = document.querySelector(".dropdown");
const main = document.querySelector(".main");
const category = document.querySelector("#category");
const option1 = document.querySelector("#option1");
const option2 = document.querySelector("#option2");
const option3 = document.querySelector("#option3");
const userContainer = document.querySelector(".user__container");
const specialDropdown = document.querySelector(".special-dropdown");
const mainImageContainer = document.querySelectorAll(".main-image__container");

let imageIndex = 1;

dropdownParent.addEventListener("click", () => {
  dropdown.classList.add("open");
});

if (main) {
  main.addEventListener("click", () => {
    dropdown.classList.remove("open");
    if (specialDropdown) {
      specialDropdown.classList.remove("open");
    }
  });
}

if (userContainer) {
  userContainer.addEventListener("click", () => {
    specialDropdown.classList.add("open");
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
