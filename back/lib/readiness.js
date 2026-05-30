/** True once schema ensure + startup seed/sync finish; gates data routes during boot. */
let apiReady = false;

function isApiReady() {
  return apiReady;
}

function setApiReady(value) {
  apiReady = Boolean(value);
}

module.exports = { isApiReady, setApiReady };
