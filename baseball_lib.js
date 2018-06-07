function generateHeader(values){
  return ["Name", "PA", "AB", "H", "2H","3H","HR","TB","SO","BB", "SH", "SF", "RBI", "R", "SB"];
}

function extractValueAsInt(value){
  if(!value) return 0;
  return parseInt(value);
}

function calcTB(single, double, triple, hr){
  return single + 2*double + 3*triple + 4*hr;
}
function calcAve(row){
  var ab = row[2];
  var hits = row[3];
  return (ab===0)? 0: Math.round(1000*hits/ab)/1000;
}

function calcSlg(row){
  var ab = row[2];
  var tb = row[7];
  return (tb===0)? 0: Math.round(1000*tb/ab)/1000;
}

function calcObs(row){
  var ab = row[2];
  var hits = row[3];
  var bb = row[9];
  var sf = row[11];
  var ab_bb_sf = ab+bb+sf;
  return (ab_bb_sf===0)? 0: Math.round(1000*(hits+bb)/ab_bb_sf)/1000;
}