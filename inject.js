if (!window.hasHookedXMLHttpRequest) {

    window.hasHookedXMLHttpRequest = true;


    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;


    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this._url = url; 
        return originalOpen.apply(this, arguments);
    };


    XMLHttpRequest.prototype.send = function (body) {
        this.addEventListener("load", function () {

            if (this._url.includes(`https://api2.maang.in/problems/user/`)) {
                const data = {
                    url: this._url,
                    status: this.status,
                    response: this.responseText,
                };


                window.dispatchEvent(new CustomEvent("xhrDataFetched", { detail: data }));
            }
        });
        return originalSend.apply(this, arguments);
    };

   
}
