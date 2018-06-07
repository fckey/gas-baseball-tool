function createPitchingForm(){

  var title = "Pitching Results";
  var form = FormApp.create(title).setTitle(title);

  var choices = ["1B", "2B", "3B", "HR", "O", "SO", "BB", "E", "SH/SF"];
  form.addMultipleChoiceItem()
      .setTitle("Hitting Reusult")
      .setChoiceValues(choices)
      .setRequred(true);

  form.addTextItem()
      .setTitle("Steal")
      .setRequired(false);

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

function onFormSubmit(e) {
  Logger.log(e);
  var game = e.namedValues["Game"].toString();
  var game_sheet = getGameSheet(game);
  if(!game_sheet){
    getResultsSpreadSheet().insertSheet(game);
    game_sheet = getGameSheet(game);
    game_sheet.appendRow(generateHeader());
  }
  game_sheet.appendRow(calcHittingResult(e.namedValues));
}

function createFormSubmitTriggers(){
  ScriptApp.newTrigger("onFormSubmit")
  .forSpreadsheet(RESULT_SHEET_ID)
  .onFormSubmit()
  .create();
}
