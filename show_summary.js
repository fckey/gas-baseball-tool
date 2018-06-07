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
  var values = getDataFromSheet(sheet);
  values[0] =updateHeader(values[0]);
  addAdditionalParam(values);
  var tableHtml = createTable(values, "table table-striped");
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

function extractPitching(){
  var results = {};
  var values = getDataFromSheet(getGameSheet("Pitching"));
  var header = values[0].slice(1,values[0].length);
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var date = row[0].toString();
    if(!(date in results)){
      results[date] = [header];
    }
    results[date].push(row.slice(1, row.length));
  }
  return results;
}

function createSummaryHtmlTable(){
  var summary_sheet = getGameSheet("Summary");
  var result = "<h5> Ground Total (Update on Monday) </h5>";
  result += createTable(getDataFromSheet(summary_sheet), "table table-bordered table-striped");
 return result;
}

function createPitchingSummaryHtmlTable(){
  var summary_sheet = getGameSheet("Summary_Pitching");
  var result = "Pitching Summary";
  result += createTable(getDataFromSheet(summary_sheet), "table table-bordered table-striped");
  return result;
}

function createRankingHtmlTable(){
  var ranking_sheet = getGameSheet("Ranking");
  var result = "<h5> Hitting Ranking </h5>";
  result += createTable(getDataFromSheet(ranking_sheet), "table table-bordered table-sm");
 return result;
}

function createPichingHtmlTable(pitching_list){
  var result = "Pitting Results";
  result += createTable(pitching_list, "table table-bordered table-striped");
  return result;
}

function generateResultsTable(){
  var result = "<center>";
  var sheets = extractValidResultSheets();
  var pitching = extractPitching();
  result += createSummaryHtmlTable();
  result += createPitchingSummaryHtmlTable();
  result += createRankingHtmlTable();
  var sheetNames = Object.keys(sheets).sort().reverse();
  for(var i = 0; i<sheetNames.length; i++){
    var sheetName = sheetNames[i];
    Logger.log(sheetName)
    var sheet = sheets[sheetName];
    result += "<h5> Game of " + sheetName + "</h5>";
    result += "Hitting Results";
    result += processSheet(sheet);
    if(sheetName in pitching){
      result += createPichingHtmlTable(pitching[sheetName]);
    }
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

function updatePitchingSummaryHeader(header){
  header.splice(1,2,"Games", "Win", "Lose", "Hold", "Save");
  return header;
}

function summarizePitchingResult(rows, header, games, win_lose){
  var final_result = [];
  header = updatePitchingSummaryHeader(header);
  final_result.push(header);
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var data = win_lose[row[0]];
    row[11] = calcEra(row[2], row[3], row[4]);
    row.splice(1,1, games[row[0]], data[0], data[1], data[2], data[3]);
    final_result.push(row);
  }
  return final_result;
}

function updateWinLose(win_lose, name, result){
  if(!win_lose[name]){
    win_lose[name] = [0, 0, 0, 0];
  }
  Logger.log(result)
  if(result === "W"){
    win_lose[name][0] += 1;
  }else if (result === "L") {
    win_lose[name][1] += 1;
  }else if (result === "H") {
    win_lose[name][2] += 1;
  }else if (result === "S") {
    win_lose[name][3] += 1;
  }
}

function createPitchingSummary(){
  var values = getDataFromSheet(getGameSheet("Pitching"));
  var summary_sheet = getGameSheet("Summary_Pitching");
  var results = {};
  var win_lose = {};
  var individuals = {};
  var count_games = {};
  var header = values[0];
  for (var i = 1; i < values.length; i++) {
    var row = values[i].slice(1,values[i].length);
    var name = row[0];
    if(!individuals[name]){
      count_games[name] = 1;
      individuals[name] = row;
      updateWinLose(win_lose, name, row[1]);
      continue;
    }
    count_games[name] += 1;
    individuals[name] = individuals[name].map(function(e, index){
      if(index === 0){//Return name as it is
        return e;
      }
      if(index === 1){
        updateWinLose(win_lose, name, row[index]);
        return e;
      }
      return e+row[index];
    });
  };

  var total = convertMapToMultiArray(individuals);
  summary_sheet.clear();
  var final_result = summarizePitchingResult(total, header, count_games, win_lose);
  for (var i = 0; i < final_result.length; i++) {
    summary_sheet.appendRow(final_result[i]);
  }
}

function createSummary(){
  var sheets = extractValidResultSheets();
  var summary_sheet = getGameSheet("Summary");
  var individuals = {};
  var count_games = {};
  for(var sheetName in sheets){
    var sheet = sheets[sheetName];
    var values = getDataFromSheet(sheet);
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
