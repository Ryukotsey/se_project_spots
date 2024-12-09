import {
  enableValidation,
  settings,
  resetValidation,
} from "../scripts/validation.js";
import "../pages/index.css";
import headerLogoSrc from "../images/Logo.svg";
import Api from "../utils/Api.js";
import { disableButton } from "../scripts/validation.js";
import { setButtonText } from "../utils/helpers.js";

const headerLogoImg = document.getElementById("header-logo");
headerLogoImg.src = headerLogoSrc;

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "c48195d5-e580-4b22-a87c-b06ffed53e6f",
    "Content-Type": "application/json",
  },
});

const profileEditButton = document.querySelector(".profile__edit-button");
const cardModalButton = document.querySelector(".profile__add-button");
const editModal = document.querySelector("#edit-modal");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const profileSubmitButton = document.querySelector(
  ".modal__submit-button_type_profile"
);

const avatarModalButton = document.querySelector(".profile__avatar-button");
const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarCloseButton = document.querySelector("#avatar-close-button");
const avatarSubmitButton = document.querySelector("#avatar-submit-button");
const avatarForm = document.querySelector("#edit-avatar-form");
const avatarInput = document.querySelector("#avatar-input");
const profileAvatar = document.querySelector(".profile__avatar");

const editModalCloseButton = editModal.querySelector(".modal__close-button");
const editFormElement = editModal.querySelector(".modal__form");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteExitButton = document.querySelector(".modal__delete-exit-button");
const deleteCancel = document.querySelector("#cancel-delete-button");
const deleteSubmitButton = document.querySelector("#submit-delete-button");

const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitButton = cardModal.querySelector(".modal__submit-button");
const cardModalCloseButton = cardModal.querySelector(".modal__close-button");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseButton = previewModal.querySelector(
  ".modal__close-button_preview"
);

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

api
  .getAppInfo()
  .then(([initialCards, userInfo]) => {
    initialCards.forEach((item) => {
      const cardEl = getCardElement(item);
      cardsList.append(cardEl);
    });

    profileName.textContent = userInfo.name;
    profileDescription.textContent = userInfo.about;
    profileAvatar.src = userInfo.avatar;
  })
  .catch(console.error);

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  setButtonText(deleteSubmitButton, true, "DELETE", "DELETING...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(deleteSubmitButton, false, "DELETE", "DELETING...");
    });
}

deleteForm.addEventListener("submit", handleDeleteSubmit);

function handleLike(evt, id) {
  const cardLikeButton = evt.target;
  const isLiked = cardLikeButton.classList.contains("card__like-button_liked");

  api
    .handleLike(isLiked, id)
    .then(() => {
      cardLikeButton.classList.toggle("card__like-button_liked");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  if (data.isLiked) {
    cardLikeButton.classList.add("card__like-button_liked");
  }

  cardLikeButton.addEventListener("click", (evt) => handleLike(evt, data._id));

  cardDeleteButton.addEventListener("click", (evt) => {
    handleDeleteCard(cardElement, data._id);
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  return cardElement;
}

function handleEscapeKey(event) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) {
      closeModal(openedModal);
    }
  }
}

function handleModalOverlay(evt) {
  if (evt.target.classList.contains("modal_opened")) {
    closeModal(evt.target);
  }
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscapeKey);
  document.addEventListener("mousedown", handleModalOverlay);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscapeKey);
  document.removeEventListener("mousedown", handleModalOverlay);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  setButtonText(profileSubmitButton, true);
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(profileSubmitButton, false);
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  setButtonText(cardSubmitButton, true);

  const name = cardNameInput.value;
  const link = cardLinkInput.value;
  api
    .createNewCard(name, link)
    .then((card) => {
      const cardEl = getCardElement(card);
      cardsList.prepend(cardEl);
      evt.target.reset();
      closeModal(cardModal);
      disableButton(cardSubmitButton, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(cardSubmitButton, false);
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  setButtonText(avatarSubmitButton, true);
  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(avatarSubmitButton, false);
    });
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  openModal(editModal);
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

avatarModalButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarCloseButton.addEventListener("click", () => {
  closeModal(avatarModal);
});

editModalCloseButton.addEventListener("click", () => {
  closeModal(editModal);
});

cardModalButton.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseButton.addEventListener("click", () => {
  closeModal(cardModal);
});

previewModalCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});

deleteExitButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteCancel.addEventListener("click", () => {
  closeModal(deleteModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);

enableValidation(settings);
