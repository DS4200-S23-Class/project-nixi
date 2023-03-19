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
            .attr("opacity", 0.5);

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
    d3.csv("graddata/Admission_Predict_Ver1.1.csv").then((data) => {
        console.log(data)
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

        // scale x
        const X_SCALE1 = d3.scaleLinear()
            .domain([0, MAX_X1+0.1])
            .range([0, VIS_WIDTH]);

        // find max y
        const MAX_Y1 = d3.max(data, (d) => { return parseFloat(d[s2]); })

        // scale y
        const Y_SCALE1 = d3.scaleLinear()
            .domain([0, MAX_Y1+0.1])
            .range([VIS_HEIGHT, 0]);

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
            .style('stroke-width', 0);

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
