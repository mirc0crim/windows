(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var articlesList;
    var episodeNames;
    var episodeList;
    var episodesInSeason = new Array(17, 23, 23, 24, 24, 24);

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

            for (var i = 1; i < 7; i++) {
                var article = {};
                article.title = "Series " + i;
                articlesList.push(article);
            }

            document.getElementById("articlelist").style.display = "";
            document.getElementById("script").style.display = "none";

            var myLV = document.getElementById("articlelist").winControl;
            var myBB = document.getElementById("backbutton");
            myLV.addEventListener("iteminvoked", clickHandler);
            myBB.addEventListener("click", backbuttonhandler);
            myBB.disabled = true;
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
            episodeList = new Array();
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
            episodeNames = new Array();
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
                entry = entry.replace("Series ", "S");
                entry = entry.replace(" Episode ", "E");
                var newLine = name.indexOf("/li");
                name = name.substring(newLine);
                episodeNames[i] = entry + "\n";
            }
        });
    };

    function clickHandler(eventInfo) {
        var i = eventInfo.detail.itemIndex + 1;
        var name = articlesList.getAt(i - 1).title;
        if (name.indexOf("Series") > -1)
            change(i);
        else
            loadScript(articlesList.getAt(i - 1).title);
    };

    function change(season) {
        document.getElementById("backbutton").disabled = false;
        for (var i = 0; i < episodesInSeason.length; i++)
            articlesList.pop();
        var ep1 = 0;
        for (var i = 0; i < season - 1; i++)
            ep1 = ep1 + episodesInSeason[i];
        for (var i = 0; i < episodesInSeason[season - 1]; i++) {
            var article = {};
            if (episodeNames[i + 1 + ep1] == undefined) {
                article.title = "Not Yet Available";
                articlesList.push(article);
                break;
            } else {
                article.title = episodeNames[i + 1 + ep1];
                articlesList.push(article);
            }
        }
    };

    function loadScript(name) {
        var i = episodeNames.indexOf(name);
        if (i > -1)
            loadscript(episodeList[i]);
    };

    function loadscript(link) {
        articlelist.style.display = "none";
        script.style.display = "";
        WinJS.UI.Animation.enterPage(script);
        script.innerText = "Script Text";
        WinJS.xhr({ url: link }).then(function (rss) {
            var items = rss.responseText;
            var begin = items.indexOf(">Scene");
            items = items.substring(begin + 1);
            var end = items.indexOf("</div>");
            items = items.substring(0, end);
            var el = document.createElement("div");
            el.innerHTML = items;
            var text = el.innerText.split("\n");
            var scriptArray = new Array();
            for (var i = 0; i < text.length; i++)
                if (text[i].length > 1)
                    scriptArray.push(text[i]);
            script.innerText = scriptArray;
        });
    };

    function backbuttonhandler(eventInfo) {
        var name = articlesList.getAt(1).title;
        if (name.indexOf("Series") < 0 && script.style.display == "none") {
            for (var i = 0; i < 30; i++)
                articlesList.pop();
            for (var i = 1; i < 7; i++) {
                var article = {};
                article.title = "Series " + i;
                articlesList.push(article);
            }
            document.getElementById("backbutton").disabled = true;
        }
        if (articlelist.style.display == "none") {
            script.style.display = "none";
            articlelist.style.display = "";
            WinJS.UI.Animation.enterPage(articlelist);
        }
    };

    app.start();
})();