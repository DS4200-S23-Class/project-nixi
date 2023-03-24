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
let flip = true
// external scatter data
let esd;
d3.csv("graddata/Admission_Predict_Ver1.1.csv").then((td) => {esd = td});

// changes color in response to score
function color(s) {
    if (parseFloat(s) < .7) {
        return 'Orange';
    }
    else{
        return 'Blue';
    }
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
        let clms = {'0.0':0, '0.025':0, '0.05':0, '0.075':0, '0.1':0, '0.125':0, '0.15':0, '0.175':0, '0.2':0, '0.225':0, '0.25':0, '0.275':0, '0.3':0, '0.325':2, '0.35':3, '0.375':3, '0.4':4, '0.425':4, '0.45':13, '0.475':8, '0.5':11, '0.525':13, '0.55':19, '0.575':15, '0.6':25, '0.625':26, '0.65':32, '0.675':22, '0.7':52, '0.725':30, '0.75':32, '0.775':31, '0.8':31, '0.825':15, '0.85':24, '0.875':15, '0.9':28, '0.925':25, '0.95':17, '0.975':0};
        let orig = [{'0.0':0}, {'0.025':0}, {'0.05':0}, {'0.075':0}, {'0.1':0}, {'0.125':0}, {'0.15':0}, {'0.175':0}, {'0.2':0}, {'0.225':0}, {'0.25':0}, {'0.275':0}, {'0.3':0}, {'0.325':2}, {'0.35':3}, {'0.375':3}, {'0.4':4}, {'0.425':4}, {'0.45':13}, {'0.475':8}, {'0.5':11}, {'0.525':13}, {'0.55':19}, {'0.575':15}, {'0.6':25}, {'0.625':26}, {'0.65':32}, {'0.675':22}, {'0.7':52}, {'0.725':30}, {'0.75':32}, {'0.775':31}, {'0.8':31}, {'0.825':15}, {'0.85':24}, {'0.875':15}, {'0.9':28}, {'0.925':25}, {'0.95':17}, {'0.975':0}];
        let mdata = orig.map(d => {
            return {
                score: Object.keys(d)[0],
                count: d[Object.keys(d)[0]]
            }
        });

        // scale x using the buckets
        const X_SCALE3 = d3.scaleBand()
            .domain(Object.keys(clms))
            .range([MARGINS.left, VIS_WIDTH])
            .padding(0.2);

        // find max y
        const MAX_Y3 = d3.max(mdata, (d) => { return parseInt(d.count); })
        // scale y
        const Y_SCALE3 = d3.scaleLinear()
            .domain([0, MAX_Y3])
            .range([VIS_HEIGHT, 0]);

        //mouseover interactivity, draws border and shows the selected points in the bar in the corresponding scatter
        let mouseover = function(event, d) {
            if (flip){
                flip = false
                let bar = document.getElementById(d.score);
                bar.style.stroke = 'black';
                bar.style.strokeWidth = '2';
                for (let i = 0; i < esd.length; i++){
                    let sel = document.getElementById(`dp${esd[i]['Serial No.']}`)
                    if(parseFloat(d.score)-.012<=parseFloat(esd[i]['Chance of Admit']) && parseFloat(esd[i]['Chance of Admit'])<=parseFloat(d.score)+.012){
                        sel.style.opacity = '1';
                        //sel.style.fill = 'red';
                    }else{
                        sel.style.opacity = '.03';
                    }
                }
            }
        }

        //reset plots upon cursor leaving
        let mouseleave = function() {
            if(!flip){
                flip = true
                for(let key in clms){
                    let bar = document.getElementById(key);
                    bar.style.strokeWidth = '0';
                }
                for (let i = 0; i < esd.length; i++){
                    let sel = document.getElementById(`dp${esd[i]['Serial No.']}`)
                    sel.style.opacity = '.5';
                    sel.style.fill = color(esd[i][['Chance of Admit']])
                }
            }
        }

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
    });
}

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
        const MAX_Y1 = d3.max(data, (d) => { return parseFloat(d[s2]); })
        const MIN_Y1 = d3.min(data, (d) => { return parseFloat(d[s2]); })

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
            .style("padding", "2px")

        //mouse interactivity functions -- create tooltips.
        let mouseover = function(d) {
            Tooltip
                .style("opacity", 1)
        }
        
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
                .style("top", (d3.pointer(event)[1]+315) + "px")
        }

        // hide tooltip on exit
        let mouseleave = function(d) {
            Tooltip
                .style("opacity", 0)
        }

        // plot all points
        FRAME2.selectAll("points")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => { return (X_SCALE1(d[s1]) + MARGINS.left); })
            .attr("cy", (d) => { return (Y_SCALE1(d[s2]) + MARGINS.left); })
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

    });
}

// create graphs
build_bar_plot();
build_scatter_plot(false);
