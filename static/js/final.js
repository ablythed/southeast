//notes: I based my MDS dragging and linking behavior on Mike Bostock's example here: https://observablehq.com/@d3/modifying-a-force-directed-graph as well as this tutorial: https://www.pluralsight.com/guides/creating-force-layout-graphs-in-d3
//I based my brushing behavior on Yan Holtz's d3 graph gallery page: https://www.d3-graph-gallery.com/graph/interactivity_brush.html
//I based my Marimekko chart on Mike Bostock's example here: https://observablehq.com/@d3/marimekko-chart
var decimals = [0,0,0,0, 0, 0, 2, 3, 2, 0, 3, 1, 1]
var states = []
var categories = []
var industries = []
var labs = ['State','Industry','Size','LitAvg','NumAvg','Pop', 'Education', 'Pov', 'NoIns','MedIncome','Unemployment','VCR','JPR']
var labsCat = ['State','Industry','Size']
var labs2 = ['State','Industry','Size','LitAvg','NumAvg','Pop', 'Education', 'Pov', 'NoIns','MedIncome','Unemployment','VCR','JPR']
var cat = "State"
var catY = "Industry"
var fixedColor;
var current = 'LitAvg'
var ycurrent = 'Education'
var mycurr = 'Industry'
var mxcurr = 'State'

drawMapLabel();
createMap('LitAvg',[]);
drawBar('LitAvg',[]);
drawScatter('LitAvg','Education', []);
drawScatterLabel();
drawScatterLabelY();
drawBarLabel();
mdsbNone()
marimekko(['State','Industry'])
drawmmLabelX();
drawmmLabelY();

document.getElementById("expl").onclick = function(){
  var modal = document.getElementById("explModal")
  modal.style.display = "block"
  document.getElementsByClassName("close")[3].onclick = function(){
    modal.style.display="none"
  }
  window.onclick = function(event) {
    if(event.target==modal)
    modal.style.display="none"
  }
}
document.getElementsByClassName("collapse")[0].onclick = function(){
  var b = document.getElementById("explText")
  if (b.style.display == "block") {
    b.style.display = "none";
    this.style.bottom= "1.5%"
    this.textContent = "+"
  }
  else {
    b.style.display = "block"
    this.style.bottom= "4.8%"
    this.textContent = "−"
  }
}

function mdsbNone(){  $.ajax({
    type: 'POST',
    url:'/mdsB',
    data: JSON.stringify([["none",""],["none",""]]),
    dataType: "json",
    success: function(response){
      drawMDSB(response)
    },
    error: function(error){
      console.log(error);
    }

});}
function mdsbState(){  $.ajax({
  type: 'POST',
  url:'/mdsB',
  data: JSON.stringify([[states[0],cat],["none",""]]),
  dataType: "json",
  success: function(response){
    drawMDSB(response)
  },
  error: function(error){
    console.log(error);
  }

});}

function mdsbIndustry(){  $.ajax({
  type: 'POST',
  url:'/mdsB',
  data: JSON.stringify([["none",""],[industries[0],catY]]),
  dataType: "json",
  success: function(response){
    drawMDSB(response)
  },
  error: function(error){
    console.log(error);
  }

});}
function mdsbBoth(){  $.ajax({
    type: 'POST',
    url:'/mdsB',
    data: JSON.stringify([[states[0],cat],[industries[0],catY]]),
    dataType: "json",
    success: function(response){
      drawMDSB(response)
    },
    error: function(error){
      console.log(error);
    }

});}
function mdsbCounties(a){  $.ajax({
      type: 'POST',
      url:'/mdsBCounties',
      data: JSON.stringify(a),
      dataType: "json",
      success: function(response){
        drawMDSB(response)
      },
      error: function(error){
        console.log(error);
      }

  });}

function marimekko(a) {
  $.ajax({
      type: 'POST',
      url:'/marimekko',
      data: JSON.stringify(a),
      dataType: "json",
      success: function(response){
        drawmm(response)
      },
      error: function(error){
        console.log(error);
      }

  });
}
function marimekkoBounds(a) {
  $.ajax({
      type: 'POST',
      url:'/marimekkoBounds',
      data: JSON.stringify(a),
      dataType: "json",
      success: function(response){
        drawmm(response)
      },
      error: function(error){
        console.log(error);
      }

  });
}


