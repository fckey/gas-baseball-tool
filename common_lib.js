function getResourceSpreadSheet(){
  if(getResourceSpreadSheet.sheet) { return getResourceSpreadSheet.sheet; }

  getResourceSpreadSheet.sheet = SpreadsheetApp.openById(RESOURCE_SHEET_ID);
  return getResourceSpreadSheet.sheet;
}

function getResultsSpreadSheet(){
  if(getResultsSpreadSheet.sheet) { return getResultsSpreadSheet.sheet; }

  getResultsSpreadSheet.sheet = SpreadsheetApp.openById(RESULT_SHEET_ID);
  return getResultsSpreadSheet.sheet;
}

function getGamesSheet(){
  if(getGamesSheet.sheet) { return getGamesSheet.sheet; }

  getGamesSheet.sheet = getResourceSpreadSheet().getSheetByName("Games");
  return getGamesSheet.sheet;
}

function getGameSheet(game){
  return getResultsSpreadSheet().getSheetByName(game);
}

function convertToSingleArray(data){
  var list = []
  for(var i=0; i<data.length; i++){
    list.push(data[i][0]);
  }
  return list;
}

function getPlayers(){
  if(getPlayers.players) { return getPlayers.players }

  var player_sheet = getResourceSpreadSheet().getSheetByName("Players");
  var data = player_sheet.getSheetValues(1, 1, player_sheet.getLastRow(), 1);
  getPlayers.players = convertToSingleArray(data);
  return getPlayers.players;
}

function getGameName(){
  if(getGameName.games) { return getGameName.games; }

  var games_sheet = getGamesSheet();
  getGameName.games = convertToSingleArray(getGamesSheet().getSheetValues(1, 1, games_sheet.getLastRow(), 1));
  return getGameName.games;
}
