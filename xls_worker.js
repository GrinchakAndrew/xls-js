
var config = {
	theWhat : {},
	sheetNames : '',
	range : '',
	newVal : '',
	wb : '',
	f : '',
	fnArr : [function(el){
			$(el).css('background-color') !== "rgba(0, 0, 0, 0)" ? 
			$(el).css('background-color', '') :
			$(el).css('background-color', '#CCEEFF');
		}],
	defPreventer : function(e) {
         e.originalEvent.stopPropagation();
    	 e.originalEvent.preventDefault();
		 config.fnArr.forEach(function(i, j){
			 if(typeof i == 'function') {
				 i(e.target);
			 }
		 });
		 config.fnArr = [];
    }, 
	init : function(){
		config.helper = [];
		$('#drag-and-drop').on(
		'dragover',
		config.defPreventer);
	
		$('#drag-and-drop').on(
			'dragenter',
		config.defPreventer);
	},
	
	onloadHandlerSub : function(i, a, wb, the_number_of_rows, b) {
										if(wb.Sheets.hasOwnProperty(i)) {
										for (var n = 0; n < the_number_of_rows; n++){
											var la = a+n;
											var row = n;
											if(wb.Sheets[i][la]){
												var dataSet = wb.Sheets[i][la];
												var textValue = dataSet['w'] ? dataSet['w'] : dataSet['v'];
												if(b == 0) {
													$('#table-preview tbody').append($("<tr></tr>", {"row": row, "column" : a}));
													$('#table-preview tbody tr').last().append($("<td></td>", {"lineNum" : n}).text(row));
													$('#table-preview tbody tr').last().append($("<td></td>", {"ref" : a+row}).text(textValue));
												}else{
													var lookup = '#table-preview tbody tr[row="'+row+'"]';
													$(lookup).append($("<td></td>", {"ref" : a+row}).text(textValue));
												}
											} else if(parseInt(la.match(/\d+/)) !== 0) {
												var lookup = '#table-preview tbody tr[row="'+ parseInt(la.match(/\d+/)) +'"]';
												if(!$(lookup).length){
													$('#table-preview tbody').append($("<tr></tr>", {"row": parseInt(la.match(/\d+/)), "column" : a}));
													$('#table-preview tbody tr').last().append($("<td></td>", {"lineNum" : parseInt(la.match(/\d+/))}).text(parseInt(la.match(/\d+/))));
												}
												$(lookup).append($("<td></td>", {"ref" : a+ row }).text("")); 
											}
										}
									}
			}, 
	htmlize : function() {
		config.wb.SheetNames.forEach(function(i, j) {
						if(config.wb.Sheets.hasOwnProperty(i)){
							var range = config.wb.Sheets[i]['!ref'];
							var the_number_of_rows = parseInt(range.split(':')[1].match(/\d+/)[0]);
							var letterRanges = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
							letterRanges.forEach(function(a, b) {
								var row = a+'0';
								if(b == 0) {
									$('#table-preview thead tr').first().append($("<td></td>", {"lineNum": row}).text('#'));
									$('#table-preview thead tr').first().append($("<td></td>", {"row": row}).text(a));
									config.onloadHandlerSub(i, a, config.wb, the_number_of_rows, b);
								}else if(Object.keys(config.wb['Sheets'][i]).some(function(el, i, arr) {
											 var rx = new RegExp(a+"\\d?");
											 return el.match(rx);
										})) {
									$('#table-preview thead tr').first().append($("<td></td>", {"row": row}).text(a));
									config.onloadHandlerSub(i, a, config.wb, the_number_of_rows, b);
								}
							});							
						}
					});
		
	}, 
	row : '',
	lineNum : '',
	colorSubroutine : function(el) {
		if(el && $(el).css('backgroundColor') && ($(el).css('background-color') == "rgb(170, 170, 170)")){
			$(el).css('backgroundColor', 'white');
		}else {
			$(el).css('backgroundColor', 'rgb(170, 170, 170)');	
			/*get the range by color!*/
			if(el.getAttribute('ref')){
				config.helper.push(el.getAttribute('ref'));
			}
		}
	},
	
	onclicker : function(e) {
		var trgt = e.target;
		if(trgt.tagName == "TD") {
			config.colorSubroutine(trgt);
			if(trgt.getAttribute('row') && $(trgt).closest('thead').length) {
				config.row = trgt.getAttribute('row').match(/\D+/);
				$('tbody tr').each(function(){
					$(this.children).each(function(){
						if($(this).attr('ref') && ~config.row.indexOf($(this).attr('ref').match(/\D+?/g)[0])){
							config.colorSubroutine(this);
						}
					});
				});
			if(config.helper.length) {
				Object.keys(config.theWhat).forEach(function(i, j) {
					config.theWhat[i] = [];
					config.helper.forEach(function(k, l) {
						var t = {};
						t[k] = '';
						config.theWhat[i].push(t);
					});
				});
			}
			}else if(trgt.getAttribute('linenum') && $(trgt).closest('tbody').length) {
				config.lineNum = trgt.getAttribute('lineNum').match(/\d+/);
				$('tbody tr').each(function(){
					$(this.children).each(function(){
						if(~config.lineNum.indexOf($(this).closest('tr').attr('row'))){
							config.colorSubroutine(this);
						}
					});
				});
				if(config.helper.length) {
					Object.keys(config.theWhat).forEach(function(i, j){
						config.theWhat[i] = [];
						config.helper.forEach(function(k, l){
							var t = {};
							t[k] = '';
							config.theWhat[i].push(t);
						});
					});
				}
			}
		}
	}, 
	
	processWb : function(){
					/*processing the workbook here:*/
					if(({}).toString.call(config.theWhat) == '[object Object]') {
							for (var sheet in config.theWhat){
								 
								if(config.theWhat[sheet] && ({}).toString.call(config.theWhat[sheet]) == '[object Array]') {
									 
									config.theWhat[sheet].forEach(function(i, j) {
										 
										for (var cell in i) {
											 
											if(cell.match(/[-]/)) {
											/*we have got a range!*/
												var s = cell.split('-')[0];
												var e = cell.split('-')[1];
												var sD = parseInt(s.match(/\d+/g)[0]);
												var eD = parseInt(e.match(/\d+/g)[0]);
												var rangeLetter = s.match(/\D+/g)[0];
												for (var y = sD; y < eD+1; y++) {
													if(config.wb.Sheets[sheet][rangeLetter+y]) {
														config.wb.Sheets[sheet][rangeLetter+y]['v'] = i[cell];
													} else {
														config.wb.Sheets[sheet][rangeLetter+y] = {t: "n", v: i[cell], f: '', w: "0"};
													}
												}
											} else {
												if(config.wb.Sheets[sheet][cell]){
												config.wb.Sheets[sheet][cell]['v'] = i[cell];
												}else {
													config.wb.Sheets[sheet][cell] = {t: "n", v: i[cell], f: '', w: "0"};
												}
											}
										}
									});
								}
							}
					}
						var wopts = { bookType:'xlsx', bookSST:false, type:'binary'};
						var wbout = XLSX.write(config.wb, wopts);
						function s2ab(s) {
						  var buf = new ArrayBuffer(s.length);
						  var view = new Uint8Array(buf);
						  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
						  return buf;
						}
						/* the saveAs call downloads a file on the local machine */
						saveAs(new Blob([s2ab(wbout)],{type:""}), "MyExcel.xlsx");
				}
};