function createMap(v,arr) {

  current=v
  var svg = d3.select("#geoj"),
      w = +svg.attr("width"),
      h = +svg.attr("height");
  var codes = new Map();
  var s = new Map();
  var ttrying = new Map();
  var counties = new Map();
  var projection = d3.geoEquirectangular().center([-68, 30 ])
    .scale(1400)
    .rotate([0,0]);
  var path = d3.geoPath()
    .projection(projection);
  var g = svg.append("g")
      .attr("class", "key")
      .attr("transform", "translate(0,40)");
  var promises
  if (v != 'State' && v!= 'Industry' && v!='Size') {
    promises = [
      d3.json("static/js/personal2.json"),
      d3.csv("static/js/southeast2.csv", function(d) {counties.set(d.GEO_ID, d.County + ", " + d.State); codes.set(d.GEO_ID, +d[v]); ttrying.set(d.GEO_ID,d[catY].split(" ").join("")); s.set(d.GEO_ID,d[cat].split(" ").join("")); })
    ]
  }
  else
  promises = [
    d3.json("static/js/personal2.json"),
    d3.csv("static/js/southeast2.csv", function(d) { counties.set(d.GEO_ID, d.County + ", " + d.State); codes.set(d.GEO_ID, d[v]);s.set(d.GEO_ID,d[cat].split(" ").join("")); ttrying.set(d.GEO_ID,d[catY].split(" ").join(""));})
  ]
  Promise.all(promises).then(ready)

  function ready([us]) {
    var ext = Array.from(codes.values());
    if (v!='State' && v!= 'Industry' && v!= 'Size') {
      if (v != 'JPR' && v != 'Pop') {
        if (arr.length > 0) {
          var color = d3.scaleSequential(d3.interpolateGnBu)
           .domain(d3.extent(arr))
         }
        else
          var color = d3.scaleSequential(d3.interpolateGnBu).domain(d3.extent(ext))
        }
      else {
        if (arr.length > 0) {
          var minimum = d3.min(arr);
          if (minimum==0)
            minimum = minimum + d3.min(ext)
          var maximum = d3.max(arr);
          var color = d3.scaleSequentialLog(d3.interpolateGnBu)
           .domain([minimum,maximum])
         }
        else
          var color = d3.scaleSequentialLog(d3.interpolateGnBu).domain(d3.extent(ext))
      }
    }
     else {
       var color = d3.scaleOrdinal(d3.schemeTableau10).domain(ext)
     }

    var tt = d3.select("#mapappTT")
      .append("div")
      .style("opacity", "0")
      .style("position", "absolute")
      .style("z-index", "100")
      .attr("class", "tooltip")
      .style("padding","10px")
      .style("padding-bottom","10px")
      .style("background-color", "#f1f1f1")

    var mouseover = function(event,d) {
        tt
          .style("opacity", 1);
        d3.select(this)
          .style("fill", "#990000");
        tt.data(topojson.feature(us, us.objects.personal2).features)
        .html(counties.get(d.properties.GEO_ID))
        .style("left", (d3.pointer(event)[0]) + "px")
        .style("top", (d3.pointer(event)[1] -40) + "px")
        .style("padding","10px")
        .style("padding-bottom","10px")
      }
    var mouseleave = function(d) {
      tt.style("opacity", 0);
    }

    svg.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.personal2).features)
      .enter()
      .append("path")
        .attr("d", path)
        .attr("class","county")
        .style("fill", function(d) {
        if (arr.length > 0) {
          if (v!='State' && v!= 'Industry' && v!='Size') {
            var minimum = parseFloat(d3.min(arr));
            if (minimum==0)
              minimum = minimum + parseFloat(d3.min(ext))
            var maximum = parseFloat(d3.max(arr));
            if (states.length == 0) {
              if (industries.length ==0) {
                if (minimum>((d[v] = codes.get(d.properties.GEO_ID))))
                  return "grey"
                else if (maximum < ((d[v] = codes.get(d.properties.GEO_ID))))
                  return "grey"
                else
                  return (color(d[v] = codes.get(d.properties.GEO_ID)));
              }
            else {
              if (minimum>((d[v] = codes.get(d.properties.GEO_ID)))||maximum < ((d[v] = codes.get(d.properties.GEO_ID)))|| industries.includes(ttrying.get(d.properties.GEO_ID)) == false)
                return "grey"
              else
                return (color(d[v] = codes.get(d.properties.GEO_ID)));
              }
            }
        if (states.length > 0) {
          if (industries.length == 0) {
            if (states.includes(s.get(d.properties.GEO_ID)) == false||minimum>((d[v] = codes.get(d.properties.GEO_ID)))||maximum<((d[v] = codes.get(d.properties.GEO_ID))))
              return "grey"
            else
              return (color(d[v] = codes.get(d.properties.GEO_ID)));
            }
        else {
          if (states.includes(s.get(d.properties.GEO_ID)) == false || industries.includes(ttrying.get(d.properties.GEO_ID)) == false||minimum>((d[v] = codes.get(d.properties.GEO_ID)))||maximum<((d[v] = codes.get(d.properties.GEO_ID))))
            return "grey"
        else
          return (color(d[v] = codes.get(d.properties.GEO_ID)));
        }
      }
    }
    else {
      if (states.length == 0) {
        if (industries.length ==0) {
          if (arr.includes((d[v] = codes.get(d.properties.GEO_ID)))==false)
            return "grey"
          else
            return (color(d[v] = codes.get(d.properties.GEO_ID)));
        }
      else {
        if (arr.includes((d[v] = codes.get(d.properties.GEO_ID)))==false||industries.includes(ttrying.get(d.properties.GEO_ID)) == false)
          return "grey"
        else
          return (color(d[v] = codes.get(d.properties.GEO_ID)));
        }
      }
  if (states.length > 0) {
    if (industries.length == 0) {
      if (states.includes(s.get(d.properties.GEO_ID)) == false||arr.includes((d[v] = codes.get(d.properties.GEO_ID)))==false)
        return "grey"
      else
        return (color(d[v] = codes.get(d.properties.GEO_ID)));
      }
  else {
    if (states.includes(s.get(d.properties.GEO_ID)) == false || industries.includes(ttrying.get(d.properties.GEO_ID)) == false||arr.includes((d[v] = codes.get(d.properties.GEO_ID)))==false)
      return "grey"
  else
    return (color(d[v] = codes.get(d.properties.GEO_ID)));
  }
}
    }
  }
    else {
      if (states.length == 0) {
        if (industries.length == 0) {
          return (color(d[v] = codes.get(d.properties.GEO_ID)));
        }
        else {
          if (industries.includes(ttrying.get(d.properties.GEO_ID))==false)
            return "grey"
          else {
            return (color(d[v] = codes.get(d.properties.GEO_ID)))
          }
        }
      }
      else {
        if (states.length > 0) {
          if (industries.length == 0) {
            if (states.includes(s.get(d.properties.GEO_ID))==false)
              return "grey"
            else {
              return (color(d[v] = codes.get(d.properties.GEO_ID)))
            }
          }
          else {
            if (states.includes(s.get(d.properties.GEO_ID))==false || industries.includes(ttrying.get(d.properties.GEO_ID))==false)
              return "grey"
            else {
              return (color(d[v] = codes.get(d.properties.GEO_ID)))
            }
          }
        }
      }
    }
  }
      )

        .on("mouseover", mouseover)
        .on("mouseout", function(d) {
          tt.style("opacity","0")
          d3.select(this).style("fill", function(d) {
        if (arr.length > 0) {
          if (v!='State' && v!= 'Industry' && v!='Size') {
            var minimum = parseFloat(d3.min(arr));
            if (minimum==0)
              minimum = minimum + parseFloat(d3.min(ext))
            var maximum = parseFloat(d3.max(arr));
            if (states.length == 0) {
              if (industries.length ==0) {
                if (minimum>((d[v] = codes.get(d.properties.GEO_ID))))
                  return "grey"
                else if (maximum < ((d[v] = codes.get(d.properties.GEO_ID))))
                  return "grey"
                else
                  return (color(d[v] = codes.get(d.properties.GEO_ID)));
              }
            else {
              if (minimum>((d[v] = codes.get(d.properties.GEO_ID)))||maximum < ((d[v] = codes.get(d.properties.GEO_ID)))|| industries.includes(ttrying.get(d.properties.GEO_ID)) == false)
                return "grey"
              else
                return (color(d[v] = codes.get(d.properties.GEO_ID)));
              }
            }
        if (states.length > 0) {
          if (industries.length == 0) {
            if (states.includes(s.get(d.properties.GEO_ID)) == false||minimum>((d[v] = codes.get(d.properties.GEO_ID)))||maximum<((d[v] = codes.get(d.properties.GEO_ID))))
              return "grey"
            else
              return (color(d[v] = codes.get(d.properties.GEO_ID)));
            }
        else {
          if (states.includes(s.get(d.properties.GEO_ID)) == false || industries.includes(ttrying.get(d.properties.GEO_ID)) == false||minimum>((d[v] = codes.get(d.properties.GEO_ID)))||maximum<((d[v] = codes.get(d.properties.GEO_ID))))
            return "grey"
        else
          return (color(d[v] = codes.get(d.properties.GEO_ID)));
        }
      }
    }
    else {
      if (states.length == 0) {
        if (industries.length ==0) {
          if (arr.includes((d[v] = codes.get(d.properties.GEO_ID)))==false)
            return "grey"
          else
            return (color(d[v] = codes.get(d.properties.GEO_ID)));
        }
      else {
        if (arr.includes((d[v] = codes.get(d.properties.GEO_ID)))==false||industries.includes(ttrying.get(d.properties.GEO_ID)) == false)
          return "grey"
        else
          return (color(d[v] = codes.get(d.properties.GEO_ID)));
        }
      }
  if (states.length > 0) {
    if (industries.length == 0) {
      if (states.includes(s.get(d.properties.GEO_ID)) == false||arr.includes((d[v] = codes.get(d.properties.GEO_ID)))==false)
        return "grey"
      else
        return (color(d[v] = codes.get(d.properties.GEO_ID)));
      }
  else {
    if (states.includes(s.get(d.properties.GEO_ID)) == false || industries.includes(ttrying.get(d.properties.GEO_ID)) == false||arr.includes((d[v] = codes.get(d.properties.GEO_ID)))==false)
      return "grey"
  else
    return (color(d[v] = codes.get(d.properties.GEO_ID)));
  }
}
    }
  }
    else {
      if (states.length == 0) {
        if (industries.length == 0) {
          return (color(d[v] = codes.get(d.properties.GEO_ID)));
        }
        else {
          if (industries.includes(ttrying.get(d.properties.GEO_ID))==false)
            return "grey"
          else {
            return (color(d[v] = codes.get(d.properties.GEO_ID)))
          }
        }
      }
      else {
        if (states.length > 0) {
          if (industries.length == 0) {
            if (states.includes(s.get(d.properties.GEO_ID))==false)
              return "grey"
            else {
              return (color(d[v] = codes.get(d.properties.GEO_ID)))
            }
          }
          else {
            if (states.includes(s.get(d.properties.GEO_ID))==false || industries.includes(ttrying.get(d.properties.GEO_ID))==false)
              return "grey"
            else {
              return (color(d[v] = codes.get(d.properties.GEO_ID)))
            }
          }
        }
      }
    }
  }
      )})

  svg.append("g")
    .attr("class", "legendSequential")
    .attr("transform", "translate("+w/1.3+",50)");
  if (v!='State' && v!= 'Industry' && v!='Size') {
    svg.selectAll(".legendOrdinal").remove()
  if (arr.length > 0) {
    var minimum = parseFloat(d3.min(arr));
    if (minimum==0)
      minimum = minimum + parseFloat(d3.min(ext))
    var maximum = parseFloat(d3.max(arr));
  }
  else {
  var minimum = parseFloat(d3.min(ext));
  var maximum = parseFloat(d3.max(ext));
  }
  var dec = 0;
  for (var t = 0; t < labs.length; t++) {
    if (labs[t] == v)
      dec = decimals[t];
  }
  var a = []
  if (v!='JPR' && v!= 'Pop') {
  for (var i = 0; i < 99; i++) {
    if (i%20 == 0) {
      var u = (minimum + i*(maximum - minimum)/100)
      a.push(parseFloat(u).toFixed(dec));
    }
    else {
      a.push("")
    }
  }
  a.push(parseFloat(maximum).toFixed(dec))
  }
  else {
    for (var i = 0; i < 99; i++) {
      if (i % 20 == 0) {
        var u = Math.pow(10,(Math.log10(minimum) + i*(Math.log10(maximum) - Math.log10(minimum))/100))
        a.push(u.toFixed(dec));
      }
      else {
        a.push("")
      }
    }
    a.push(maximum.toFixed(dec))

  }

var ss = d3.scaleSequential(d3.interpolateGnBu)
  .domain([0,1]);

var legendSequential = d3.legendColor()
    .shapeHeight(3)
    .cells(100)
    .scale(ss)
    .labels(a)
    .shapePadding(0)

svg.select(".legendSequential")
  .call(legendSequential)
  }

  else {
    var ordinal = d3.scaleOrdinal(d3.schemeTableau10).domain(ext)
svg.selectAll(".legendOrdinal").remove()
svg.selectAll(".legendSequential").remove()
svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate("+w/1.3+",50)");

var legendOrdinal = d3.legendColor()
  .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
  .shapePadding(10)
  .scale(ordinal);

svg.select(".legendOrdinal")
  .call(legendOrdinal);
  }
}
}


