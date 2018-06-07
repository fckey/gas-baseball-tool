function doGet() {
   var t = HtmlService.createTemplateFromFile("index.html");
   return t.evaluate();
}

function updateHeader(header){
  header.push("Ave");
  header.push("SLG");
  header.push("OBS");
  header.push("OPS");
  return header;
}

function addAdditionalParam(values){
  for(var i=1; i<values.length; i ++){
    var row = values[i];
    var slg = calcSlg(row);
    var obs = calcObs(row);
    row.push(calcAve(row));
    row.push(slg);
    row.push(obs);
    row.push(Math.round(1000*(slg+obs))/1000);
  }
}

function createTable(values, style){
  var result = ""
  var header = "<table class=\""+style+"\"><tbody>";
  var trailer = "</tbody></table>";
  result += header;

  for(var i=0; i<values.length; i ++){
    var row = values[i];
    if(i === 0){
      result+="<thread><tr>";
      for(var j=0; j<row.length; j++){
        var value = row[j];
        result += "<th scope=\"col\">" + value + "</th>";
      }
      result+="</tr><thread><tbody>";
      continue;
    }
    result += "<tr>";
    for(var j=0; j<row.length; j++){
      var value = row[j];
      result += "<td scope=\"row\">" + value + "</td>";
    }
    result += "</tr>";
  }
  result += trailer;
  return result;
}

function processSheet(sheet){
  var values = sheet.getSheetValues(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  values[0] =updateHeader(values[0]);
  addAdditionalParam(values);
  var tableHtml = createTable(values, "table table-striped") + "<br>";
  return tableHtml;

}

function extractValidResultSheets(){
  var result_ss = getResultsSpreadSheet();
  var reg = new RegExp("\\d{8}");
  var result = {};
  var sheets = result_ss.getSheets();
  for(var i =0; i<sheets.length; i++){
    var sheet = sheets[i];
    if(!reg.test(sheet.getName())){
      continue;
    }

    result[sheet.getName()] = sheet;
  }
  return result;
}

function createSummaryHtmlTable(){
  var summary_sheet = getGameSheet("Summary");
  var result = "<h5> Ground Total (Update on Monday) </h5>";
  result += createTable(summary_sheet.getSheetValues(1, 1, summary_sheet.getLastRow(), summary_sheet.getLastColumn()), "table table-bordered table-striped");
 return result;
}

function createRankingHtmlTable(){
  var ranking_sheet = getGameSheet("Ranking");
  var result = "<h5> Hitting Ranking </h5>";
  result += createTable(ranking_sheet.getSheetValues(1, 1, ranking_sheet.getLastRow(), ranking_sheet.getLastColumn()), "table table-bordered table-sm");
 return result;
}

function generateResultsTable(){
  var result = "<center>";
  var sheets = extractValidResultSheets();
//  createSummary();
  result += createSummaryHtmlTable();
  result += createRankingHtmlTable();
  var sheetNames = Object.keys(sheets).sort().reverse();
  for(var i = 0; i<sheetNames.length; i++){
    var sheetName = sheetNames[i];
    Logger.log(sheetName)
    var sheet = sheets[sheetName];
    result += "<h5> Game of " + sheetName + "</h5>";
    result += processSheet(sheet)
  }
  result+="</center>"
  return result;
}

function convertMapToMultiArray(map){
  var ar = []
  for(var key in map){
    ar.push(map[key]);
  }
  return ar;
}

function getHeaderForSummary(){
 var header = updateHeader(generateHeader());
 header.splice(1,0,"Games");//Add header for num of games
 return header;
}

function createSummary(){
  var sheets = extractValidResultSheets();
  var summary_sheet = getGameSheet("Summary");
  var individuals = {};
  var count_games = {};
  for(var sheetName in sheets){
    var sheet = sheets[sheetName];
    var values = sheet.getSheetValues(1, 1, sheet.getLastRow(), sheet.getLastColumn());
    for(var i=1; i<values.length; i ++){
      var row = values[i];
      var name = row[0];
      if(!individuals[name]){
        count_games[name] = 1;
        individuals[name] = row;
        continue;
      }
      count_games[name] += 1;
      individuals[name] = individuals[name].map(function(e, index){
        if(index === 0){//Return name as it is
          return e;
        }
        return e+row[index];
      });
    }
  }
  var total = convertMapToMultiArray(individuals);

//  Logger.log(total);

  summary_sheet.clear();

  total.unshift(updateHeader(generateHeader()));
  addAdditionalParam(total);
  for(var i=0; i<total.length;i++){
    var row = total[i];
    if(i === 0){
      row.splice(1,0,"Games");//Add header for num of games
    }else{
      row.splice(1,0,count_games[row[0]]);//Add num of games
    }
      summary_sheet.appendRow(row);
  }

}
