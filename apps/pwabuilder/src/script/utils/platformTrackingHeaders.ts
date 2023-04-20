const identifier = 'PWABuilder';
const version = '1.0.0';

function getUID(){
  let uid = "";
  for (let i = 0; i < 16; i++) {  
    let randomValue = Math.random() * 16 | 0;  
  
    if (i == 4 || i == 8 || i == 12) {  
      uid += "-"  
    }  
    uid += (i == 12 ? 
      4 : 
      (i == 16 ? (randomValue & 3 | 8) : randomValue)).toString(16);  
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