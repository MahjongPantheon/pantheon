import { environment } from '../../environments/environment';

function errHandler(errorMsg, currentUrl, lineNumber, charNumber, err) {
  const http = new XMLHttpRequest();
  const url = environment.apiUrl;
  const rpcBody = {
    jsonrpc: '2.0',
    method: 'addErrorLog',
    params: [
      'Tyr',
      ((window as any).__debugInfo || {}).sh,
      ((window as any).__debugInfo || {}).p,
      errorMsg + '\n' + '@' + currentUrl + ':' + lineNumber + ':' + charNumber,
      err.stack
    ],
    id: Math.round(1000000 * Math.random())
  };
  http.open('POST', url, true);
  http.setRequestHeader('Content-type', 'application/json');
  http.send(JSON.stringify(rpcBody));
}

export function registerFrontErrorHandler() {
  if ((window as any).__errHandlerRegistered) {
    return;
  }
  if (window.onerror) {
    const prevHandler = window.onerror;
    window.onerror = function(errorMsg, currentUrl, lineNumber, charNumber, err) {
      prevHandler(errorMsg, currentUrl, lineNumber, charNumber, err);
      errHandler(errorMsg, currentUrl, lineNumber, charNumber, err);
    }
  } else {
    window.onerror = errHandler;
  }
  (window as any).__errHandlerRegistered = true;
}
