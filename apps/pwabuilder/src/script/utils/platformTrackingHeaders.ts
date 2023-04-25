const identifier = 'PWABuilder';
const version = '1.0.0';

function getUID(){
  let uid = "";
   
  for (let k = 0; k < 32;k++) {  
    // more secure than math.random()
    let randomValue = (window.crypto.getRandomValues(new Uint8Array(1))[0] % 16) + 1;
  
    if (k == 8 || k == 12 || k == 16 || k == 20) {  
      uid += "-"  
    }  
    uid += (k == 12 ? 4 : (k == 16 ? (randomValue & 3 | 8) : randomValue)).toString(16);  
  }  
  return uid;
}  

export function getHeaders(){
  let uid = '';
  if(sessionStorage.getItem('uid')){
    uid = sessionStorage.getItem('uid')!;
  } else {
    uid = getUID();
    sessionStorage.setItem('uid', uid)
  }
  let headers = {
    'platform-identifier': identifier, 
    'platform-identifier-version': version,
    'correlation-id': uid
  }

  return headers;
  
}