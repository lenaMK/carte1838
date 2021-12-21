/*

@@@@@@@@@@@@@@@@@@@@@@@
Map of France with data
@@@@@@@@@@@@@@@@@@@@@@@

author: lmk
source: https://beta.observablehq.com/d/47e03b0eadfc73b3
date: 11 january 2019 [original], new work june 2021

*/
var index = {};

const svg = d3.select("#svgCarte")
const width = svg.style("width").slice(0, -2)
const height = svg.style("height").slice(0, -2)

console.log("carte width " + width)

console.log("carte height " + height)
    
const domain = [0, width];
const color = d3.scaleLinear()
  .domain(domain)
  .interpolate(() => d3.interpolateGreens);
const path = d3.geoPath();
/*
function handleMouseOver(d, i){
  //changes color on mouseOver
  d3.select(this)
    .style('fill', '#ddd');

  d3.select('#dpt'+d.properties.code)
    .style('font-weight', 'bold')
    .text(d => index[d.properties.code].length);

  svg.append("text")
    .attr("id", "dpt" + d.properties.code + i)
    .attr("x", width - 250)
    .attr("y", 80)
    .text("Departement: " + d.properties.nom)
    .style("font-weight", "bold")
  
  svg.append("text")
    .attr("id", "nb" + d.properties.code + i)
    .attr("x", width - 250)
    .attr("y", 100)
    .text("Nombre de délibérations: " + index[d.properties.code].length)

}

function handleMouseOut(d,i){
  //changes color back 
  d3.select(this)
    .style('fill', color(index[d.properties.code].length));

  d3.select('#dpt'+d.properties.code)
    .style('font-weight', 'normal')
    .text(d => d.properties.nom);

  d3.select("#dpt" + d.properties.code + i).remove();
  d3.select("#nb" + d.properties.code + i).remove();
} 

function handleClick(d,i){
  console.log(d.properties.nom + ' : ' + index[d.properties.code].length + ' délibérations')
}
*/
function projection(data){
  
  const projection = d3.geoConicConformal()
    .center([2.454071, 46.279229]) // Center on France
    .scale(500)
    .fitSize([480, 430], data);

  path.projection(projection);
    
  console.timeEnd('projection');
}

function addInfo(data){
  var g = 0;
  while (g < 20 ){
    var html = d3.select(`#p${g}`)
    
    /*add data[g]*/

    console.log(data[g])

    g++;
  }
}

function map(geojson){
  console.timeEnd('json');

  projection(geojson);

  svg.append("image")
  .attr("xlink:href", "../../img/fondCarte1838.png")
  .attr("x", -90)
  .attr("y", -50)
  .attr("width", width)
  .attr("height", height)
  .attr("id", "fillImage");


  svg.selectAll("path")
    .data(geojson.features)
    .enter().append("path")
    .attr("d", path)
    .attr('fill', 'transparent') /*d => color(index[d.properties.code].length) */
    .attr('stroke', 'black')/*
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);*/

  var labels = svg.append('g').attr('class', 'labels');

  labels.selectAll('.label')
    .data(geojson.features)
    .enter()
    .append('text')
      .attr("class", "label")
      .attr('transform', function(d) {
          return "translate(" + path.centroid(d) + ")";
      })
      .attr("id", (d => ("dpt"+d.properties.code)))
      .style('text-anchor', 'middle')
      .style('font-size', '9px')
      .style('font-family', 'sans-serif')
      .text(d => d.properties.nom);

  svg.selectAll('g').raise();
  return svg.node();
}


console.time('json');
console.time('projection');

Promise.all([
  d3.json('../../data/departements-version-simplifiee.geojson'),
  d3.csv('../../data/DonneesGeneraux1.csv')
]).then(([geojson, data]) => {

  addInfo(data);
  map(geojson);

  d3.select("#fondCarte").on("clic", d => d3.select("#fillImage").classed("visible"))
  /*to check in carteCommunes*/

}).catch(function(error) {
  console.log(error);
});




  svg.call(d3.zoom().on("zoom", function () {
          svg.attr("transform", d3.event.transform)
  }))
