const deleteFunction = (btn) => {
  const movieId = btn.parentNode.querySelector("[name=movieId]").value;
  const movieCard = btn.closest(".card");
  fetch(`/delete/${movieId}`, {
    method: "DELETE",
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      movieCard.parentNode.removeChild(movieCard);
    })
    .catch((err) => {
      console.log(err);
    });
};
