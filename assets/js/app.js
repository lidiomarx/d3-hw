var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, circlesText, newXScale, newYScale, chosenXaxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]) + 5)

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {



  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(d) {
    toolTip.show(d);
  })
    // onmouseout event
    .on("mouseout", function(d, i) {
      toolTip.hide(d);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function(err, data) {
  
  //console.log(data);
  if (err) {
    console.log(err);
    throw err;
  }

  // parse data
  data.forEach(function(d) {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
    d.healthcare = +d.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".7");

  var circlesText = chartGroup.selectAll(".stateText")
    .data(data)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 5)
    .text( d => d.abbr );

  // Create group for x and y labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ylabelsGroup = chartGroup.append("g")
    .attr("transform",`translate(0,${height / 2})`);
    //.attr("y", 0 - margin.left)
    //.attr("x", 0 - (height / 2))

  // create x labels
  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // create y labels
  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "-40px")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("axis-text", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "-60px")
    .attr("value", "smokes") // value to grab for event listener
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", "-80px")
    .attr("value", "obesity") // value to grab for event listener
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Obesity (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
      
    if (value == chosenXAxis) return;

    // replaces chosenXAxis with value
    chosenXAxis = value;

    // console.log(chosenXAxis)

    // functions here found above csv import
    // updates x scale for new data
    xLinearScale = xScale(data, chosenXAxis);

    // updates x axis with transition
    xAxis = renderXAxes(xLinearScale, xAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // changes classes to change bold text
    // set all xlabels to inactive
    [povertyLabel, ageLabel, incomeLabel].forEach(
        (label) => label
        .classed("inactive", true)
        .classed("active", false)
    );
    
    // set chosen label to active
    switch (chosenXAxis) {
        case "poverty":
            povertyLabel.classed("active", true);
            povertyLabel.classed("inactive", false);
            break;
        case "age":
            ageLabel.classed("active", true);
            ageLabel.classed("inactive", false);
            break;
        case "income":
            incomeLabel.classed("active", true);
            incomeLabel.classed("inactive", false);
            break;
    }
  });

    // x axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
      
    if (value == chosenYAxis) return;

    // replaces chosenXAxis with value
    chosenYAxis = value;

    // console.log(chosenXAxis)

    // functions here found above csv import
    // updates x scale for new data
    yLinearScale = yScale(data, chosenYAxis);

    // updates x axis with transition
    yAxis = renderYAxes(yLinearScale, yAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // changes classes to change bold text
    // set all xlabels to inactive
    [obesityLabel, smokesLabel, healthcareLabel].forEach(
        (label) => label
        .classed("inactive",true)
        .classed("active",false)
    );
    
    // set chosen label to active
    switch (chosenYAxis) {
        case "obesity":
            obesityLabel.classed("active", true);
            obesityLabel.classed("inactive", false);
            break;
        case "smokes":
            smokesLabel.classed("active", true);
            smokesLabel.classed("inactive", false);
            break;
        case "healthcare":
            healthcareLabel.classed("active", true);
            healthcareLabel.classed("inactive", false);
            break;
    }
  });
});
