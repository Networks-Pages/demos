/*
 * Create a Erdos Renyi graph with given number of points and edge probability
 * While creating the graph we also sav for each node how many of his edges are
 * active and create the histrogram of the degrees (count there number occurence
 * of each degree.)
 */
/* global distanceStorage */

function createERgraph(nrpoints, bondprob) {

    var nr = Number(nrpoints);
    var prob = bondprob;
    var nodes = [];

    for (i = 0; i < nr; i++) {
        var node = {}
        node.name = i;
        node.degree = 0;
        nodes[i] = node;
    }
    var link = [];
    for (i = 0; i < nr; i++) {
        for (j = 0; j < i; j++) {
            if (Math.random() < prob) {
                edge = {};
                edge.source = i;
                edge.target = j;
                nodes[i].degree++;
                nodes[j].degree++;
                edge.value = 2;
                edge.angle = 0;
                edge.count = 1;
                link.push(edge);
            }
        }
    }
    
    for (i = 0; i < nr; i++) {
        nodes[i].group = nodes[i].degree;
    }
    
    var maxDeg = 0;
    for (i = 0; i < nr; i++) {
        maxDeg = Math.max(nodes[i].degree, maxDeg);
    }
    var degHistory = [];
    for (i = 0; i < maxDeg + 1; i++) {
        degHistory[i] = 0;
    }
    for (i = 0; i < nr; i++) {
        degHistory[nodes[i].degree]++;
    }
    graph = {};
    graph.links = link;
    graph.nodes = nodes;
    graph.degreeHistor = degHistory;
    graph.maxDegree = maxDeg;
    return graph;
}


/*
 * Create a inhomogenuous random graph, in which edges are keeps propotional 
 * to the weight of the endpoints of the graph.
 * 
 */

function createERRG(nre, tau) {
    var nr = Number(nre);
    var tau = Number(tau);
    var totalweight = 0;
    var nodes = [];
    var reverse = 1.0 / (tau - 1);
    // create the nodes
    for (i = 0; i < nr; i++) {
        var site = {}
        site.name = i;
        site.weight = Math.pow(nr * 1.0 / (i + 1), reverse);
        site.degree = 0;
        totalweight += site.weight;
        nodes[i] = site;
    }
    var link = [];
    for (i = 0; i < nr; i++) {
        for (j = 0; j < i; j++) {
            var level = nodes[i].weight * nodes[j].weight / (nodes[i].weight * nodes[j].weight + totalweight);

            if (level > Math.random()) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.value = 2;
                edge.angle = 0;
                edge.count = 1;
                nodes[i].degree++;
                nodes[j].degree++;
                link.push(edge)
            }
        }
    }

    var maxDeg = 0;
    for (i = 0; i < nr; i++) {
        maxDeg = Math.max(nodes[i].degree, maxDeg);
    }

    var degHistory = [];
    for (i = 0; i < maxDeg + 1; i++) {
        degHistory[i] = 0;
    }
    for (i = 0; i < nr; i++) {
        degHistory[nodes[i].degree]++;
        nodes[i].group = nodes[i].degree;
    }


    graph = {};
    graph.links = link;
    graph.nodes = nodes;
    graph.degreeHistor = degHistory;
    graph.maxDegree = maxDeg;
    return graph;
}



/*
 * Create a graph following the configuration model in which each site has the 
 * same degree. This edge is possiblz a multigraph. As input we expect the 
 * number of sites and the fixed degree=number of edges per vertex.
 */
