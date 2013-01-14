// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var articlesList;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            articlesList = new WinJS.Binding.List();
            var publicMembers = { ItemList: articlesList };
            WinJS.Namespace.define("C9Data", publicMembers);
            args.setPromise(WinJS.UI.processAll().then(dl));
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    function dl() {
        WinJS.xhr({ url: "http://bigbangtrans.wordpress.com" }).then(function (rss) {
            var items = rss.responseText;
            var begin = items.indexOf("http://bigbangtrans.wordpress.com/about");
            var end = items.indexOf("footer");
            items = items.substring(begin, end);
            var link = items;
            var episodeList = new Array();
            for (var i = 0; i < 200; i++) {
                if (link.indexOf("http:") == -1)
                    break;
                begin = link.indexOf("http:");
                link = link.substring(begin);
                end = link.indexOf("\">");
                var entry = link.substring(0, end);
                var newLine = link.indexOf("/li");
                link = link.substring(newLine);
                episodeList[i] = entry + "\n";
            }
            var name = items;
            var episodeNames = new Array();
            for (var i = 0; i < 200; i++) {
                if (name.indexOf("http:") == -1)
                    break;
                begin = name.indexOf("http:");
                name = name.substring(begin);
                begin = name.indexOf(">");
                name = name.substring(begin + 1);
                end = name.indexOf("<");
                var entry = name.substring(0, end);
                entry = entry.replace("&#8211;", "-");
                entry = entry.replace("&nbsp;", " ");
                var newLine = name.indexOf("/li");
                name = name.substring(newLine);
                episodeNames[i] = entry + "\n";
            }

            for (var i = 0; i<10; i++){
                var article = {};
                article.title = episodeNames[i];
                articlesList.push(article);
            }
        });
    };

    app.start();
})();
