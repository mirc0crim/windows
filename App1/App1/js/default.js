(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var articlesList;
    var scriptList;
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
            var episodeMembers = { ItemList: articlesList };
            WinJS.Namespace.define("EpisodeData", episodeMembers);
            scriptList = new WinJS.Binding.List();
            var scriptMembers = { ItemList: scriptList };
            WinJS.Namespace.define("ScriptData", scriptMembers);
            args.setPromise(WinJS.UI.processAll().then(dl));

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
            for (var i = 1; i < 7; i++) {
                var article = {};
                article.title = "Series " + i;
                article.thumbnail = "/images/series.png";
                articlesList.push(article);
            }
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
                article.thumbnail = "/images/series.png";
                articlesList.push(article);
                break;
            } else {
                article.title = episodeNames[i + 1 + ep1];
                article.thumbnail = "/images/series.png";
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
                if (text[i].length > 1 && text[i].indexOf("Like") != 0
                    && text[i].indexOf("Teleplay") != 0 && text[i].indexOf("Written by") != 0) {
                    var article = getView(text[i]);
                    scriptList.push(article);
                }
        });
    };

    function getView(line) {
        var article = {};
        if (line.indexOf("Scene") == 0) {
            article.title = line.replace("Scene","").replace(":","");
            article.thumbnail = "/images/ppl/scene.jpg";
        }
        else if (line.indexOf("(") == 0 || line.indexOf("Later") == 0
            || line.indexOf("Time shift") == 0 || line.indexOf("Quick cut to") == 0) {
            article.title = line;
            article.thumbnail = "/images/ppl/scene.jpg";
        }
        else if (line.indexOf("Credit") == 0) {
            article.title = line;
            article.thumbnail = "/images/ppl/credit.jpg";
        }
        else if (isThisPersonTalking(line, "Sheldon")) {
            article.title = line.replace("Sheldon", "").replace(":", "");
            article.thumbnail = "/images/ppl/sheldon.jpg";
        }
        else if (isThisPersonTalking(line, "Leonard")) {
            article.title = line.replace("Leonard", "").replace(":", "");
            article.thumbnail = "/images/ppl/leonard.jpg";
        }
        else if (isThisPersonTalking(line, "Howard")) {
            article.title = line.replace("Howard", "").replace(":", "");
            article.thumbnail = "/images/ppl/howard.jpg";
        }
        else if (isThisPersonTalking(line, "Raj")) {
            article.title = line.replace("Raj", "").replace(":", "");
            article.thumbnail = "/images/ppl/raj.jpg";
        }
        else if (isThisPersonTalking(line, "Penny")) {
            article.title = line.replace("Penny", "").replace(":", "");
            article.thumbnail = "/images/ppl/penny.jpg";
        }
        else if (isThisPersonTalking(line, "Bernadette")) {
            article.title = line.replace("Bernadette", "").replace(":", "");
            article.thumbnail = "/images/ppl/bernadette.jpg";
        }
        else if (isThisPersonTalking(line, "Amy")) {
            article.title = line.replace("Amy", "").replace(":", "");
            article.thumbnail = "/images/ppl/amy.jpg";
        }
        else if (isThisPersonTalking(line, "Alex")) {
            article.title = line.replace("Alex", "").replace(":", "");
            article.thumbnail = "/images/ppl/alex.jpg";
        }
        else {
            console.log(line);
            article.title = line;
            article.thumbnail = "/images/logo.png";
        }
        return article;
    }

    function isThisPersonTalking(line, person) {
        if (line.indexOf(person) == 0 && line.indexOf(person + " and") != 0 && line.indexOf(person + ",") != 0)
            return true;
        return false;
    }

    function backbuttonhandler(eventInfo) {
        var name = articlesList.getAt(1).title;
        if (name.indexOf("Series") < 0 && script.style.display == "none") {
            articlesList.splice(0, articlesList.length);
            for (var i = 1; i < 7; i++) {
                var article = {};
                article.title = "Series " + i;
                article.thumbnail = "/images/series.png";
                articlesList.push(article);
            }
            document.getElementById("backbutton").disabled = true;
        }
        if (articlelist.style.display == "none") {
            scriptList.splice(0, scriptList.length);
            script.style.display = "none";
            articlelist.style.display = "";
            WinJS.UI.Animation.enterPage(articlelist);
        }
    };

    app.start();
})();