function createConfigModelgraphFixedDegree(nre, edges) {
    var nr = Number(nre);
    var ed = Number(edges);
    var nodes = [];
    // create the nodes
    for (i = 0; i < nr; i++) {
        var node = {}
        node.name = i;
        nodes[i] = node;
        node.group = 1;
        node.degree = ed;
    }
    // We first create the half edges
    var halfedgePosition = [];
    var k = 0;
    for (i = 0; i < nr; i++) {
        for (j = 0; j < ed; j++) {
            halfedgePosition[k++] = i;
        }
    }
    // then we compute there allocation
    for (i = ed * nr - 1; i > 0; i -= 2) {
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = halfedgePosition[i - 1];
        halfedgePosition[i - 1] = halfedgePosition[r];
        halfedgePosition[r] = tmp;
    }

    // then we count the edges, to detect multiple edges
    var multiCounter = [];
    for (i = 0; i < nr; i++) {
        multiCounter[i] = [];
        for (j = 0; j < i + 1; j++) {
            multiCounter[i][j] = 0;
        }
    }
    for (i = ed * nr - 1; i > 0; i -= 2) {
        var start = halfedgePosition[i];
        var end = halfedgePosition[i - 1];
        if (start > end)
            multiCounter[start][end]++;
        else
            multiCounter[end][start]++;
    }

    // once we counted the edges, we create the represenation for the display
    var link = [];
    for (i = 0; i < nr; i++) {
        for (j = 0; j < i; j++) {
            if (multiCounter[i][j] == 1) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.angle = 0;
                edge.count = 1;
                link.push(edge);
            }
            if (multiCounter[i][j] == 2) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.angle = 1;
                edge.count = 2;
                link.push(edge);
                edge2 = {};
                edge2.source = j;
                edge2.target = i;
                edge2.angle = 2;
                edge2.count = 2;
                link.push(edge2);
            }
            if (multiCounter[i][j] == 3) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.angle = 1;
                edge.count = 3;
                link.push(edge);
                edge2 = {};
                edge2.source = j;
                edge2.target = i;
                edge2.angle = 1;
                edge2.count = 3;
                link.push(edge2);
                edge3 = {};
                edge3.source = i;
                edge3.target = j;
                edge3.angle = 0;
                edge3.count = 3;
                link.push(edge3);
            }
            if (multiCounter[i][j] > 3) {
                for (k = 0; k < multiCounter[i][j]; k++) {
                    edge = {};
                    edge.source = i;
                    edge.target = j;
                    edge.angle = 1;
                    edge.count = k + 1;
                    link.push(edge);
                }
            }
        }
        if (multiCounter[i][i] > 0) {
            edge = {};
            edge.source = i;
            edge.target = j;
            edge.angle = 0;
            edge.count = multiCounter[i][i];
            link.push(edge);
        }
    }
    var degHistory = [];
    for (i = 0; i < ed; i++) {
        degHistory[i] = 0;
    }
    degHistory[ed] = nr;
    graph = {};
    graph.links = link;
    graph.nodes = nodes;
    graph.degreeHistor = degHistory;
    graph.maxDegree = ed;
    return graph;
}


/*
 * Create a graph following the configuration model in which each site has the 
 * same degree. This edge is possiblz a multigraph. As input we expect the 
 * number of sites and the fixed degree=number of edges per vertex.
 */
function createConfigPowerLaw(nre, edges) {
    var nr = Number(nre);
    var ed = Number(edges);
    // Now we need to compute the distribution of the discrete power law
    // We first create the half edges
    var factors = [];
    factors[0] = 0;
    factors[1] = 0;
    var zeta = 0;
    var cutoff = Math.round(tau * 100);
    for (k = 2; k < cutoff + 1; k++) {
        factors[k] = Math.pow(k, -tau);
        zeta += factors[k];
    }
    var cdf = [];
    cdf[0] = 0;
    cdf[1] = 0;
    for (k = 2; k < cutoff + 1; k++) {
        cdf[k] = cdf[k - 1] + factors[k] / zeta;
    }

    var iteratorPos = 2;
    var iteratorValue = 0;
    var halfedgePosition = [];
    var k = 0;
    var edgeperNode = [];
    for (i = 0; i < nr; i++) {
        // find number of new edges:
        while (iteratorValue > cdf[iteratorPos + 1]) {
            iteratorPos++;
        }
        edgeperNode[i] = iteratorPos;
        for (j = 0; j < iteratorPos; j++) {
            halfedgePosition[k++] = i;
        }
        iteratorValue += 1.0 / nr;
    }
    // then we compute there allocation
    for (i = halfedgePosition.length - 1; i > 0; i -= 2) {
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = halfedgePosition[i - 1];
        halfedgePosition[i - 1] = halfedgePosition[r];
        halfedgePosition[r] = tmp;
    }

    // then we count the edges, to detect multiple edges
    var multiCounter = [];
    for (i = 0; i < nr; i++) {
        multiCounter[i] = [];
        for (j = 0; j < i + 1; j++) {
            multiCounter[i][j] = 0;
        }
    }
    for (i = halfedgePosition.length - 1; i > 0; i -= 2) {
        var start = halfedgePosition[i];
        var end = halfedgePosition[i - 1];
        if (start > end)
            multiCounter[start][end]++;
        else
            multiCounter[end][start]++;
    }

    // once we counted the edges, we create the represenation for the display
    var link = [];
    for (i = 0; i < nr; i++) {
        for (j = 0; j < i; j++) {
            if (multiCounter[i][j] === 1) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.angle = 0;
                edge.count = 1;
                link.push(edge);
            }
            if (multiCounter[i][j] === 2) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.angle = 1;
                edge.count = 2;
                link.push(edge);
                edge2 = {};
                edge2.source = j;
                edge2.target = i;
                edge2.angle = 2;
                edge2.count = 2;
                link.push(edge2);
            }
            if (multiCounter[i][j] === 3) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.angle = 1;
                edge.count = 3;
                link.push(edge);
                edge2 = {};
                edge2.source = j;
                edge2.target = i;
                edge2.angle = 1;
                edge2.count = 3;
                link.push(edge2);
                edge3 = {};
                edge3.source = i;
                edge3.target = j;
                edge3.angle = 0;
                edge3.count = 3;
                link.push(edge3);
            }
            if (multiCounter[i][j] > 3) {
                for (k = 0; k < multiCounter[i][j]; k++) {
                    edge = {};
                    edge.source = i;
                    edge.target = j;
                    edge.angle = 1;
                    edge.count = k + 1;
                    link.push(edge);
                }
            }
        }
        if (multiCounter[i][i] > 0) {
            edge = {};
            edge.source = i;
            edge.target = j;
            edge.angle = 0;
            edge.count = multiCounter[i][i];
            link.push(edge);
        }
    }

    var nodes = [];
    // create the nodes
    for (i = 0; i < nr; i++) {
        var node = {}
        node.name = i;
        nodes[i] = node;
        node.degree = edgeperNode[i];
        node.group = edgeperNode[i];//Math.floor(Math.random() * (10) + 1);
    }

    var maxDeg = 0;
    for (i = 0; i < nr; i++) {
        maxDeg = Math.max(nodes[i].degree, maxDeg);
    }

    var degHistory = [];
    for (i = 0; i < maxDeg + 1; i++) {
        degHistory[i] = 0;
    }
    for (i = 0; i < nr; i++) {
        degHistory[nodes[i].degree]++;
    }

    graph = {};
    graph.links = link;
    graph.nodes = nodes;
    graph.degreeHistor = degHistory;
    graph.maxDegree = maxDeg;
    return graph;
}


