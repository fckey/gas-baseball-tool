function createPitchingForm(){

  var title = "Pitching Results";
  var form = FormApp.create(title).setTitle(title);

  var textValidation = FormApp.createTextValidation()
   .setHelpText("Input was not a number.")
   .requireNumber()
   .build();

  form.addListItem()
      .setTitle("Game")
      .setChoiceValues(getGameName())
      .setRequired(true);

  form.addListItem()
      .setTitle("Name")
      .setChoiceValues(getPlayers())
      .setRequired(true);

  form.addMultipleChoiceItem()
  .setTitle("Result")
  .setChoiceValues(["W", "L", "H", "S", "NA"])
  .setRequired(true);

  form.addScaleItem()
  .setTitle("Inning")
  .setBounds(1,7)
  .setRequired(true);

  form.addTextItem()
      .setTitle("Outs")
      .setHelpText("n/3")
      .setValidation(textValidation);

  form.addTextItem()
      .setTitle("R")
      .setHelpText("失点")
      .setValidation(textValidation)
      .setRequired(true);

  form.addTextItem()
      .setTitle("ER")
      .setHelpText("自責点")
      .setValidation(textValidation)
      .setRequired(true);

  form.addTextItem()
      .setTitle("SO")
      .setValidation(textValidation);

  form.addTextItem()
      .setTitle("BB")
      .setValidation(textValidation);

  form.addTextItem()
      .setTitle("H")
      .setValidation(textValidation);

  form.addTextItem()
      .setTitle("HR")
      .setValidation(textValidation);

  form.addTextItem()
      .setTitle("NP")
      .setHelpText("球数")
      .setValidation(textValidation);


    form.setDestination(FormApp.DestinationType.SPREADSHEET, RESULT_SHEET_ID);

}

function createSumaryForm(){
  var title = "Baseball Results Summary";
  var form = FormApp.create(title)
                    .setTitle(title)
                    .setDescription("Add your butting result");

  var textValidation = FormApp.createTextValidation()
   .setHelpText("Input was not a number.")
   .requireNumber()
   .build();

  form.addListItem()
      .setTitle("Game")
      .setChoiceValues(getGameName())
      .setRequired(true);


  form.addListItem()
      .setTitle("Name")
      .setChoiceValues(getPlayers())
      .setRequired(true);

  form.addGridItem()
  .setTitle("Results")
  .setRows(["H","2H","3H","HR", "SO", "Out", "BB"])
  .setColumns([0,1,2,3,4,5])
  .setHelpText("H is single hit but not total. Don't include SO in Out. SO:三振");

  form.addTextItem()
      .setTitle("SH")
      .setHelpText("犠打")
      .setValidation(textValidation)
      .setRequired(false);

  form.addTextItem()
      .setTitle("SF")
      .setHelpText("犠飛")
      .setValidation(textValidation)
      .setRequired(false);

  form.addTextItem()
      .setTitle("E")
      .setHelpText("Error on your hitting")
      .setValidation(textValidation)
      .setRequired(false);

   form.addTextItem()
      .setTitle("RBI")
      .setHelpText("打点")
      .setValidation(textValidation);

  form.addTextItem()
      .setTitle("R")
      .setHelpText("得点")
      .setValidation(textValidation);

  form.addTextItem()
      .setTitle("SB")
      .setHelpText("盗塁")
      .setValidation(textValidation);

  form.addTextItem()
      .setTitle("Interference")
      .setHelpText("打撃妨害")
      .setValidation(textValidation);

  form.setDestination(FormApp.DestinationType.SPREADSHEET, RESULT_SHEET_ID);

}

function calcHittingResult(values){
  result = [];
  var single = extractValueAsInt(values["Results [H]"].toString());
  var double = extractValueAsInt(values["Results [2H]"].toString());
  var triple = extractValueAsInt(values["Results [3H]"].toString());
  var hr = extractValueAsInt(values["Results [HR]"].toString());
  var out = extractValueAsInt(values["Results [Out]"].toString());
  var so = extractValueAsInt(values["Results [SO]"].toString());
  var bb = extractValueAsInt(values["Results [BB]"].toString());
  var sh = extractValueAsInt(values["SH"].toString());
  var sf = extractValueAsInt(values["SF"].toString());
  var error = extractValueAsInt(values["E"].toString());
  var rbi = extractValueAsInt(values["RBI"].toString());
  var run = extractValueAsInt(values["R"].toString());
  var sb = extractValueAsInt(values["SB"].toString());
  var inter = extractValueAsInt(values["Interference"].toString());

  var hits = single + double + triple + hr;
  var ab = hits + out + so + error;
  var pa = ab + bb + sh + sf + inter;
  var tb = calcTB(single, double, triple, hr);

  result.push(values["Name"].toString());
  result.push(pa);
  result.push(ab);
  result.push(hits);
  result.push(double);
  result.push(triple);
  result.push(hr);
  result.push(tb);
  result.push(so);
  result.push(bb);
  result.push(sh);
  result.push(sf);
  result.push(rbi);
  result.push(run);
  result.push(sb);

  return result;
}

function calcPitchingResult(values){
  result = [];
  var date = extractValueAsInt(values["Game"].toString());
  var inning = extractValueAsInt(values["Inning"].toString());
  var outs = extractValueAsInt(values["Outs"].toString());
  var run = extractValueAsInt(values["R"].toString());
  var er = extractValueAsInt(values["ER"].toString());
  var so = extractValueAsInt(values["SO"].toString());
  var bb = extractValueAsInt(values["BB"].toString());
  var hits = extractValueAsInt(values["H"].toString());
  var hr = extractValueAsInt(values["HR"].toString());
  var np = extractValueAsInt(values["NP"].toString());
  var era = calcEra(inning, outs, er);
  result.push(date);
  result.push(values["Name"].toString());
  result.push(values["Result"].toString());
  result.push(inning);
  result.push(outs)
  result.push(run);
  result.push(er);
  result.push(so);
  result.push(bb);
  result.push(hits);
  result.push(hr);
  result.push(np);
  result.push(era);
  return result;
}

function isNameEqual(row, new_row){
  return row[0] === new_row[0];
}

function isNameAndDateEqual(row, new_row){
  return (row[0] === new_row[0]) && (row[1] === new_row[1]);
}

function overwriteRowIfPlayterExists(sheet, new_row, validator){
  var values = getDataFromSheet(sheet);
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if(validator(row, new_row)){
      sheet.deleteRow(i+1);//row starts from 1 in the sheet
      break;
    }
  }
  sheet.appendRow(new_row);
}

function processPitchingResult(e){
  var pitching_sheet = getGameSheet("Pitching");
  var new_row = calcPitchingResult(e.namedValues);
  overwriteRowIfPlayterExists(pitching_sheet, new_row, isNameAndDateEqual);
}

function processHittingResult(e){
  var game = e.namedValues["Game"].toString();
  var game_sheet = getGameSheet(game);
  if(!game_sheet){
    getResultsSpreadSheet().insertSheet(game);
    game_sheet = getGameSheet(game);
    game_sheet.appendRow(generateHeader());
  }
  overwriteRowIfPlayterExists(game_sheet, calcHittingResult(e.namedValues), isNameEqual);
}
function onFormSubmit(e) {
  Logger.log(e);
  if("Result" in e.namedValues){
    processPitchingResult(e);
  }else {
    processHittingResult(e);
  }
}

function createFormSubmitTriggers(){
  ScriptApp.newTrigger("onFormSubmit")
  .forSpreadsheet(RESULT_SHEET_ID)
  .onFormSubmit()
  .create();
}
