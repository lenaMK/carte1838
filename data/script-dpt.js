const fs = require('fs-extra');
const parse = require('csv-parser')
const dpt = JSON.parse(fs.readFileSync('departements-version-simplifiee.geojson'))

const generaux = [];
fs.createReadStream('DonneesGeneraux-final.csv')
    .pipe(parse())
    .on('data', function(data){
        try{
            generaux.push(data)
        }
        catch(err){
            console.log(err)
        }
    }).on('end',function(){



        generaux.forEach(gen => {
            var dptOrigine = gen.Departement;
            var numDpt;
            if (dptOrigine == "Inconnu"){
                numDpt = '000'
            }
            else if (dptOrigine == "Grand duché de Bade"){
                numDpt = '001'
            }
            else if( dptOrigine == "Côte d'Or"){
                numDpt = '21'
            }
            else if( dptOrigine == "Puy de Dôme"){
                numDpt = '63'
            }
            else{                
                dpt.features.forEach(dep =>{
                    if (dep.properties.nom == dptOrigine){
                        numDpt = dep.properties.code
                    }
                })
            }        

            if (numDpt != undefined)
                console.log(gen.Id + ' -> ' +numDpt)
            else{
                console.log(gen.Nom)
                console.log(gen.Ville)
                console.log(dptOrigine)
                console.log('à retravailler')
            }
        })


        
        console.log('fini')
    });  
    



