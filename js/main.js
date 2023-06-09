/*
FINAL PROJECT
NICHOLAS GJURAJ, XIAOLI FANG
*/

// arbitrary decisions for frame sizes
const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 800;
const MARGINS = {left: 50, right: 50, top: 50, bottom: 50};

// visual dimensions based off of margins
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

// controls redrawing of graphs on hover.
let flip = true;
// external scatter data
let esd;
d3.csv("graddata/Admission_Predict_Ver1.1.csv").then((td) => {
    esd = td;
    console.log(esd);
});


// changes color in response to score
function color(s) {
    if (parseFloat(s) < .7) {
        return 'Orange';
    }
    else{
        return 'Blue';
    }
}

// rounds passed float to 4 decimal places
function round_4(flt){
    return Math.round(flt * 10000) / 10000;
}

// bar graph frame
const FRAME1 = d3.select("#v1")
    .append("svg")
    .attr("height", FRAME_HEIGHT)
    .attr("width", FRAME_WIDTH)
    .attr("class", "frame");

// builds the bar plot
function build_bar_plot() {

    d3.csv("graddata/bardata.csv").then((data) => {

        // different ways of formatting data for different functions.
        let clms = {'0.0':0,'0.025':0,'0.05':0,'0.075':0,'0.1':0,'0.125':0,'0.15':0,'0.175':0,'0.2':0,'0.225':0,'0.25':0,'0.275':0,'0.3':0,'0.325':0,'0.35':4,'0.375':3,'0.4':1,'0.425':5,'0.45':11,'0.475':8,'0.5':9,'0.525':12,'0.55':17,'0.575':18,'0.6':19,'0.625':20,'0.65':40,'0.675':24,'0.7':45,'0.725':34,'0.75':34,'0.775':25,'0.8':38,'0.825':13,'0.85':27,'0.875':12,'0.9':30,'0.925':21,'0.95':26,'0.975':4};
        let orig = [{'0.0':0},{'0.025':0},{'0.05':0},{'0.075':0},{'0.1':0},{'0.125':0},{'0.15':0},{'0.175':0},{'0.2':0},{'0.225':0},{'0.25':0},{'0.275':0},{'0.3':0},{'0.325':0},{'0.35':4},{'0.375':3},{'0.4':1},{'0.425':5},{'0.45':11},{'0.475':8},{'0.5':9},{'0.525':12},{'0.55':17},{'0.575':18},{'0.6':19},{'0.625':20},{'0.65':40},{'0.675':24},{'0.7':45},{'0.725':34},{'0.75':34},{'0.775':25},{'0.8':38},{'0.825':13},{'0.85':27},{'0.875':12},{'0.9':30},{'0.925':21},{'0.95':26},{'0.975':4}];
        let mdata = orig.map(d => {
            return {
                score: Object.keys(d)[0],
                count: d[Object.keys(d)[0]]
            };
        });

        // scale x using the buckets
        const X_SCALE3 = d3.scaleBand()
            .domain(Object.keys(clms))
            .range([MARGINS.left, VIS_WIDTH])
            .padding(0.2);

        // find max y
        const MAX_Y3 = d3.max(mdata, (d) => { return parseInt(d.count); });
        // scale y
        const Y_SCALE3 = d3.scaleLinear()
            .domain([0, MAX_Y3])
            .range([VIS_HEIGHT, 0]);

        // tooltip design
        let Tooltip = d3.select("#v1")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .attr('id', 'tt1')
            .style("background-color", "#FEFBEA")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("padding", "2px");


        //mouseover interactivity, draws border and shows the selected points in the bar in the corresponding scatter
        let mouseover = function(event, d) {
            // pertaining to tooltips
            Tooltip
                .style("opacity", 1);
            // pertaining to highlighting
            if (flip){
                flip = false;
                document.getElementById('lobf').style.opacity = '.1';
                let bar = document.getElementById(d.score);
                bar.style.stroke = 'black';
                bar.style.strokeWidth = '2';
                for (let i = 0; i < esd.length; i++){
                    let sel = document.getElementById(`dp${esd[i]['Serial No.']}`);
                    if(round_4(parseFloat(d.score))-.0125<=round_4(parseFloat(esd[i]['Chance of Admit'])) && round_4(parseFloat(esd[i]['Chance of Admit']))<round_4(parseFloat(d.score))+.0125){
                        sel.style.opacity = '1';
                        //sel.style.fill = 'red';
                    }else{
                        sel.style.opacity = '.03';
                    }
                }
            }
        };

        // populate the information about that point into tooltip
        let mousemove = function(event, d) {
            let lb = round_4(parseFloat(d['score']) - .0125);
            let rb = round_4(parseFloat(d['score']) + .0125);
            let plural;
            if(d['count'] > 1){plural = 's have';}
            else{plural = ' has';}
            Tooltip
                .html(`${d['count']} student${plural} an acceptance chance</br> within the range of ${lb} to ${rb}`)
                .style("left", (d3.pointer(event)[0]+55) + "px")
                .style("top", (d3.pointer(event)[1]+465) + "px");
        };

        //reset plots upon cursor leaving
        let mouseleave = function() {
            // pertaining to tooltips
            Tooltip
                .style("opacity", 0);
            // pertaining to highlighting
            if(!flip){
                flip = true;
                document.getElementById('lobf').style.opacity = '.5';
                for(let key in clms){
                    let bar = document.getElementById(key);
                    bar.style.strokeWidth = '0';
                }
                for (let i = 0; i < esd.length; i++){
                    let sel = document.getElementById(`dp${esd[i]['Serial No.']}`);
                    sel.style.opacity = '.5';
                    sel.style.fill = color(esd[i][['Chance of Admit']]);
                }
            }
        };

        // make bars
        FRAME1.selectAll("bar")
            .data(mdata)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => { return X_SCALE3(d.score); })
            .attr("y", (d) => { return MARGINS.top + Y_SCALE3(d.count); })
            .attr('id', (d) => { return d.score })
            .attr("width", X_SCALE3.bandwidth())
            .attr("height", (d) => { return (VIS_HEIGHT - Y_SCALE3(d.count)); })
            .attr("fill", (d) => { return color(d.score); })
            .attr("opacity", 0.5)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        // title
        FRAME1.append("text")
            .attr("x", (VIS_WIDTH / 2 + MARGINS.left / 2))
            .attr("y", (MARGINS.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", 900)
            .text("Acceptance chance distribution amongst students.");

        // x-axis, skewed for readability
        FRAME1.append("g")
            .attr("transform", "translate(0," + (VIS_HEIGHT+MARGINS.top) + ")")
            .call(d3.axisBottom(X_SCALE3))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-55)" );

        // y axis.
        FRAME1.append("g")
            .attr("transform", "translate(" + MARGINS.left +
                "," + MARGINS.top + ")")
            .call(d3.axisLeft(Y_SCALE3));

        // x axis label
        FRAME1.append("text")
            .attr("text-anchor", "middle")
            .attr("x", (VIS_WIDTH / 2 + MARGINS.left / 2))
            .attr("y", VIS_HEIGHT + MARGINS.top +MARGINS.bottom)
            .text('Acceptance chance');
        // y axis label
        FRAME1.append("text")
            .attr("text-anchor", "middle")
            .attr('x', -((VIS_HEIGHT/2)+MARGINS.top))
            .attr("y", 6)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text('Number of students');
    });
}