function drawMapLabel() {
  var d = d3.select("#dd").select("select").remove();

  var ddb = d3.select("#dd").append("select").style("margin-left","60px").style("margin-top","3px").attr("class","b")
  ddb
    .selectAll("myOptions")
    .data(labs)
    .enter()
    .append('option')
    .text(function(d){return d})
    .attr("value",function(d){return d})
    .property("selected", function(d){
         return d === current;
    })

  ddb.on("change",function(d) {
    var selectedOption=d3.select(this).property("value")
    current = selectedOption
    drawBar(selectedOption,[])
    drawBarLabel()
    current = selectedOption
    drawScatter(selectedOption,ycurrent,[])
    drawScatterLabel()
    createMap(selectedOption,[])
    mdsbNone()
  })
}


function drawBar(v, arr) {
  var w = 410;
  var h = 300;
  current  =v;
  mdsbNone();

  var canv = d3.select("#bar")

  canv.selectAll(".ylabel")
  .transition()
  .duration(100)
  .remove();

    canv.selectAll("rect")
    .transition()
    .duration(1000)
    .attr("height",0)
    .remove();


  //get rid of old x-axis
  canv.selectAll(".x-axis")
  .transition()
  .duration(100)
  .remove();

  //get rid of old y-axis
  canv.selectAll(".y-axis")
    .transition()
    .duration(100)
    .remove();


var svg = canv
    .append("svg")
      .attr("width", 440)
      .attr("height", 350)
      // .style("margin-left","0px")
    .append("g")

d3.csv("static/js/southeast2.csv",function(d) {
  if (v!="Size" && v!="Industry"&&v!="State")
    d[v] = +d[v];

    return d;
}).then(function(data) {
  var data2 = [];
  var data3 = [];
  current=v;
  drawBarLabel();

if (states.length > 0)
  data =  data.filter(function(d){ return states.includes(d[cat].split(" ").join("")) })
if (industries.length > 0)
data =  data.filter(function(d){ return industries.includes(d[catY].split(" ").join("")) })
var values = d3.map(data, (d,i) => ({County: d.County, value: d[v], index: i}))

if (v!="Size" && v!="Industry"&&v!="State") {
    var x = d3.scaleLinear()
      .domain([0, d3.max(data, function(d){return d[v]})*1.1])
      .range([10, w-30]);
    }

if (v!="Size" && v!="Industry"&&v!="State") {
  svg.append("g")
      .attr("transform", "translate(40," + h + ")")
      .call(d3.axisBottom(x))
      .attr("class","x-axis");
          var histogram = d3.histogram()
              .value(function(d) { return d[v]; })
              .domain(x.domain())
              .thresholds(x.ticks(30));

          var bins = histogram(data);

          var y = d3.scaleLinear()
              .range([h, 0]);
          y.domain([0, d3.max(bins, function(d) { return d.length; })*1.1])
          svg.append("g")
          .attr("transform", "translate(50,0)")
          .call(d3.axisLeft(y))
          .attr("class","y-axis");

          var min = d3.min(data,function(d){return d[v]})
    var rects = svg.selectAll("rect")
              .data(bins)
              .enter()
              .append("rect")
                .attr("x", 1)
                .attr("transform", function(d) { return "translate(" + (40+x(d.x0)) + "," + y(d.length) + ")"; })
                .attr("width", function(d) { return x(d.x1) - x(d.x0) - 0.05*(x(d.x1)-x(d.x0)) ; })
                .transition()
                .duration(1000)
                .attr("height", function(d) { return h - y(d.length); })
                .style("fill", function(d){
                  if (arr.length == 0)
                    return "#8dd3c7"

                  else if (d.x1 <= d3.max(arr)+(d.x1-d.x0) && d.x0 >= d3.min(arr)-(d.x1-d.x0))
                      return "#8dd3c7"
                  else
                    return "grey"
                })
                svg
                    .call( d3.brushX()
                      .extent( [ [51,0], [w+40,h] ] )
                      .on("end", updateChart)
                    )

}
else {
  var x = d3.scaleBand()
    .range([ 10, w ])
    .domain(data.map(function(d) { return String(d[v]); }))
    .padding(0.5);
    svg.append("g")
        .attr("transform", "translate(40," + h + ")")
        .call(d3.axisBottom(x))
        .attr("class","x-axis");
    var catFreq = [];
    //count occurrence of each category
    data.forEach(function(d) {
        var el = d[v];
        if(catFreq[el] === undefined) {
            catFreq[el] = 1;
        } else {
            catFreq[el] = catFreq[el] + 1;
        }
    });
    data.forEach(function(d) {
    var el = d[v];
    d.count = catFreq[el];
});
var y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count)]).nice()
      .range([h, 10])
  svg.append("g")
  .attr("transform", "translate(50,0)")
  .call(d3.axisLeft(y))
  .attr("class","y-axis");

  var rects = svg.selectAll(".cat")
  .data(data)
  .enter()
  .append("g")
  .attr("class", "cat")
  .append("rect")
    .attr("fill", function(d) {
      if (arr.length ==0)
        return "#8dd3c7"
      else {
        if (arr.includes(d[v]))
          return "#8dd3c7"
        else {
          return "grey"
        }
      }
    })
    .attr("width", x.bandwidth())
    .attr("x", (function(d) { return x(d[v])+40; }))
    .attr("y", (function(d) { return y(d.count); }))
    .transition().duration(500)
    .attr("height", function(d) { return h - y(d.count); })
    svg
        .call( d3.brushX()
          .extent( [ [0,0], [w+40,h] ] )
          .on("end", updateChart)
        )

}
var yLabel = svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -h/2)
  .attr("y", "15px")
  .attr("stroke","black")
  .style("text-anchor", "middle")
  .attr("class","ylabel")
  .attr("font-size", "14px")
  .text("Frequency");
          function updateChart(event) {
          var extent = event.selection
          if (extent != null && extent.length != 0) {

            var m = Math.max(d3.min(data,function(d){return d[v]}),extent[0])
            var n = Math.min(d3.max(data,function(d){return d[v]}),extent[1])
            var a = []
            var reM = []
            if (v!="State"&& v!="Industry" && v!="Size") {
            svg.selectAll("rect").data(bins).transition().duration(200).style("fill", function(d,i){

               if ( isBrushed(extent, x(d.x1)+40)==false) {
                  return "grey";
                }

               else {
                 if (d.x0 < d3.max(data,function(e){return e[v]}) && d.x1 > d3.min(data,function(e){return e[v]})) {
                    a.push(d.x0)
                    a.push(d.x1)
                    let index = 0;
                    while (index < values.length) {
                      if (values[index]["value"] <= d.x1 && values[index]["value"] >= d.x0)
                        reM.push(values[index]["County"])
                      index = index + 1
                    }

                  }
                 return "#8dd3c7"
                }
               }
             )
              categories = []

            }

            else {
              svg.selectAll("rect").data(data).transition().duration(200).style("fill", function(d,i){
                 if ( isBrushed(extent, x(d[v])+40)==false) {
                    return "grey";
                  }


                 else {

                      a.push((d[v]))
                   return "#8dd3c7"
                  }
                 }
                )
                if (v=="State"||v=="Industry" || v=="Size") {
                  if(mycurr == v) {
                 categories = [... new Set(a)]
                 marimekko([mxcurr,v])
                }
              }
                else {
                 categories = []
                }
            }


               createMap(v,a)
               drawScatter(v, ycurrent, a)

               if (v!="State"&& v!="Industry" && v!="Size") {
                 marimekkoBounds([cat,catY,reM])
                mdsbCounties(reM)
              }

             }
             if (extent == null) {
               if (v!="State"&& v!="Industry" && v!="Size") {
             svg.selectAll("rect").data(bins).transition().duration(200).style("fill","#8dd3c7")
           }
           else {
             svg.selectAll("rect").data(data).transition().duration(200).style("fill","#8dd3c7")

           }
           categories = []
             drawScatter(v, ycurrent, [])
             createMap(v, [])
             marimekko([cat,catY])
             mdsbNone()
           }

            }


           function isBrushed(brush_coords, coord) {
               var x0 = brush_coords[0],
                   x1 = brush_coords[1];
              return x0 <= coord && coord <= x1;
          }


})
}



