const movieDeleteModal = document.querySelector(".movie-delete__modal");
const modalCloseButton = document.querySelector(".modal-decline__button");
const backdrop = document.querySelector(".backdrop");
let movieId;
let csrfToken;
let removeCard;
let deleteMovieId;
let deleteCsrfToken;
let deleteCommentForm;
const deleteFunction = (btn) => {
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

const deleteCommentValue = (btn) => {
  deleteMovieId = btn.parentNode.querySelector("[name=movieId]").value;
  const deleteCommentId = btn.parentNode.querySelector("[name=commentId]")
    .value;
  const deleteRating = btn.parentNode.querySelector("[name=rating]").value;
  deleteCsrfToken = btn.parentNode.querySelector("[name=_csrf]").value;
  deleteCommentForm = new FormData();
  deleteCommentForm.append("movieId", deleteMovieId);
  deleteCommentForm.append("commentId", deleteCommentId);
  deleteCommentForm.append("rating", deleteRating);
  deleteCommentForm.append("_csrf", deleteCsrfToken);
  backdrop.classList.add("backdrop-show");
  movieDeleteModal.classList.add("movie-delete__modal-show");
};

const deleteComment = () => {
  fetch("/delete-comment", {
    method: "POST",
    body: deleteCommentForm,
    headers: {
      "csrf-token": deleteCsrfToken,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      modalClose();
      window.location.replace(`/movie/${deleteMovieId}`);
    })
    .catch((err) => {
      console.log(err);
    });
};
