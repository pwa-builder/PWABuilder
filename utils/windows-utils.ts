export function validatePackageID(id: string) {
  if (id && id.length >= 2) {
    try {
      const newID = id.replace(/\s+/g, '');
      return newID;
    }
    catch (err) {
      throw err;
    }
  }
  else {
    throw (`Package ID should be atleast 3 characters long: ${id}`)
  }
}