function drawBarLabel() {
  var d = d3.select("#barX").select("select").remove();

var ddb= d3.select("#barX").append("select").style("margin-left","150px").attr("class","b")
  ddb
    .selectAll("myOptions")
    .data(labs)
    .enter()
    .append('option')
    .text(function(d){return d})
    .property("selected", function(d){
         return d === current;
    })
    .attr("value",function(d){return d})
  var c = d3.select("#barXtext").select("text").remove();
  d3.select("#barXtext").append("text").style("position","absolute").style("left","680px").style("top","360px").text(current)
  ddb.on("change",function(d) {
    var selectedOption=d3.select(this).property("value")
    drawBar(selectedOption,[])
    current = selectedOption
    drawScatter(selectedOption,ycurrent,[])
    drawScatterLabel()
    createMap(selectedOption, [])
    drawMapLabel()
  })



}

function drawScatter(u,v, arr) {
  current = u;
  ycurrent = v;
  drawScatterLabel();
  drawScatterLabelY();
  var w = 410;
  var h = 300;
  var canv = d3.select("#scatter")
  canv.selectAll(".ylabel")
  .transition()
  .duration(100)
  .remove();

    canv.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("r","0")
    .remove();


  //get rid of old x-axis
  canv.selectAll(".x-axis")
  .transition()
  .duration(100)
  .remove();

  //get rid of old y-axis
  canv.selectAll(".y-axis")
    .transition()
    .duration(100)
    .remove();


var svg = canv
    .append("svg")
      .attr("width", 460)
      .attr("height", 400)
      .style("margin-left","0px")
    .append("g")

d3.csv("static/js/southeast2.csv",function(d) {
  if(u!="State" && u!="Industry"&&u!="Size"&& v!="State" && v!="Industry"&&v!="Size") {
    d[v] = +d[v];
    d[u] = +d[u]
  }
    return d;
}).then(function(data) {
  if (states.length > 0)
  data =  data.filter(function(d){ return states.includes(d[cat].split(" ").join("")) })
  if (industries.length > 0)
  data =  data.filter(function(d){ return industries.includes(d[catY].split(" ").join("")) })

  if (u!="State" && u!="Industry"&&u!="Size") {
    var x = d3.scaleLinear()
      .domain([0, d3.max(data, function(d){return d[u]})*1.1])
      .range([0, w]);
    }
    else {

        var x = d3.scaleBand()
          .domain(data.map(function(d) { return d[u]; }))
          .range([0, w]);

    }
  svg.append("g")
      .attr("transform", "translate(40," + h + ")")
      .call(d3.axisBottom(x))
      .attr("class","x-axis");

      if (v!="State" && v!="Industry"&&v!="Size") {
            var y = d3.scaleLinear()
                .range([h, 3]);
                y.domain([0, d3.max(data, function(d) { return d[v]; })*1.1]);
                svg.append("g")
                .attr("transform", "translate(40,0)")
                .call(d3.axisLeft(y))
                .attr("class","y-axis")

              }

      else {
                var y = d3.scaleBand()
                .range([h, 0]);




        y.domain(data.map(function(d){return d[v]}));
        var yaxis = svg.append("g")
        .attr("transform", "translate(40,0)")
        .call(d3.axisLeft(y)
        .tickFormat(function(d) {
          let l = d.length
          if (l > 6) {
                    let i = 0;
                    if (13*l > 50) {
                      while ((i+2)*l < 50)
                      i++;
                      // if (i > 0)
                      return d.substring(0,i).concat("...")
                      // else
                      // return ""
                    }
                  }
                    else {
                      return d
                    }
                  })
      )
        .attr("class","y-axis")

        yaxis.selectAll("text").attr("transform", "rotate(-90)").attr("y", "-20px").attr("x", "1.25px").style("text-anchor","middle")


}

          svg
              .call( d3.brushX()
                .extent( [ [40,0], [w+40,h] ] )
                .on("end", updateChart)
              )
              var circles = svg.selectAll(".county")
                .data(data);
              var tt = d3.select("#appTT")
                .append("div")
                .style("opacity", "0")
                .style("position", "absolute")
                .style("z-index", "100")
                .attr("class", "tooltip")
                .style("padding","10px")
                .style("padding-bottom","10px")
                .style("background-color", "#f1f1f1")

              var mouseover = function(event,d) {
                  tt
                    .style("opacity", 1)

                  d3.select(this)
                    .attr("r", "4")
                    .style("fill", "#990000");
                  tt
                  .html(d.County + ", " + d.State)
                  .style("left", (d3.pointer(event)[0]+920) + "px")
                  .style("top", (d3.pointer(event)[1]-35) + "px")
                  .style("padding","10px")
                  .style("padding-bottom","10px")
                }
              var mouseleave = function(d) {
                tt
                  .style("opacity", 0);
                d3.select(this)
                  .style("stroke", "none")
                  .style("opacity", 1)
                  .attr("r", "1.5")
                  .style("fill", function(d){
                    if (arr.length!=0) {
                      if (typeof arr[0] != "string") {
                      if ((d[u]) < d3.max(arr) && (d[u]) > d3.min(arr))
                        return "#8dd3c7";
                      else {
                        return "grey"
                      }
                    }
                    else {
                      if (arr.includes((d[u])))
                        return "#8dd3c7";
                      else {
                        return "grey"
                    }
                    }
                  }
                    else {
                      return "#8dd3c7"
                    }
                  });
              }
      circles
              .enter()
              .append("circle")
              .attr("class","county")
              .attr("pointer-events", "all")
              .attr("transform", "translate(40,0)")
              .attr("r", 1.5)
              .attr("fill", function(d){
                if (arr.length!=0) {
                  if (typeof arr[0] != "string") {
                  if ((d[u]) < d3.max(arr) && (d[u]) > d3.min(arr))
                    return "#8dd3c7";
                  else {
                    return "grey"
                  }
                }
                else {
                  if (arr.includes((d[u])))
                    return "#8dd3c7";
                  else {
                    return "grey"
                }
                }
              }
                else {
                  return "#8dd3c7"
                }
              })
                .on("mouseover", mouseover)
                .on("mouseout", mouseleave)
                .merge(circles)
                .attr("cx", function (d) {
                  if (u=='State'||u=='Industry'||u=='Size') {
                    if (x.domain().length == 1)
                      return x(d[u]) + w/2
                    else {
                      return x(d[u])+40
                    }
                  }

                   else
                    return x(d[u]); } )
                .attr("cy", function (d) {
                  if (v=='State'||v=='Industry'||v=='Size') {
                    if (y.domain().length == 1)
                      return y(d[v]) + h/2
                    else {
                      return y(d[v])+35
                    }
                  }
                   return y(d[v]);
                 } )

                    svg.on("click",function(){svg.call(d3.brushX().clear); mdsbNone()})




        var yLabel = svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -h/2)
          .attr("y", "10px")
          .style("text-anchor", "middle")
          .attr("class","ylabel")
          .attr("font-size", "14px")
          .text(v);




          function updateChart(event) {
            svg.on("click",createMap(u,[]))
          var extent = event.selection
          if (extent != null && extent.length != 0) {
            var a = [];
            var reM = [];
            svg.selectAll("circle").data(data).transition().duration(200).style("fill", function(d,i){
              if (u!="State" && u!="Industry"&& u!="Size") {
               if ( isBrushed(extent, x(d[u])+40)==false)
                  return "grey";
               else {
                 a.push((d[u]))
                 reM.push(d.County)
                 return "#8dd3c7"
               }
             }
             else {
               if ( isBrushed([extent[0]-40,extent[1]-40], x(d[u])+40)==false)
                  return "grey";
               else {
                 a.push((d[u]))
                 return "#8dd3c7"
               }
             }
               } )
               if (u=="State"||u=="Industry" || u=="Size") {
                 if (mycurr==u) {
                categories = [... new Set(a)]
                marimekko([mxcurr,u])
              }
              }
              else {
                categories = []
              }

               current = u;
               ycurrent = v;
               drawBar(u,a)
               createMap(u,a)

               if (u!="State"&& u!="Industry" && u!="Size"){
                 marimekkoBounds([cat,catY,reM])

                mdsbCounties(reM)
              }
             }
             if (extent == null) {
               categories = []
             svg.selectAll("circle").data(data).transition().duration(200).style("fill","#8dd3c7")
             drawBar(u,[])
             marimekko([mxcurr,mycurr])
              mdsbNone()
           }
            }


            function isBrushed(brush_coords, cx) {

         var x0 = brush_coords[0],
             x1 = brush_coords[1];
        return x0 <= cx && cx <= x1;
      }
})
}


