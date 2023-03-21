const getLocalStorage = (key) => {
  if (localStorage.getItem(key)) {
    return localStorage.getItem(key);
  } else return null;
};

const setLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

const deleteLocalStorage = (key) => {
  localStorage.removeItem(key);
};

export { getLocalStorage, setLocalStorage, deleteLocalStorage };
