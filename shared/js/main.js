const dropdownParent = document.querySelector(".dropdown-parent");
const dropdown = document.querySelector(".dropdown");
const main = document.querySelector(".main");
const category = document.querySelector("#category");
const option1 = document.querySelector("#option1");
const option2 = document.querySelector("#option2");
const option3 = document.querySelector("#option3");
const userContainer = document.querySelector(".user__container");
const specialDropdown = document.querySelector(".special-dropdown");

dropdownParent.addEventListener("click", () => {
  dropdown.classList.add("open");
});

if (main) {
  main.addEventListener("click", () => {
    dropdown.classList.remove("open");
    specialDropdown.classList.remove("open");
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