function drawScatterLabel() {
  var d = d3.select("#scatterX").select("select").remove();

var ddb = d3.select("#scatterX").append("select").style("position","absolute").style("left","1000px").style("top","70px").attr("class","b")
  ddb
    .selectAll("myOptions")
    .data(labs)
    .enter()
    .append('option')
    .text(function(d){return d})
    .attr("value",function(d){return d})
    .property("selected", function(d){
         return d === ycurrent;
    })
var c = d3.select("#scatterXtext").select("text").remove();
d3.select("#scatterXtext").append("text").style("position","absolute").style("left","1150px").style("top","350px").text(current)

  ddb.on("change",function(d) {
    var selectedOption=d3.select(this).property("value")
    drawScatter(current,selectedOption,[])
    ycurrent = selectedOption
  })

}
function drawScatterLabelY() {
    var d = d3.select("#scatterY").select("select").remove();
  var ddb = d3.select("#scatterY").append("select").attr("class","b").style("position","absolute").style("top","70px").style("left","1155px")

  ddb
    .selectAll("opts")
    .data(labs2)
    .enter()
    .append('option')
    .text(function(d){return d})
    .attr("value",function(d){return d})
    .property("selected", function(d){
         return d === current;
    })
    var c = d3.select("#scatterYtext").select("text").remove();
    d3.select("#scatterYtext").append("text").style("transform","rotate("+(-90)+"deg)").style("position","absolute").style("left","860px").style("top","150px").text(ycurrent)

  ddb.on("change",function(d) {
    var selectedOption=d3.select(this).property("value")
    drawScatter(selectedOption,ycurrent,[])
    current = selectedOption
    drawBar(selectedOption,[])
    drawBarLabel()
    createMap(selectedOption, [])
    drawMapLabel()
    mdsbNone()

  })

}