/*
 * Create a preferential attachment graph as describted in CITE.
 */
function createPrefgraph(nrpoints, deltagiven, offspring) {
    var nr = Number(nrpoints);
    var delta = Number(deltagiven);
    var totaledges = nr * offspring;
    var nodes = [];
    var link = [];
    // we start created a preferential attachment graph in which each new
    // node only introduces one new node.
    var abstractnodes = [];
    var firstnode = {};
    firstnode.degree = 2;
    firstnode.target = 0;
    abstractnodes[0] = firstnode;
    for (i = 1; i < totaledges; i++) {
        var node = {};
        node.degree = 1;
        abstractnodes[i] = node;

        var denominator = i * (2 + delta) + (1 + delta);
        var toBeat = Math.random() * denominator;
        var edgeTarget = 0;
        var cummulativeNomitor = abstractnodes[edgeTarget].degree + delta;
        while (toBeat > cummulativeNomitor) {
            edgeTarget++;
            cummulativeNomitor += abstractnodes[edgeTarget].degree + delta;
        }
        abstractnodes[edgeTarget].degree++;
        abstractnodes[i].target = edgeTarget;
    }

    // Starting from this we compute the adjacency matrix.
    // We syhould point out that this is not the normal adjacency matrix,
    // namely we will only one triangle and also mark in it the
    // number of edges between two points(multigraph).
    var multiCounter = [];
    for (i = 0; i < nr; i++) {
        multiCounter[i] = [];
        for (j = 0; j < i + 1; j++) {
            multiCounter[i][j] = 0;
        }
    }

    for (i = 1; i < totaledges; i++) {
        var source = Math.floor(i / offspring);
        var target = Math.floor(abstractnodes[i].target / offspring);
        multiCounter[source][target]++;
    }

    // once we counted the edges, we create the represenation for the display
    var link = [];
    var nodes = [];
    // create the nodes
    for (i = 0; i < nr; i++) {
        var node = {}
        node.name = i;
        node.degree = 0;
        nodes[i] = node;
    }


    for (i = 0; i < nr; i++) {
        for (j = 0; j < i; j++) {
            nodes[i].degree += multiCounter[i][j];
            nodes[j].degree += multiCounter[i][j];
            if (multiCounter[i][j] === 1) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.angle = 0;
                edge.count = 1;
                link.push(edge);
            }
            if (multiCounter[i][j] === 2) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.angle = 1;
                edge.count = 2;
                link.push(edge);
                edge2 = {};
                edge2.source = j;
                edge2.target = i;
                edge2.angle = 2;
                edge2.count = 2;
                link.push(edge2);
            }
            if (multiCounter[i][j] === 3) {
                edge = {};
                edge.source = i;
                edge.target = j;
                edge.angle = 1;
                edge.count = 3;
                link.push(edge);
                edge2 = {};
                edge2.source = j;
                edge2.target = i;
                edge2.angle = 1;
                edge2.count = 3;
                link.push(edge2);
                edge3 = {};
                edge3.source = i;
                edge3.target = j;
                edge3.angle = 0;
                edge3.count = 3;
                link.push(edge3);
            }
            if (multiCounter[i][j] > 3) {
                for (k = 0; k < multiCounter[i][j]; k++) {
                    edge = {};
                    edge.source = i;
                    edge.target = j;
                    edge.angle = 1;
                    edge.count = k + 1;
                    link.push(edge);
                }
            }
        }

        if (multiCounter[i][i] > 0) {
            nodes[i].degree += multiCounter[i][i];
            edge = {};
            edge.source = i;
            edge.target = j;
            edge.angle = 0;
            edge.count = multiCounter[i][i];
            link.push(edge);
        }
    }

    var maxDeg = 0;
    for (i = 0; i < nr; i++) {
        maxDeg = Math.max(nodes[i].degree, maxDeg);
        nodes[i].group = nodes[i].degree;
    }

    var degHistory = [];
    for (i = 0; i < maxDeg + 1; i++) {
        degHistory[i] = 0;
    }
    for (i = 0; i < nr; i++) {
        degHistory[nodes[i].degree]++;
    }

    graph = {};
    graph.links = link;
    graph.nodes = nodes;
    graph.degreeHistor = degHistory;
    graph.maxDegree = maxDeg;
    return graph;
}


