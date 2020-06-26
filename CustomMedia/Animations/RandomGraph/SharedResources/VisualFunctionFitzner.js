/* global distanceStorage, svg, graph, d3, chartType, node, chartelement, modelTag, nrOfNodes, lambda, tau, link, g, e */

function tick() {
    link.attr("d", function (d) {
        // default for single edges:
        var x1 = d.source.x,
                y1 = d.source.y,
                x2 = d.target.x,
                y2 = d.target.y,
                dr = 0;
        // In the case of multiple edge we change its curvature
        if (d.angle != 0) {
            var dx = x2 - x1,
                    dy = y2 - y1,
                    dr = Math.sqrt(dx * dx + dy * dy) - Math.sqrt(300 * (d.angle - 1));
        }
        // The following is need to display selfloops
        // First some default values
        var drx = dr,
                dry = dr,
                yRotation = 0, // degrees
                largeArc = 0, // 1 or 0
                sweep = 1; // 1 or 0
        // now to the self-loops:
        if (x1 === x2 && y1 === y2) {
            yRotation = -45;
            largeArc = 1;
            // (width-2*x1>0) Change sweep to change orientation of loop. 
            if (2 * y1 - height + width - 2 * x1 > 0)
                sweep = 0;
            else
                sweep = 1;
            // Make drx and dry : radi of ellipse
            drx = 20;
            dry = 15;

            // For whatever reason the arc collapses to a point if the beginning
            // and ending points of the arc are the same, so kludge it.
            x2 = x2 + 1;
            y2 = y2 + 1;
        }

        return "M" + x1 + "," + y1 + "A" + drx + "," + dry + " " + yRotation + "," + largeArc + "," + sweep + " " + x2 + "," + y2;
    });

    node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });

}
;


function addLogo() {
    nameTag = svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "end")
            .attr("x", window.innerWidth * 6 / 7)
            .attr("y", height - 100)
            .style("font-family", "Raleway")
            .style("fill", "rgba(0,0,0, 0.5)")
            .style("font-size", "20px")
            .text("Fitzner, networkpages.nl")[0][0];
};