$(document).ready(function() {
	config.init();
$('#drag-and-drop').on(
    'drop',
    function(e) {
		config.defPreventer(e);
        if(e.originalEvent.dataTransfer) {
            if(e.originalEvent.dataTransfer.files.length) {
				var files = e.originalEvent.dataTransfer.files;
					config.f = files[0];
				var reader = new FileReader(),
					name = config.f.name;
				reader.onload = function(e) {
					var data = e.target.result;
					config.wb = XLSX.read(data, {type: 'binary'});
					config.sheetNames = config.wb.SheetNames;
					config.sheetNames.forEach(function(i, j){
						 config.theWhat[i] = [{}];
					});
					if(!config.sheetNames.length){
						function UserException(message) {
						   this.message = message;
						   this.name = "UserException";
						}
						throw new UserException("The Excel File Seems To Have No Sheets!");
					}
					//make sure we have got only 1 sheet, because i do not have the multi-sheet representation:
					config.htmlize();
				};
				reader.readAsBinaryString(config.f);
				config.fnArr.push(function(el){
					$(el).css('background-color') !== "rgba(0, 0, 0, 0)" ? 
					$(el).css('background-color', '') :
					$(el).css('background-color', '#CCEEFF');
				});
				config.fnArr.forEach(function(i, j){
					 if(typeof i == 'function') {
						 i(e.target);
					 }
				 });
            }
        }
    }
);
	$(document).on('click', function(e){config.onclicker(e)});
	$('#textarea textarea').on('mousedown', function() {
		this.value = '';	
	});

	$('#process_wb').on('click', function() {
		var val = $('textarea').val();
		if(val &&  $('tbody').html() && $('textarea').val().match(/^\n?\s?\D+?\d+?\s?(?=[-])\s?[-]\s?\D+\d+\s?[:]\s?.*/)) {
			if(val.match(/new Date/) && $('textarea').val().match(/^\n?\s?\D+?\d+?\s?(?=[-])\s?[-]\s?\D+\d+\s?[:]\s?.*/)){
				config.range = val.match(/^\D+\d+[-]\D+\d+/);
				config.range[0] = config.range[0].replace(/\s+/g, '');
				var d = val.match(/[:](.*)/)[1];
				config.newVal = JSDateToExcelDate(new Function("return " + d+";")().getTime())
			}else if ($('textarea').val().match(/^\n?\s?\D+?\d+?\s?(?=[-])\s?[-]\s?\D+\d+\s?[:]\s?.*/)){
				val = val.replace(/\s+/g, '');
				config.range = val.match(/^\D+\d+[-]\D+\d+/);
				config.newVal = val.match(/[:](.*)$/)[1];	
			}
			
			Object.keys(config.theWhat).forEach(function(i, j) {
				if(config.theWhat[i].forEach){
					config.theWhat[i].forEach(function(z, w) {
						z[config.range] = config.newVal;
					});
				}
			});
			config.processWb();
		}else if(val &&  $('tbody').html() && ($('textarea').val().match(/^\n?\s?\d+\s?/) || $('textarea').val().match(/new Date/))) {
					// we end up here if the range was set by highlights: 
					if($('textarea').val().match(/new Date/)){
						var d = val;
						config.newVal = JSDateToExcelDate(new Function("return " + d+";")().getTime())
						val = config.newVal;
					}
					Object.keys(config.theWhat).forEach(function(i, j) {
						if(config.theWhat[i].forEach){
								config.theWhat[i].forEach(function(z, w) {
									z[Object.keys(z)[0]] = val;
								});
							}
					});
					config.processWb();
		}		
	});
	$('#clear_wb').on('click', function(e){
		$('table thead tr').html('');
		$('table tbody').html('');
	});
	
	
});