function computeDistance() {
    distanceStorage.infty = -1;
    distanceStorage.distanceDistr = [];
    for (i = 0; i < graph.nodes.length; i++) {
        graph.nodes[i].distance = distanceStorage.infty;
    }

    graph.nodes[distanceStorage.origin.name].distance = 0;

    if (distanceStorage.origin.degree === 0) {
        distanceStorage.distanceDistr[0] = graph.nodes.length - 1;
    } else {
        var connectedPoints = 1, toCheck = [], dist = 1;
        toCheck.push(distanceStorage.origin.name);

        while (toCheck.length > 0) {
            distanceStorage.distanceDistr[dist] = 0;
            var nextCheck = [];
            for (i = 0; i < graph.links.length; i++) {
                var start = graph.links[i].source.name,
                        end = graph.links[i].target.name;
                for (j = 0; j < toCheck.length; j++) {
                    var toConsider = toCheck[j];
                    if (start === toConsider) {
                        if (graph.nodes[end].distance === distanceStorage.infty) {
                            graph.nodes[end].distance = dist;
                            distanceStorage.distanceDistr[dist]++;
                            nextCheck.push(end);
                        }
                    }
                    else if (end === toConsider) {
                        if (graph.nodes[start].distance === distanceStorage.infty) {
                            graph.nodes[start].distance = dist;
                            distanceStorage.distanceDistr[dist]++;
                            nextCheck.push(start);
                        }
                    }
                }
            }
            connectedPoints += distanceStorage.distanceDistr[dist];
            dist++;
            toCheck = nextCheck;
        }
        distanceStorage.distanceDistr[0] = graph.nodes.length - connectedPoints;
        distanceStorage.maxdist = dist - 2;
    }
}
;

function createUndirectedSimpleGraphSparse() {
    graph.undirectedSimple = [];
    for (i = 0; i < nrOfNodes; i++) {
        graph.undirectedSimple[i] = [];
    }

    for (i = 0; i < graph.links.length; i++) {
        var start = graph.links[i].source.name,
                end = graph.links[i].target.name;
        graph.undirectedSimple[start].push(end);
        graph.undirectedSimple[end].push(start);
    }
}