function initializeForceFullscreen() {
    // first of the standard configurations:
    svg = d3.select("body").append("svg")
            .attr("width", width).attr("height", height);

    force = d3.layout.force()
            .size([width - 100, height - 100]).charge(-60)
            .gravity(0.1)
            .linkDistance(100)
            .nodes(graph.nodes)
            .links(graph.links);

    if (modelTag === "ERRG") {
        force.charge(function(){
                    if (nrOfNodes<200) return -150;
                    else if (nrOfNodes<400) return -100;
                    else if (nrOfNodes<700) return -150;
                    else return -50;
                })
                .gravity(0.06*Math.pow(nrOfNodes,0.3))
                .linkDistance(function(){
                    if (nrOfNodes<200) return 120;
                    else if (nrOfNodes<400) return 80;
                    else if (nrOfNodes<700) return 50;
                    else return 20;
                });
    }
    
    if (modelTag === "ConfigFixed") {
        force.charge(-60)
                .gravity(0.1 * nrOfNodes / 100);
    }
    if (modelTag === "ConfigPowerLaw") {
        force.charge(-20).linkDistance(
                function(){
                    if (nrOfNodes<300)
                        return Math.min(500 / tau, 50);
                    else
                        return Math.min(200/ tau*100/nrOfNodes, 20);
                }).gravity(function(){
                    if (nrOfNodes<300)
                        return Math.max(4 * tau * tau, 1);
                    else
                        return Math.max(0.0001* tau* tau*nrOfNodes, 1.8);
        });
    }
    if (modelTag === "InhomGraph") {
        force.charge(-60).linkDistance(Math.max(200 / tau, 60))
                .gravity(Math.min(0.05 * tau*nrOfNodes/100, 0.3));
    }
     if (modelTag === "PrefAttachment") {
        force.charge(-60).linkDistance(Math.min(300,Math.max(10000/nrOfNodes, 60)));
                
    }

    force.on("tick", tick)
            .start();


    link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", function (d) {
                return "link count" + d.count;})
            .attr("id", function (d) {
        if (d.source.name < d.target.name)
            return "idlink" + d.source.name + "t" + d.target.name;
        else
            return "idlink" + d.target.name + "t" + d.source.name;
    });

    node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("id", function (n) {
                return "id"+n.name;})
            .attr("r", 5)
            .style("fill", function (d) {
                return color(d.group);
            })
            .call(force.drag);
    if (chartType === "DistanceChart") {
        node.on('click', function (d) {
            if (chartNotShown)
            {
                distanceStorage.origin = d;
                distanceStorage.point = this;
                d3.select(this).style("fill", "black");
                computeDistance();
                showDistance();

            } else {
                // if we select it once more we remove the computed graph
                if (distanceStorage.origin === d) {
                    distanceStorage.point = null;
                    removeChart();
                    d3.select(this).style("fill", function (d) {
                        return color(d.group);
                    });
                    var placeHolder = document.getElementById("buttonField");
                    placeHolder.removeChild(distanceStorage.buttom);
                    distanceStorage.buttom = {};

                }
            }
        });
    }

    if (chartType === "CompetitionType") {
        node.on('click', function (d) {
            if (!distanceStorage.origin1selected)
            {
                if (!distanceStorage.origin2selected) {
                    // active as selected
                    // console.log("Selected "+d.name+"as root 1.");
                    distanceStorage.origin = d;
                    distanceStorage.origin1selected = true;
                    d3.select(this).style("fill", "black");
                    showUnselectButton();
                } else {
                    if (distanceStorage.origin2 !== d) {
                        distanceStorage.origin = d;
                        distanceStorage.origin1selected = true;
                        startCompetition();
                    } else {
                        distanceStorage.origin2 = {};
                        distanceStorage.origin2selected = false;
                        d3.select(this).style("fill",  function (e) { return color(e.group); } );
                        unShowUnselectButton();
                        
                    }
                }
            } else {// so an origin was selected 
                if (distanceStorage.origin === d) {
                    distanceStorage.origin = {};
                    distanceStorage.origin1selected = false;
                    d3.select(this).style("fill",  function (e) { return color(e.group); } );
                    if (distanceStorage.origin2selected) {
                        unShowCompetition();
                    } else unShowUnselectButton();
                } else if (!distanceStorage.origin2selected) {
                    //console.log("Selected root =" +d.name+" as second root.");  
                    distanceStorage.origin2 = d;
                    distanceStorage.origin2selected = true;
                    startCompetition();
                } else {// so origin2selected===origin2selected== true and d!=origin)
                    if (distanceStorage.origin2 === d) {
                        //console.log("Unselected root 2: " +d.name+" .");  
                        distanceStorage.origin2 = {};
                        distanceStorage.origin2selected = false;
                        unShowCompetition();
                    }
                }
            }
        });
    }
}
;



var addEvent = function (object, type, callback) {
    if (object === null || typeof (object) === 'undefined')
        return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on" + type] = callback;
    }
}

addEvent(window, "resize", function () {
    width = window.innerWidth || e.clientWidth || g.clientWidth,
            height = window.innerHeight || e.clientHeight || g.clientHeight;
    d3.select("svg").attr("width", width).attr("height", height);
    if (nameTag !== null)
        if (nameTag.parentNode !== undefined)
            nameTag.parentNode.removeChild(nameTag);
    addLogo();
    if (!chartNotShown) {
        removeChart();
        if (chartType === "DistanceChart")
            showDistance();
        else if (chartType === "DegreehistChart")
            createHistogram();
    }
    //         .attr("myGroup", "histgram")
    force.size([width, height]);
});




