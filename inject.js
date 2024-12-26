// Use a guard to prevent re-declaration
if (!window.hasHookedXMLHttpRequest) {
    // Mark as hooked
    window.hasHookedXMLHttpRequest = true;

    // Save original XMLHttpRequest methods
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    // Hook into `open` method
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this._url = url; // Save URL for later use
        return originalOpen.apply(this, arguments);
    };

    // Hook into `send` method
    XMLHttpRequest.prototype.send = function (body) {
        this.addEventListener("load", function () {
            // Only intercept if the request is successful
            if (this._url.includes(`https://api2.maang.in/problems/user/`)) {
                const data = {
                    url: this._url,
                    status: this.status,
                    response: this.responseText,
                };

                // Dispatch custom event with the data
                window.dispatchEvent(new CustomEvent("xhrDataFetched", { detail: data }));
            }
        });
        return originalSend.apply(this, arguments);
    };

   
}
