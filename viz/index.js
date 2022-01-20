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
  .attr("class", "invisible")
  .attr("id", "fillImage");


  svg.selectAll("path")
    .data(geojson.features)
    .enter().append("path")
    .attr("d", path)
    .attr('fill', 'transparent') /*d => color(index[d.properties.code].length) */
    .attr('stroke', 'black')
    .attr("id", (d => ("dpt"+d.properties.code)))/*
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
      .style('text-anchor', 'middle')
      .style('font-size', '9px')
      .style('font-family', 'sans-serif')
      .text(d => d.properties.nom);

  svg.selectAll('g').raise();
  return svg.node();
}


console.time('json');
console.time('projection');

function formatReference(refJSON){
  var refComplete = refJSON.split(".")

  var lien = refJSON.replace(refComplete[0],'').replace(refComplete[1],'').replace(refComplete[2],'').replace(refComplete[3],'').replace(refComplete[4],'').replace('..... ', '')

  var ref = `${refComplete[0]}.
            <i>${refComplete[1]}</i>.
            ${refComplete[2]}.
            ${refComplete[3]}.
            ${refComplete[4]}.
            <a href=${lien} target="_blank">Source</a>`
  return ref
}

function formatInfo(json){
 
  
  var ref = formatReference(json.Reference)

  var text = `<h3>${json.Nom}</h3>
              <p>(${json.Naissance}-${json.Mort})</p>
              
              <img src="../../img/portraits/${json.Id}.jpg" height="300px">
              <p class="ref">${ref}</p>
              <p><b>Statut</b>: ${json.Statut}</p>
              <p><b>Cause de mort</b>: ${json.CauseMort}</p>
              <p><b>Mort à la guerre</b>: ${json.MortGuerre}</p>
              <p><b>Période mort</b>: ${json.PeriodeMort}</p>
              <p><b>Ville d'origine</b>: ${json.Ville}</p>
              <p><b>Département d'origine</b>: ${json.Departement}</p>
              <p><b>Bataille/campagne représentée</b>: ${json.BataillePortrait}</p>
              <p><b>Légion d'honneur</b>: ${json.Legion}</p>
              <p><b>Ralliement aux Bourbons en 1815</b>: ${json.trahisonCause}</p>
              `

  return text;
}


Promise.all([
  d3.json('../../data/departements-version-simplifiee.geojson'),
  d3.csv('../../data/DonneesGeneraux-final.csv')
]).then(([geojson, data]) => {
  console.log(data)
  data = data.sort((a, b) => {
    return a.Id - b.Id;
  })

  //addInfo(data);
  map(geojson);

  //affiche ou cache le fond de carte
  d3.select("#svgCarte").on("click", d => {
    var img = d3.select("#fillImage");
    
    img.classed("invisible", !img.classed("invisible"))
  })

  //interaction pour chaque personne p (pas Napoléon)
  data.forEach(personne => {
    var zone = d3.select(`#p${personne.Id}`)

    zone.on("click", function () {

      var texte = formatInfo(personne);
      d3.select("#text").html(texte)

      d3.select(`#dpt${personne.NumDpt}`)
        .style('fill', 'yellow')
      //console.log(personne)

      var portraitCarte = d3.select(`#img${personne.Id}`)
      portraitCarte.classed("invisible", !portraitCarte.classed("invisible"))

    })
  })

  //interaction pour les monuments
  var austerlitz = d3.select('#m1')
  austerlitz.on("click", function () {

    var texte = `<h3>Colonne de la Grande Armée d'Austerlitz</h3>
          <p>1810</p>
          <p><b>Architectes</b>: Jean-Baptiste Lepère, Jacques Gondouin </p>
          <p><b>Emplacement</b>: place Vendôme </p>
          <img src="../../img/monuments/Austerlitz2.jpg" height="500px">`
    d3.select("#text").html(texte)
    //console.log(personne)*/

    var portraitCarte = d3.select(`#imgM1`)
    portraitCarte.classed("invisible", !portraitCarte.classed("invisible"))

  })

  var palmier = d3.select('#m2')
  palmier.on("click", function () {
    var texte = `<h3>Fontaine du palmier</h3>
          <p>1808</p>
          <p><b>Sculpteurs</b>: Louis-Simon Boizot, Henri-Alfred Jacquemart  </p>
          <p><b>Emplacement</b>: place du Châtelet </p>
          <img src="../../img/monuments/Austerlitz2.jpg" height="500px">`
    d3.select("#text").html(texte)
    
    var portraitCarte = d3.select(`#imgM2`)
    portraitCarte.classed("invisible", !portraitCarte.classed("invisible"))
    
  })


  var napo = d3.select('#nap1')
  napo.on("click", function () {

    var ref = formatReference(data[0].Reference)
    console.log(ref)
    var texte = `<h3>Napoléon</h3>
          <p>(1769-1821)</p>
          <img src="../../img/portraits/1.png" width="100%">
          <p class="ref">${ref}</p>
          `
    d3.select("#text").html(texte)
    
    var portraitCarte = d3.select(`#imgNap`)
    portraitCarte.classed("invisible", !portraitCarte.classed("invisible"))
    
  })

  //vide la zone de texte
  d3.select('#text').on("click", function(d) {
    d3.select('#text').html("")
  })

}).catch(function(error) {
  console.log(error);
});




  svg.call(d3.zoom().on("zoom", function () {
          svg.attr("transform", d3.event.transform)
  }))
