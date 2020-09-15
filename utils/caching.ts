export const setCache = (type: string, data) => {
  const existingData = sessionStorage.getItem(type);

  if (existingData) {
    return JSON.parse(existingData);
  }
  else {
    sessionStorage.setItem(type, JSON.stringify(data));
  }
}

export const getCache = (type: string)  => {
  const data = sessionStorage.getItem(type);

  if (data) {
    return JSON.parse(data);
  }
  else {
    return null;
  }
}