function createHistogram() {
    /* Drawing the histogram */
    var binsize = 1;
    var xmin = 0;
    var xmax = graph.maxDegree;

    var histdata = new Array(graph.maxDegree + 1);
    for (var i = 0; i < graph.maxDegree + 1; i++) {
        if (graph.degreeHistor[i] > 1)
            histdata[i] = {numfill: graph.degreeHistor[i], meta: "" + graph.degreeHistor[i] + " nodes with degree " + i, degree: i};
        if (graph.degreeHistor[i] === 1)
            histdata[i] = {numfill: graph.degreeHistor[i], meta: "One node with degree " + i, degree: i};
    }


    // This scale is for determining the widths of the histogram bars
    // Must start at 0 or else x(binsize a.k.a dx) will be negative
    var x = d3.scale.linear()
            .domain([0, (xmax - xmin)])
            .range([0, width / 3]);

    // Scale for the placement of the bars
    var x2 = d3.scale.linear()
            .domain([xmin - 0.5, xmax + 0.5])
            .range([0, width / 3]);

    var y = d3.scale.linear()
            .domain([0, d3.max(histdata, function (d) {
                    if (d !== undefined)
                        return d.numfill;
                    //else console.log("unexpected null");
                })])
            .range([height, height * 3 / 4]);

    xAxis = d3.svg.axis()
            .scale(x2)
            .ticks(xmax + 1)
            .orient("bottom");
    yAxis = d3.svg.axis()
            .scale(y)
            .ticks(6)
            .orient("left");

    var tip = d3.tip()
            .attr('class', 'd3-tip')
            .direction('e')
            .offset([-20, 10])
            .html(function (d) {
                return '<table id="tiptable">' + d.meta + "</table>";
            });
    svg.call(tip);
    var binmargin = .2;
    var bottumMargin = -130;
    var rightMargin = 40;
    // set up the bars
    bar = svg.selectAll(".bar")
            .data(histdata)
            .enter().append("g")
            .attr("class", "bar")
            .attr("myGroup", "histgram")
            .attr("transform", function (d, i) {
                if (d !== undefined)
                    return "translate(" +
                            x2(i) + "," + (y(d.numfill) + bottumMargin) + ")";
                else
                    return "translate(" +
                            x2(i) + "," + (bottumMargin) + ")";
            })

            .on('mouseover', function (d) {
                tip.show(d);
                node.style("fill", function (e) {
                    if (e.degree === d.degree)
                        return '#ff2222';
                    else
                        return '#00aaff';
                });
            })
            .on('mouseout', function (d) {
                tip.hide(d);
                node.style("fill", function (d) {
                    return color(d.group);
                });
            });

    chartelement.push(bar);
    // add rectangles of correct size at correct location
    chartelement.push(bar.append("rect")
            .attr("x", rightMargin - 0.5 * x(binsize - 2 * binmargin))//+x(binmargin))
            //.attr("width", x(binsize - 2 * binmargin))
            .attr("width", x(binsize - 2 * binmargin))
            .attr("height", function (d) {
                if (d !== undefined)
                    return height - y(d.numfill);
                else
                    return 0;
            }));

    // add the x axis and x-label
    objxAxis = svg.append("g")
            .attr("class", "x axis")
            .attr("myGroup", "histgram")
            .attr("transform", "translate(" + rightMargin + " , " + (height + bottumMargin) + "  )")
            .style("font-family", "Raleway")
            .call(xAxis);
    chartelement.push(objxAxis);

    chartelement.push(svg.append("text")
            .attr("class", "xlabel")
            .attr("myGroup", "histgram")
            .attr("text-anchor", "middle")
            .attr("x", width / 4)
            .attr("y", height + bottumMargin + 35)
            .style("font-family", "Raleway")
            .text("Degree"));

    // add the y axis and y-label
    chartelement.push(svg.append("g")
            .attr("class", "y axis")
            .attr("myGroup", "histgram")
            .attr("transform", "translate(" + rightMargin + " ," + bottumMargin + ")")
            .style("font-family", "Raleway")
            .call(yAxis));
    chartNotShown = false;
}