// initialization of json object used for animations.
let last_positioned = {};


// frame 2
const FRAME2 = d3.select("#v2")
    .append("svg")
    .attr("height", FRAME_HEIGHT)
    .attr("width", FRAME_WIDTH)
    .attr('id', 'sf2')
    .attr("class", "frame");

// builds the scatter plot. bool serves as indication of newly selected axes
function build_scatter_plot(flag) {
    // clear (potentially) existing graph when (re)building
    document.getElementById("sf2").innerHTML = '';
    let x = document.getElementById("tt");
        if(x){x.remove();}
    d3.csv("graddata/Admission_Predict_Ver1.1.csv").then((data) => {
        let s1 = '';
        let s2 = '';
        if(flag) {
            let sel1 = document.getElementById('x_select');
            s1 = sel1.options[sel1.selectedIndex].text;
            let sel2 = document.getElementById('y_select');
            s2 = sel2.options[sel2.selectedIndex].text;
        }else {
            s1 = 'GRE Score';
            s2 = 'TOEFL Score';
        }

        // find max x
        const MAX_X1 = d3.max(data, (d) => { return parseFloat(d[s1]); });
        const MIN_X1 = d3.min(data, (d) => { return parseFloat(d[s1]); });

        // scale x
        const X_SCALE1 = d3.scaleLinear()
            .domain([MIN_X1-0.1, MAX_X1+0.1])
            .range([0, VIS_WIDTH]);

        // find max y
        const MAX_Y1 = d3.max(data, (d) => { return parseFloat(d[s2]); });
        const MIN_Y1 = d3.min(data, (d) => { return parseFloat(d[s2]); });

        // scale y
        const Y_SCALE1 = d3.scaleLinear()
            .domain([MIN_Y1-0.1, MAX_Y1+0.1])
            .range([VIS_HEIGHT, 0]);

        // tooltip design
        let Tooltip = d3.select("#v2")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .attr('id', 'tt')
            .style("background-color", "#FEFBEA")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("padding", "2px");

        //mouse interactivity functions -- create tooltips.
        let mouseover = function(d) {
            Tooltip
                .style("opacity", 1);
        };

        // populate the information about that point into tooltip
        let mousemove = function(event, d) {
            Tooltip
                .html("For this particular student..." +
                    "<br>CGPA: " + d['CGPA'] +
                    "<br>Chance of Admit: " + d['Chance of Admit'] +
                    '<br>GRE Score: ' + d['GRE Score'] +
                    '<br>LOR: ' + d['LOR'] +
                    '<br>Research: ' + d['Research'] +
                    '<br>SOP: ' + d['SOP'] +
                    '<br>TOEFL Score: ' + d['TOEFL Score'] +
                    '<br>University Rating: ' + d['University Rating'])
                .style("left", (d3.pointer(event)[0]+995) + "px")
                .style("top", (d3.pointer(event)[1]+495) + "px");
        };

        // hide tooltip on exit
        let mouseleave = function(d) {
            Tooltip
                .style("opacity", 0);
        };

        if(!flag){
            for(let i=0;i<data.length;i++){
                last_positioned[i] = {'x':((X_SCALE1(MIN_X1)+X_SCALE1(MAX_X1))/2) + MARGINS.left,
                    'y':((Y_SCALE1(MIN_Y1)+Y_SCALE1(MAX_Y1))/2) + MARGINS.left};
            }
        }

        // plot all points
        FRAME2.selectAll("points")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => { return last_positioned[parseInt(d['Serial No.'])-1]['x']; })
            .attr("cy", (d) => { return last_positioned[parseInt(d['Serial No.'])-1]['y']; })
            .attr("r", 3)
            .attr("name", "p1")
            .attr("id", (d) => { return 'dp' + d['Serial No.']; })
            .attr("class", "point")
            .style('fill', function(d) {
                return color(d['Chance of Admit']);
            })
            .style('opacity', .5)
            .style('stroke-width', 0)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);

        //linear regression, x is s1, y is s2
        let summation_xy = 0;
        let summation_y = 0;
        let summation_x = 0;
        let summation_x_sqr = 0;
        for(let i=0;i<data.length; i++){
            summation_x += parseFloat(data[i][s1]);
            summation_y += parseFloat(data[i][s2]);
            summation_xy += parseFloat(data[i][s1]) * parseFloat(data[i][s2]);
            summation_x_sqr += parseFloat(data[i][s1]) * parseFloat(data[i][s1]);
        }
        let slope = ((data.length * summation_xy) - (summation_x * summation_y))/((data.length*summation_x_sqr)-(summation_x*summation_x));
        let y_int = (summation_y - (slope*summation_x))/data.length;

        // calculates y values from earlier calculated m&b
        function y_at(x_val){
            return (slope * x_val) + y_int;
        }

        // line of best fit w/ fade in
        FRAME2.append("line")
            .attr('id','lobf')
            .attr("x1", X_SCALE1(MIN_X1) + MARGINS.left)
            .attr("y1", Y_SCALE1(y_at(MIN_X1)) + MARGINS.left)
            .attr("x2", X_SCALE1(MAX_X1) + MARGINS.left)
            .attr("y2", Y_SCALE1(y_at(MAX_X1)) + MARGINS.left)
            .style("stroke", "red")
            .style("stroke-width", '2')
            .attr("opacity", '0')
            .transition()
            .duration(4000)
            .attr("opacity", '.5');

        // add (changing) title
        FRAME2.append("text")
            .attr("x", (VIS_WIDTH / 2 + MARGINS.left / 2))
            .attr("y", (MARGINS.top / 2))
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", 900)
            .text(`${s1} plotted against ${s2}.`);

        // x axis
        FRAME2.append("g")
            .attr("transform", "translate(" + MARGINS.left +
                "," + (VIS_HEIGHT + MARGINS.top) + ")")
            .call(d3.axisBottom(X_SCALE1).ticks(10))
            .attr("font-size", '10px');

        // y axis
        FRAME2.append("g")
            .attr("transform", "translate(" + MARGINS.left +
                "," + (MARGINS.bottom) + ")")
            .call(d3.axisLeft(Y_SCALE1).ticks(10))
            .attr("font-size", '10px');

        // x axis label
        FRAME2.append("text")
            .attr("text-anchor", "middle")
            .attr("x", (VIS_WIDTH / 2 + MARGINS.left / 2))
            .attr("y", VIS_HEIGHT + MARGINS.top +MARGINS.bottom)
            .text(s1);
        // y axis label
        FRAME2.append("text")
            .attr("text-anchor", "middle")
            .attr('x', -((VIS_HEIGHT/2)+MARGINS.top))
            .attr("y", 6)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text(s2);

        // have data points fly in (superfluous)
        FRAME2.selectAll("circle")
            .transition()
            .delay(function(d,i){return(i*3)})
            .duration(2000)
            .attr("cx", function (d) { return X_SCALE1(d[s1])+ MARGINS.left; } )
            .attr("cy", function (d) { return Y_SCALE1(d[s2])+ MARGINS.left; } );

        // update positions for movement.
        for(let i=0;i<data.length;i++){
            last_positioned[i] = {'x':X_SCALE1(data[i][s1])+ MARGINS.left,
                'y':Y_SCALE1(data[i][s2])+ MARGINS.left};
        }

    });
}

// create graphs
build_bar_plot();
build_scatter_plot(false);