function drawMDSB(graph) {


  var svg = d3.select("#mdsB")
  var w = 400;
  var h = 300;
  svg.selectAll(".nodes").remove()
  svg.selectAll(".links").remove()
  svg.selectAll("text").remove()

  var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody(-500))
    .force("center", d3.forceCenter(w/2, h/2));

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.max(2*Math.abs(d.value),0.3); })
      .attr("stroke-opacity", function(d) { return Math.max(2*Math.abs(d.value),0.3); })
      .attr("stroke",function(d){
        if (d.value < 0)
          return "#9c4946"
        else {
          return "#5e824f"
        }
      });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 8)
      .attr("fill", function(d){if (d.id==current) {return "#990000"} else return "#8dd3c7"})
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));


  var t = svg.selectAll("text")
  .data(graph.nodes)
  .enter()
  .append("text")
  .text(function(d){return d.id})

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links)
      .distance(function(d){return (200-200*Math.abs(d.value))})
  function ticked() {
    link
        .attr("x1", function(d) {return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })

    node
        .attr("cx", function(d) {return d.x; })
        .attr("cy", function(d) { return d.y; });

    t.attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });

  }


function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}


}



function drawmm(data) {
  var a = Array.from(Object.keys(data[0]))[0]
  var b = Array.from(Object.keys(data[0]))[1]
  mxcurr = a;
  mycurr = b;
  cat = a;
  catY = b;

  var m = {top: 10, right: 20, bottom: 30, left: 60}
    var  w = 700,
      h = 250,
      color = d3.scaleOrdinal(d3.schemeTableau10)

format = d => d.toLocaleString()
treemap = data => d3.treemap()
    .round(true)
    .tile(d3.treemapSliceDice)
    .size([w,h])
  (d3.hierarchy(d3.group(data, d => d[a], d => d[b])).sum(d => d.value))
  if (categories.length > 0) {
var counter = 0;
var index = 0;
while (index < categories.length) {
  if (function(d){return categories.includes(d[a])})
    counter = counter + 1
  index = index + 1
}
}
if (categories.length ==0) {
  fixedColor = color;
}
  var root = treemap(data);
  var svg = d3.selectAll("#mm")
      .attr("viewBox", [0, 0, w, h])
      .style("font", "13px sans-serif")
      .style("cursor","pointer");
  svg.selectAll(".treemap").remove()

  var node = svg.selectAll("g")
    .data(root.descendants())
    .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`)
      .attr("class","treemap")
  var column = node.filter(d => d.depth === 1);


  column.append("g")
  .attr("width",function(d){return d.x1-d.x0-2})

  .append("text")
      .attr("x", 3)
      .attr("class","clickable")
      .attr("y", "-1em")
      .style("font-weight", "bold")
      .text(function(d){
        let l = d.data[0].length
        let i = 0;
        if (13*l > d.x1-d.x0-2) {
          while ((i+3)*l < d.x1 - d.x0-2)
          i++;
          if (i > 0)
          return d.data[0].substring(0,i).concat("...")
          else
          return ""
        }
        else {
          return d.data[0]
        }
      })
    .attr("x", function(d){return (d.x1-d.x0-20)/2})


  var cell = node.filter(d => d.depth === 2);

  cell.append("rect")
      .attr("fill", function(d){
        if (counter > 0) {
          if (categories.includes(d.data[0]))
            return fixedColor(d.data[0])
          else {
            return "grey"
          }
        }

        else return color(d.data[0])
      })
      .attr("width", d => Math.max(d.x1 - d.x0-2,1))
      .attr("height", d => d.y1 - d.y0);


d3.selectAll(".legend").remove()
var canv = d3.selectAll("#mmlegend")
      .append('svg')
      .attr('width', 200)
      .attr('height', h).append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(' + 0 + ', ' + 40 + ')');

  var options = [...new Set(data.map(d => d[b]))];

  var legendItem = canv.selectAll('.legi')
      .data(options)

  var leg = legendItem
      .enter()
      .append('g')
      .attr('class', 'legi')
      .attr('transform', function (d, i) {
          return 'translate(10,' + i * 25 + ')'
      })
      .on("click",clickPos2);

var box =  leg.append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .style('fill', d => color(d))

var legtext =  leg.append('text')
      .attr('x', 25)
      .attr('y', 15).text(function (d) {
      return d;})
      .attr("class","legendtext")

legendItem.exit().remove()
let i = 0;
let j = 0;
      svg.on("click", clickPos);
      function clickPos(e) {
        var bbox = e.target.getBoundingClientRect();
          var xPosition = e.clientX
          var yPosition = e.clientY - bbox.top;

        if (i%2==0) {

        column.selectAll("text")
        .attr("fill",function(d){if(d.x0 > xPosition-500 || d.x1 < xPosition-500){return "grey";}
        else {
          cat = mxcurr
          catY = mycurr
          states.push(d.data[0].split(" ").join(""));
          createMap(current,[]);
          drawBar(current,[])
          drawScatter(current,ycurrent,[])
          if (industries.length == 0)
            mdsbState()
          else if(industries.includes("Military")==false) {
            mdsbBoth()
          }
          return "black"
        }})
        cell.selectAll("rect")
        .attr("fill",function(d){
          if(d.x0 > xPosition-500 || d.x1 < xPosition-500) return "grey";

          if (industries.length !=0) {
           if (d3.select(this).attr("fill") == "grey")
            return "grey"
            else return color(d.data[0])

          }
          else return color(d.data[0])
        })
        let k = 0
        svg.selectAll("rect").each(function(d,i) {
          if(d3.select(this).attr("fill") != "grey")
           k = k+1
        })

        createMap(current,[]);
        drawBar(current,[])
        drawScatter(current,ycurrent,[])
        if (industries.length == 0)
          mdsbState()
        else {
          if(k > 0 && industries.includes("Military")==false) {
            mdsbBoth()
        }
          else {
            if (industries.includes("Military")&&states.includes("GA")) {

              var modal = document.getElementById("militaryModal")
              modal.style.display = "block"
              document.getElementsByClassName("close")[2].onclick = function(){modal.style.display="none"}
              window.onclick = function(event) {
                if(event.target==modal)
                modal.style.display="none"
            }
            createMap(current,[])
            drawBar(current,[])
            drawScatter(current,ycurrent,[])
            }
            else {

            column.selectAll("text").attr("fill","black")
              leg.selectAll("text")
              .attr("fill","black")
              cell.selectAll("rect")
              .attr("fill",function(d){return color(d.data[0])})
              if(industries.includes("Military")) {
                // i=i+1
                // j=j+1
              }
              industries = [];
              states = []
              createMap(current,[]);
              drawBar(current,[])
              drawScatter(current,ycurrent,[])
            mdsbNone()
            var modal = document.getElementById("mmModal")
            modal.style.display = "block"
            document.getElementsByClassName("close")[1].onclick = function(){modal.style.display="none"}
            window.onclick = function(event) {
              if(event.target==modal)
              modal.style.display="none"
          }
        }

        }
        }
        }
  else {
    column.selectAll("text")
      .attr("fill","black")
      leg.selectAll("text").attr("fill","black")
      cell.selectAll("rect")
      .attr("fill",function(d){return color(d.data[0])})
      createMap(current,[]);
      drawBar(current,[])
      drawScatter(current,ycurrent,[])
      mdsbNone();
      states = [];
      industries = [];

}
i = i+1;


    }


    function clickPos2(e) {

      if (j%2==0) {

      leg.selectAll("text")
      .attr("fill","grey")
      d3.select(this).selectAll("text").attr("fill","black")

      leg.selectAll("rect").attr("fill","grey")
      var t = d3.select(this).select(".legendtext").text();
      d3.select(this).select("rect").attr("fill",function(d){
        cat = mxcurr
        catY = mycurr
        industries.push(t.split(" ").join(""));

        cell.selectAll("rect").attr("fill",function(d){
          if(d.data[0] == t) {
            if(states.length > 0) {
            if (d3.select(this).attr("fill") != "grey")
              return color(d.data[0])
              else return "grey"

              }
              else {
              return color(d.data[0])
            }
          }
          else {
            return "grey"
          }
        })
        return color(d)})
        let k = 0
        svg.selectAll("rect").each(function(d,i) {
          if(d3.select(this).attr("fill") != "grey")
           k = k+1
        })

        createMap(current,[]);
        drawBar(current,[])
        drawScatter(current,ycurrent,[])
        if (states.length == 0 && industries[0]!="Military")
          mdsbIndustry()
        else {
          if(k > 0 && industries.includes("Military") ==false)
          mdsbBoth()
          else {
            if(industries.includes("Military")==false) {

              leg.selectAll("text")
              .attr("fill","black")
              column.selectAll("text")
                .attr("fill","black")
              cell.selectAll("rect")
              .attr("fill",function(d){return color(d.data[0])})
              industries = [];
              states = []
              createMap(current,[]);
              drawBar(current,[])
              drawScatter(current,ycurrent,[])
            mdsbIndustry()
            }
            if (industries.includes("Military")) {
            var modal = document.getElementById("militaryModal")
            modal.style.display = "block"
            document.getElementsByClassName("close")[2].onclick = function(){modal.style.display="none"}
            window.onclick = function(event) {
              if(event.target==modal)
              modal.style.display="none"
          }

        }
        else{
           var modal = document.getElementById("mmModal")
        modal.style.display = "block"
        document.getElementsByClassName("close")[1].onclick = function(){modal.style.display="none"}
        window.onclick = function(event) {
          if(event.target==modal)
          modal.style.display="none"
      }
      createMap(current,[]);
      drawBar(current,[])
      drawScatter(current,ycurrent,[])
    }


        }
    }
  }
    else {
    leg.selectAll("text")
    .attr("fill","black")
    column.selectAll("text").attr("fill","black")
    cell.selectAll("rect")
    .attr("fill",function(d){return color(d.data[0])})
    createMap(current,[]);
    drawBar(current,[])
    drawScatter(current,ycurrent,[])
    mdsbNone();
    states = [];
    industries = [];

    }
    j = j+1;


    }




return svg.node();

}

function drawmmLabelY() {
  var d = d3.select("#mmY").select("select").remove();

  var ddb= d3.select("#mmY").append("select").attr("class","b").style("position","absolute").style("left","-475px").style("top","43px")

  ddb
    .selectAll("myOptions")
    .data(labsCat)
    .enter()
    .append('option')
    .text(function(d){return d})
    .property("selected", function(d){
         return d === mycurr;
    })
    .attr("value",function(d){return d})

  var c = d3.select("#mmYtext").select("text").remove();
  d3.select("#mmYtext").append("text").style("position","absolute").style("left","1255px").style("top","415px").text("Legend").style("font-weight","bold")

  ddb.on("change",function(d) {
    var selectedOption=d3.select(this).property("value")
    if (selectedOption != mxcurr) {
      marimekko([mxcurr,selectedOption])
      mycurr = selectedOption
    }
    else {
      var modal = document.getElementById("myModal")
      modal.style.display = "block"
      document.getElementsByClassName("close")[0].onclick = function(){modal.style.display="none"}
      window.onclick = function(event) {
        if(event.target==modal)
        modal.style.display="none"
      }
      d3.select(this).property("value",mycurr)

    }
  })
}

function drawmmLabelX() {
  var d = d3.select("#mmX").select("select").remove();

var ddb= d3.select("#mmX").append("select").style("position","absolute").style("left","880px").style("top","445px").attr("class","b")
  ddb
    .selectAll("myOptions")
    .data(labsCat)
    .enter()
    .append('option')
    .text(function(d){return d})
    .property("selected", function(d){
         return d === mxcurr;
    })
    .attr("value",function(d){return d})

  ddb.on("change",function(d) {
    var selectedOption=d3.select(this).property("value")
    if (selectedOption != mycurr) {
      marimekko([selectedOption,mycurr])
      mxcurr = selectedOption
    }
    else {
      var modal = document.getElementById("myModal")
      modal.style.display = "block"
      document.getElementsByClassName("close")[0].onclick = function(){modal.style.display="none"}
      window.onclick = function(event) {
        if(event.target==modal)
        modal.style.display="none"
      }
      d3.select(this).property("value",mxcurr)

    }
  })

}
