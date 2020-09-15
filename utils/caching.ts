export const setCache = (type: string, url: string, data) => {
  const existingData = sessionStorage.getItem(`${type}/${url}`);

  if (existingData) {
    return JSON.parse(existingData);
  }
  else {
    sessionStorage.setItem(`${type}/${url}`, JSON.stringify(data));
  }
}

export const getCache = (type: string, url)  => {
  const data = sessionStorage.getItem(`${type}/${url}`);

  if (data) {
    return JSON.parse(data);
  }
  else {
    return null;
  }
}