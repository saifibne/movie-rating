const movieDeleteModal = document.querySelector(".movie-delete__modal");
const modalCloseButton = document.querySelector(".modal-decline__button");
const backdrop = document.querySelector(".backdrop");
let movieId;
let csrfToken;
let removeCard;
const deleteFunction = (btn) => {
  // const movieId = btn.parentNode.querySelector("[name=movieId]").value;
  // const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
  // const movieCard = btn.closest(".card");
  fetch(`/delete/${movieId}`, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      modalClose();
      removeCard.parentNode.removeChild(removeCard);
    })
    .catch((err) => {
      console.log(err);
    });
};

function getValues(btn) {
  movieId = btn.parentNode.querySelector("[name=movieId]").value;
  csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
  removeCard = btn.closest(".card");
  backdrop.classList.add("backdrop-show");
  movieDeleteModal.classList.add("movie-delete__modal-show");
}

const modalClose = () => {
  backdrop.classList.remove("backdrop-show");
  movieDeleteModal.classList.remove("movie-delete__modal-show");
};
