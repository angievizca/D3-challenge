// @TODO: YOUR CODE HERE!
var svgWidth = 900;
var svgHeight = 600;

var margin = {
  top: 40,
  right: 60,
  bottom: 100,
  left: 100
};

var height = svgHeight - margin.top - margin.bottom;
var width = svgWidth - margin.left - margin.right;

  var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  
  function xScale(Data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(Data, d => d[chosenXAxis]) * 0.8,
        d3.max(Data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;

  }

  function yScale(Data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(Data, d => d[chosenYAxis]) * 0.7,
        d3.max(Data, d => d[chosenYAxis]) * 1.3
      ])
      .range([height, 0]);
  
    return yLinearScale;
  }

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

  function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
  }

  function renderCirclesTextGroup(circlesTextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesTextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
    
      return circlesTextGroup;
  }

  function updateToolTip(chosenXAxis, chosenYaxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var xLabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
      var xLabel = "Age:";
    }
    else {
        var xLabel = "Income: $ ";
    }
    if (chosenYAxis === "healthcare") {
        var yLabel = "Healthcare:";
    }
    else if (chosenYaxis === "smokes"){
        var yLabel = "Smokers: "
    }
    else{
        var yLabel = "Obesity: "
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}% <br>${yLabel} ${d[chosenYAxis]}%`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup
    // .on("mouseover", function(data) {
      // toolTip.show(data);
      .on("mouseover", function(data) {
        toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      }); 
    return circlesGroup;
  }
  
  d3.csv("assets/data/data.csv").then(function(newsData, err) {
    if (err) throw err;
  
    // parse data
    newsData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });
  
    // LinearScale function above csv import
    var xLinearScale = xScale(newsData, chosenXAxis);
    var yLinearScale = yScale(newsData, chosenYAxis);
  
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
      .data(newsData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", "10")
      .classed("stateCircle", true);

    var circlesTextGroup = chartGroup.append("text").classed("stateText", true)
    .selectAll("tspan")
    .data(newsData)
    .enter()
    .append("tspan")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .style("font-size", "8px")
    .text(d => d.abbr)
    .style("font-weight", "bold");

  
    // Create group for  3 x- axis labels and 3 y-axis labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + margin.top})`);
    var ylabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(0, 0)`);
  
    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty");
  
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") 
      .classed("inactive", true)
      .text("Age (Median)");
    
    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") 
      .classed("inactive", true)
      .text("Household Income (Median)");

    var healthLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "healthcare")
      .classed("aText", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "smokes")
      .classed("aText", true)
      .classed("inactive", true)
      .text("Smokers (%)");

    // append y axis
    var obesityLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "obesity")
      .classed("aText", true)
      .classed("inactive", true)
      .text("Obesity (%)");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates scales for new data
          xLinearScale = xScale(newsData, chosenXAxis);
    
  
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
     
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          circlesTextGroup = renderCirclesTextGroup(circlesTextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

      ylabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
  
          // replaces chosenYAxis with value
          chosenYAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates scales for new data
          yLinearScale = yScale(newsData, chosenYAxis);
  
          // updates y axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          circlesTextGroup = renderCirclesTextGroup(circlesTextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
          if (chosenYAxis === "healthcare") {
            healthLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            healthLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  }).catch(function(error) {
    console.log(error);
  });
  