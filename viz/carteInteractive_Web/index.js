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
/*
function addInfo(data){
  //g = 1 ==> Napoléon
  var g = 2;

  while (g < 21 ){
    var current = JSON.stringify(data[g-1]);
    console.log(data[g-1])
    console.log(current)

    var html = d3.select(`#p${g}`)
      .html(current)


    g++;
  }
}
*/
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


function formatInfo(json){

  console.log(json)
  var text = `<h3>${json.Nom}</h3>
              <p>(${json.Naissance}-${json.Mort})</p>
              
              <img src="../../img/portraits/${json.Id}.jpg" height="300px">
              <p><b>Statut</b>: ${json.Statut}</p>
              <p><b>Cause de mort</b>: ${json.CauseMort}</p>
              <p><b>Mort à la guerre</b>: ${json.MortGuerre}</p>
              <p><b>Période mort</b>: ${json.PeriodeMort}</p>
              <p><b>Ville d'origine</b>: ${json.Ville}</p>
              <p><b>Département d'origine</b>: ${json.Departement}</p>
              <p><b>Bataille représentée</b>: ${json.BataillePortrait}</p>
              <p><b>Légion d'honneur</b>: ${json.Legion}</p>
              <p><b>Trahison</b>: ${json.Trahison}</p>
              <p><b>Cause trahison</b>: ${json.trahisonCause}</p>
              `

  return text;
}


Promise.all([
  d3.json('../../data/departements-version-simplifiee.geojson'),
  d3.csv('../../data/DonneesGeneraux1.csv')
]).then(([geojson, data]) => {

  data = data.sort((a, b) => {
    return a.Id - b.Id;
  })

  //addInfo(data);
  map(geojson);

  d3.select("#svgCarte").on("click", d => {
    var img = d3.select("#fillImage");
    
    img.classed("invisible", !img.classed("invisible"))
  })
  /*to check in carteCommunes*/


  data.forEach(personne => {
    var zone = d3.select(`#p${personne.Id}`)

    zone.on("click", function () {

      var texte = formatInfo(personne);
      d3.select("#text").html(texte)
      //console.log(personne)

      var portraitCarte = d3.select(`#img${personne.Id}`)
      portraitCarte.classed("invisible", !portraitCarte.classed("invisible"))

    })
  })
  
  /*
  
  
  

*/


}).catch(function(error) {
  console.log(error);
});




  svg.call(d3.zoom().on("zoom", function () {
          svg.attr("transform", d3.event.transform)
  }))