// in methode we compute the detail of two competing epidemics in one given network
// NOTE this method is only implemented for the case that each epidemics has a fixed transmission speed
// that is realised at the same speed along ALL connected edges
function computeContactStructureDeterministic() {
    distanceStorage.infty = 0;
    distanceStorage.distanceDistr = [];
    distanceStorage.timestamps = [];
    distanceStorage.checkOrder = [];
    distanceStorage.checkOrderNodes = [];
    for (i = 0; i < graph.nodes.length; i++) {
        graph.nodes[i].distance = distanceStorage.infty;
        graph.nodes[i].type=0;
    }
    var ministart=0.00001;
    createUndirectedSimpleGraphSparse();
    toCheck = {};
    toCheck.chain1 = [distanceStorage.origin.name];
    toCheck.speed1 = distanceStorage.speedType1;
    toCheck.nextMarkingtime1 = ministart;
    toCheck.chain2 = [distanceStorage.origin2.name];
    toCheck.speed2 = -distanceStorage.speedType2;
    toCheck.nextMarkingtime2 = -ministart;
    // following is the exploration that is continued until all connected nodes are explored
    while (toCheck.chain1.length + toCheck.chain2.length > 0) { 
        var nextCheck = [], checking, type, arrivalTime, speed;
        // first we find what type is going to invade next
        if (toCheck.chain1.length === 0) {
            type = 2;
        } else if (toCheck.chain2.length === 0) {
            type = 1; 
        } else {
            if (toCheck.nextMarkingtime1 + toCheck.nextMarkingtime2 === 0) {
                if (Math.random()>0.5){
                    type = 2;
                } else {
                    type = 1;
                }
            } else if (toCheck.nextMarkingtime1 + toCheck.nextMarkingtime2 > 0) {
                type = 2;
            } else {
                type = 1;
            }
        }
        
        if (type===1){
            checking = toCheck.chain1; arrivalTime = toCheck.nextMarkingtime1; speed=toCheck.speed1;
        } else {
            checking = toCheck.chain2; arrivalTime = toCheck.nextMarkingtime2; speed=Math.abs(toCheck.speed2);
        }
                 
        // The we let the selected type do the next step of the invasion.
        // We save save all neighbor of the expored verticies into the array nextcheck
        for(i=0;i<checking.length;i++){
            if(graph.nodes[checking[i]].distance === distanceStorage.infty){
                var thisNr=checking[i];
                graph.nodes[thisNr].distance=arrivalTime;
                graph.nodes[thisNr].type=type;
                graph.nodes[thisNr].id="circle#id"+thisNr;
                distanceStorage.checkOrderNodes.push(graph.nodes[thisNr]);
                for(j=0;j<graph.undirectedSimple[thisNr].length;j++){
                    var otherNr = graph.undirectedSimple[thisNr][j];
                    if(graph.nodes[otherNr].distance === distanceStorage.infty){
                        // we found an vertex that has not been infected. 
                        // So let us do so.
                        nextCheck.push( otherNr );
                        var newEdge={};
                        newEdge.birth=Math.abs(arrivalTime);
                        
                        newEdge.transmissionTime=speed;
                        
                        newEdge.source=thisNr;
                        newEdge.target=otherNr;
                            
                        if(otherNr<thisNr){
                            newEdge.id="path#" + "idlink" +otherNr+"t"+ thisNr;
                        }
                        else {
                            newEdge.id="path#" + "idlink" +thisNr+"t"+ otherNr;
                        }
                        newEdge.type=type;
                        distanceStorage.checkOrder.push(newEdge);
                    } else if(graph.nodes[thisNr].type!==graph.nodes[otherNr].type){
                        // Oh we found point at which both end have a different type. This is a boundary!
                        var newEdge={};
                        newEdge.birth=Math.abs(arrivalTime);
                        if(type===1){
                           newEdge.death=Math.abs(arrivalTime+distanceStorage.speedType1);
                        } else newEdge.death=Math.abs(arrivalTime+distanceStorage.speedType2);
                        
                        newEdge.source=thisNr;
                        newEdge.target=otherNr;
                        
                        newEdge.transmissionTime=speed;    
                        
                        if(otherNr<thisNr){
                            newEdge.id="path#" + "idlink" +otherNr+"t"+ thisNr;
                        }
                        else {
                            newEdge.id="path#" + "idlink" +thisNr+"t"+ otherNr;
                        }
                        newEdge.type=3;
                        distanceStorage.checkOrder.push(newEdge);
                    }
                }
            }
        }
        
        if(type===1){
            toCheck.chain1=nextCheck; toCheck.nextMarkingtime1=toCheck.nextMarkingtime1+toCheck.speed1;
        } else {
            toCheck.chain2=nextCheck; toCheck.nextMarkingtime2=toCheck.nextMarkingtime2+toCheck.speed2;
        }
    }
    distanceStorage.maxdist=toCheck.nextMarkingtime1;
    distanceStorage.mindist=toCheck.nextMarkingtime2;            
};
    