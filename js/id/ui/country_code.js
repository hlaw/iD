iD.ui.CountryCode = function(context) {

    function update(selection) {
        var center = context.map().extent().center();
        var link = {
                    "au"   : "WikiProject_Australia",
                    "br"   : "WikiProject_Brazil",
                    "ca"   : "WikiProject_Canada",
                    "cn"   : "WikiProject_China",
                    "cn:hk": "WikiProject_Hong_Kong",
                    "de"   : "WikiProject_Germany",
                    "fr"   : "WikiProject_France",
                    "gb"   : "United_Kingdom",
                    "jp"   : "WikiProject_Japan",
                    "kr"   : "WikiProject_Korea",
                    "ph"   : "WikiProject_Philippines",
                    "ru"   : "WikiProject_Russia",
                    "sg"   : "WikiProject_Singapore",
                    "tw"   : "WikiProject_Taiwan",
                    "us"   : "WikiProject_United_States",
                    "vi"   : "WikiProject_Vietnam"
        };
        var linkbase = "//wiki.openstreetmap.org/wiki/";

        if (context.map().zoom()>=9) {
            iD.countryCode(context).search (center, function (error, countryCode) {
                var data;

                if ((!error) && (countryCode !== "None")) {
                    data = [countryCode];
                    selection.style ("display", null);
                    context.countryCode(countryCode);
                } else {
                    data = [];
                    selection.style("display", "none");
                    context.countryCode("");
                }
                var p = selection.selectAll("span")
                    .data(data, function(d) {return d;});

                p.enter()
                    .append("span")
                    .attr ("class", "country-code-text")
                    .text (String)
                    .style("background-color", "#11B311")
                        .transition().duration(3000)
                        .style("background-color", "#111111")
                        .ease("cubic-in")
                        .each("end", function (d) {
                            var country=d3.select(this)
                                .style("background-color", "transparent");
                            if (link.hasOwnProperty(d)) {
                                country.text('').append("a")
                                    .attr('class', 'wiki-link')
                                    .attr('href', function (d) {
                                        return linkbase + link[d];
                                    })
                                    .attr('target', '_blank')
                                    .attr('tabindex', -1)
                                    .text(String);
                            }
                        });

                p.exit()
                    .remove();

            });
        } else {
            selection.style("display", "none");
            context.countryCode("");
        }
    }


    return function(selection) {
        update(selection);

        context.connection().on('load.countrycode', function() {
            update(selection);
        });

        context.map().on('move.countrycode', _.debounce(function() {
            update(selection);
        }, 500));
    };
};
