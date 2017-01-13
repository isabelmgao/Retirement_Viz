var $form = $('.form');
var $age = $('.age');
var $income = $('.income');
var $initial = $('.initialInvestment');
var $contribution = $('.contribution');
var $wAge = $('.withdraw-age');
var $withdrawAmount = $('.withdraw-amount');

$form.on('submit', function(e){
  e.preventDefault();

  var income = $income.val();
  var contribution = $contribution.val();
  var withdrawAge = $wAge.val();
  var withdrawAmount = $withdrawAmount.val();
  var currentAge = $age.val();
  var initialInvestment = $initial.val();
  var growthYears = parseFloat(withdrawAge) - parseFloat(currentAge)
  var rothData = createRothData(contribution, currentAge, withdrawAge, income, initialInvestment, withdrawAmount)
  var tradData = createTradData(contribution, currentAge, withdrawAge, income, initialInvestment, withdrawAmount)
  var appreciationYears = withdrawAge - currentAge
  var maxAge = Math.max(rothData[rothData.length-1]['age'], tradData[tradData.length-1]['age'])
  console.log(maxAge);
  var maxSavings = Math.max(rothData[appreciationYears]['maxAppreciation'], tradData[appreciationYears]['maxAppreciation'])
  console.log('max savings:');
  console.log(maxSavings);


  var margin = {top: 30, right: 20, bottom: 30, left: 100},
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;


  var x = d3.scale.linear()
                  .domain([currentAge, maxAge]) //the domain should essentially map the data points to the num pixels
                  .range([0, width]); //the range should be the num pixels of y axis
  var y = d3.scale.linear()
                  .domain([maxSavings, 0])
                  .range([0, height]);

  // Define the axes
  var xAxis = d3.svg.axis().scale(x)
      .orient("bottom").ticks(5);

  var yAxis = d3.svg.axis().scale(y)
      .orient("left").ticks(5);

  // Define the line
  var valueline = d3.svg.line()
      .x(function(d) { return x(d.age); })
      .y(function(d) { return y(d.savings); })


  // Adds the svg canvas
  var svg = d3.select("body")
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

  // Add the valueline path.
  svg.append("path")
      .attr("class", "line")
      .attr("d", valueline(tradData));

  svg.append("path")
      .attr("class", "rothline")
      .attr("d", valueline(rothData));


  // Add the X Axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Add the Y Axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);


})

function createRothData(contribution, age, withdrawAge, income, initialInvestment, withdrawAmount){
  var rothData = []
  if (income < 9275){
    taxRate = 0.1
  }else if (income > 9276 && income < 37650) {
    taxRate = 0.15
  }else if (income > 37651 && income < 91150) {
    taxRate = 0.25
  }else if (income < 91150 && income < 190150) {
    taxRate = 0.28
  }else if (income < 190151 && income < 413350) {
    taxRate = 0.33
  }else if (income < 413351 && income < 415050) {
    taxRate = 0.35
  }else if (income > 415051) {
    taxRate = 0.396
  }
  for (i = age; i <= withdrawAge; i++){
    var singleObj = {}
    if (i == age){
      appreciate_temp = parseFloat(contribution) + parseFloat(initialInvestment)
    }
    singleObj['age'] = i;
    singleObj['savings'] = appreciate_temp
    rothData.push(singleObj)
    var appreciation = appreciate_temp
    contAfterTaxes = contribution*(parseFloat(1) - parseFloat(taxRate))
    appreciate_temp = appreciate_temp*1.03
    appreciate_temp = parseFloat(appreciate_temp) + parseFloat(contAfterTaxes)

  }
  singleObj['maxAppreciation'] = appreciation

  rothData.push(singleObj)
  return createRothDeprData(rothData, withdrawAge, appreciation, withdrawAmount)
}

function createRothDeprData(data, withdrawAge, appreciation, withdrawAmount){
  year = Math.floor(withdrawAge)
  while (appreciation>0 && withdrawAmount<appreciation){
    year += 1
    singleObj = {}
    singleObj['age'] = year
    appreciation = parseFloat(appreciation) - parseFloat(withdrawAmount)
    singleObj['savings'] = appreciation
    data.push(singleObj)
  }
  if (appreciation>0 && withdrawAmount>appreciation){
    singleObj = {}
    percentOfYear = appreciation/withdrawAmount
    singleObj['age'] = year + percentOfYear
    singleObj['savings'] = 0
    data.push(singleObj)
  }
  // console.log("roth data:");
  // console.log(data);
  return data
}

function createTradData(contribution, age, withdrawAge, income, initialInvestment, withdrawAmount){
  var data = []

  for (i = age; i <= withdrawAge; i++){
    var singleObj = {}
    if (i == age){
      appreciate_temp = parseFloat(contribution) + parseFloat(initialInvestment)
    }
    singleObj['age'] = i;
    singleObj['savings'] = appreciate_temp
    data.push(singleObj)
    var appreciation = appreciate_temp
    appreciate_temp = appreciate_temp*1.03
    appreciate_temp = parseFloat(appreciate_temp) + parseFloat(contribution)
  }

  singleObj['maxAppreciation'] = appreciation
  data.push(singleObj)
  return createTradDeprData(data, withdrawAge, appreciation, withdrawAmount)
}

  function createTradDeprData(data, withdrawAge, appreciation, wAmount){
  year = Math.floor(withdrawAge)
  wAmount = Math.floor(wAmount)
  if (wAmount < 9275){
    taxRate = 1.1
  }else if (wAmount > 9276 && wAmount < 37650) {
    taxRate = 1.15
  }else if (wAmount > 37651 && wAmount < 91150) {
    taxRate = 1.25
  }else if (wAmount < 91150 && wAmount < 190150) {
    taxRate = 1.28
  }else if (wAmount < 190151 && wAmount < 413350) {
    taxRate = 1.33
  }else if (wAmount < 413351 && wAmount < 415050) {
    taxRate = 1.35
  }else if (wAmount > 415051) {
    taxRate = 1.396
  }

  while (appreciation>0 && (wAmount*taxRate)<appreciation){
    year += 1
    singleObj = {}
    singleObj['age'] = year
    appreciation = parseFloat(appreciation) - parseFloat(wAmount*taxRate)
    singleObj['savings'] = appreciation
    data.push(singleObj)
  }
  if (appreciation>0 && (wAmount*taxRate)>appreciation){
    singleObj = {}
    percentOfYear = appreciation/(wAmount*taxRate)
    singleObj['age'] = year + percentOfYear
    singleObj['savings'] = 0
    data.push(singleObj)
  }
  // console.log("trad data:");
  // console.log(data);
  return data

}