function showDistance() {
    /* Drawing the histogram */
    var binsize = 1;
    var xmin = 0;
    var xmax = distanceStorage.maxdist;
    var histdata = new Array(xmax);

    if (distanceStorage.distanceDistr[0] > 1)
        histdata[0] = {numfill: distanceStorage.distanceDistr[0], meta: "" + distanceStorage.distanceDistr[0] + " nodes are not connected to the selected point.", distance: -1};
    if (graph.degreeHistor[i] === 1)
        histdata[0] = {numfill: distanceStorage.distanceDistr[0], meta: "One node is not connected to the selected point.", distance: -1};

    for (var i = 1; i < xmax + 1; i++) {
        if (distanceStorage.distanceDistr[i] > 1)
            histdata[i] = {numfill: distanceStorage.distanceDistr[i], meta: "" + distanceStorage.distanceDistr[i] + " nodes are at distance " + i, distance: i};
        if (distanceStorage.distanceDistr[i] === 1)
            histdata[i] = {numfill: distanceStorage.distanceDistr[i], meta: "One node is at distance " + i, distance: i};
    }


    // This scale is for determining the widths of the histogram bars
    // Must start at 0 or else x(binsize a.k.a dx) will be negative
    var x = d3.scale.linear()
            .domain([0, (xmax - xmin)])
            .range([0, width / 3]);

    // Scale for the placement of the bars
    var x2 = d3.scale.linear()
            .domain([xmin - 0.5, xmax + 0.5])
            .range([0, width / 3]);

    var y = d3.scale.linear()
            .domain([0, d3.max(histdata, function (d) {
                    if (d !== undefined)
                        return d.numfill;
                    //else console.log("unexpected null");
                })])
            .range([height, height * 3 / 4]);

    xAxis = d3.svg.axis()
            .scale(x2)
            .ticks(xmax + 1)
            .orient("bottom");
    yAxis = d3.svg.axis()
            .scale(y)
            .ticks(6)
            .orient("left");

    var tip = d3.tip()
            .attr('class', 'd3-tip')
            .direction('e')
            .offset([-20, 10])
            .html(function (d) {
                return '<table id="tiptable">' + d.meta + "</table>";
            });
    svg.call(tip);
    var binmargin = .2;
    var bottumMargin = -130;
    var rightMargin = 40;
    // set up the bars


    bar = svg.selectAll(".bar")
            .data(histdata)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function (d, i) {
                if (d !== undefined)
                    return "translate(" +
                            x2(i) + "," + (y(d.numfill) + bottumMargin) + ")";
                else
                    return "translate(" +
                            x2(i) + "," + (bottumMargin) + ")";
            })

            .on('mouseover', function (d) {
                tip.show(d);
                node.style("fill", function (e) {
                    if (e.distance === d.distance)
                        return '#ff2222';
                    else if (e === distanceStorage.origin)
                        return "black";
                    else
                        return '#00aaff';
                });
            })
            .on('mouseout', function (d) {
                tip.hide(d);
                node.style("fill", function (d) {
                    if (d === distanceStorage.origin)
                        return "black";
                    return color(d.group);
                });
            });
    chartelement.push(bar);

    // add rectangles of correct size at correct location
    chartelement.push(bar.append("rect")
            .attr("x", rightMargin - 0.5 * x(binsize - 2 * binmargin))//+x(binmargin))
            //.attr("width", x(binsize - 2 * binmargin))
            .attr("width", x(binsize - 2 * binmargin))
            .attr("height", function (d) {
                if (d !== undefined)
                    return height - y(d.numfill);
                else
                    return 0;
            }));

    // add the x axis and x-label
    var objxAxis = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + rightMargin + " , " + (height + bottumMargin) + "  )")
            .style("font-family", "Raleway")
            .call(xAxis);

    chartelement.push(objxAxis);

    chartelement.push(svg.append("text")
            .attr("class", "xlabel")
            .attr("text-anchor", "middle")
            .attr("x", width / 4)
            .attr("y", height + bottumMargin + 35)
            .style("font-family", "Raleway")
            .text("Distance to selected point"));

    chartelement.push(
            svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + rightMargin + " ," + bottumMargin + ")")
            .style("font-family", "Raleway")
            .call(yAxis));
    chartNotShown = false;

    distanceStorage.buttom = document.createElement("input");
    distanceStorage.buttom.type = "button";
    distanceStorage.buttom.value = "Unselect point";
    distanceStorage.buttom.onclick = function () {
        d3.select(distanceStorage.point).style("fill", function (d) {
            return color(d.group);
        });
        distanceStorage.point = null;
        var placeHolder = document.getElementById("buttonField");
        console.log(placeHolder);
        placeHolder.removeChild(distanceStorage.buttom);
        distanceStorage.buttom = {};
        removeChart();
    };


    var placeHolder = document.getElementById("buttonField");
    placeHolder.appendChild(distanceStorage.buttom);

}


function removeChart() {
    for (i = 0; i < chartelement.length; i++) {
        for (j = 0; j < chartelement[i].length; j++) {
            for (k = 0; k < chartelement[i][j].length; k++) {
                chartelement[i][j][k].parentNode.removeChild(chartelement[i][j][k]);
            }
        }
    }
    chartelement = [];
    chartNotShown = true;
}