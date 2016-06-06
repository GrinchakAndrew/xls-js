var config = {
	/*theWhat -> the number of sheets in the wb*/
	theWhat : {},
	sheetNames : '',
	range : '',
	newVal : '',
	workSheet : '',
	wb : '',
	f : '',
	clientNames : '', 
	tasksNames : '',
	tasksNumber : '',
	IDs : '',
	IDs_plus_Tasks : [],
	fnArr : [function(el) {
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
	
	init : function() {
		config.helper = [];
		$('#drag-and-drop').on(
		'dragover',
		config.defPreventer);
	
		$('#drag-and-drop').on(
			'dragenter',
		config.defPreventer);
	},
	table_template : '<table>'+'<thead>'+'<tr></tr>'+'</thead>'+'<tbody></tbody>'+'</table>',
	preview_template : '<div class="'+'table-preview">'+'</div>',
	/*helper-function to construct html-ized xlsx table*/
	onloadHandlerSub : function(i, a, wb, the_number_of_rows, b) {
										if(wb.Sheets.hasOwnProperty(i)) {
										for (var n = 0; n < the_number_of_rows; n++){
											var la = a+n;
											var row = n;
											if(wb.Sheets[i][la]){
												var dataSet = wb.Sheets[i][la];
												var textValue = dataSet['w'] ? dataSet['w'] : dataSet['v'];
												if(b == 0) {
													var selector1 = '.table-preview[sheet=' + '"' + i + '"'+']' + ' tbody';
													var selector2 = '.table-preview[sheet=' + '"' + i + '"'+']' + ' tbody tr';
													$(selector1).append($("<tr></tr>", {"row": row, "column" : a}));
													$(selector2).last().append($("<td></td>", {"lineNum" : n}).text(row));
													$(selector2).last().append($("<td></td>", {"ref" : a+row}).text(textValue));
													/* $('#table-preview tbody').append($("<tr></tr>", {"row": row, "column" : a}));
													$('#table-preview tbody tr').last().append($("<td></td>", {"lineNum" : n}).text(row));
													$('#table-preview tbody tr').last().append($("<td></td>", {"ref" : a+row}).text(textValue)); */
												}else{
													//var lookup = '.table-preview tbody tr[row="'+row+'"]';
													var lookup = '.table-preview[sheet=' + '"' + i + '"'+']' + ' tbody' + ' tr[row="'+row+'"]';
													$(lookup).append($("<td></td>", {"ref" : a+row}).text(textValue));
												}
											} else if(parseInt(la.match(/\d+/)) !== 0) {
												//var lookup = '.table-preview tbody tr[row="'+ parseInt(la.match(/\d+/)) +'"]';
												var lookup1 = '.table-preview[sheet=' + '"' + i + '"'+']' + ' tbody' +' tr[row="'+ parseInt(la.match(/\d+/)) +'"]';
												var lookup2 = '.table-preview[sheet=' + '"' + i + '"'+']' + ' tbody';
												var lookup3 = '.table-preview[sheet=' + '"' + i + '"'+']' + ' tbody tr';
												if(!$(lookup1).length){
													$(lookup2).append($("<tr></tr>", {"row": parseInt(la.match(/\d+/)), "column" : a}));
													$(lookup3).last().append($("<td></td>", {"lineNum" : parseInt(la.match(/\d+/))}).text(parseInt(la.match(/\d+/))));
												}
												$(lookup1).append($("<td></td>", {"ref" : a+ row }).text("")); 
											}
										}
									}
			}, 
	htmlize : function() {
		var subRoutine = function(i) {
			if(config.wb.Sheets.hasOwnProperty(i)) {
				/*appending the table-preview into the wrapper && the tableTab per each sheet*/
				var parser = new DOMParser(), 
					tableTab = parser.parseFromString(config.table_template, "text/html"), 
					tablePreview = parser.parseFromString(config.preview_template, "text/html");
					tablePreview = tablePreview.querySelector('.table-preview');
					tableTab = tableTab.querySelector('table');
					tablePreview.setAttribute('sheet', i);
					tableTab.setAttribute('sheet', i), 
					selector = '.table-preview[sheet=' + '"' + i + '"' + ']'; 
					document.querySelector('#wrapper').appendChild(tablePreview);
					document.querySelector(selector).appendChild(tableTab);
							var range = config.wb.Sheets[i]['!ref'];
							var the_number_of_rows = parseInt(range.split(':')[1].match(/\d+/)[0]);
							var letterRanges = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
							letterRanges.forEach(function(a, b) {
								var row = a+'0', 
									selector = '.table-preview table[sheet="'+ i + '"' + ']' + ' thead tr';
								if(b == 0) {
									$(selector).first().append($("<td></td>", {"lineNum": row}).text('#'));
									$(selector).first().append($("<td></td>", {"row": row}).text(a));
									config.onloadHandlerSub(i, a, config.wb, the_number_of_rows, b);
								}else if(Object.keys(config.wb['Sheets'][i]).some(function(el, i, arr) {
											 var rx = new RegExp(a+"\\d?");
											 return el.match(rx);
										})) {
									$(selector).first().append($("<td></td>", {"row": row}).text(a));
									config.onloadHandlerSub(i, a, config.wb, the_number_of_rows, b);
								}
							});							
			}
		};
		
		config.wb.SheetNames.forEach(function(i, j) {
			/*before calling the html-ize subRoutine, need to make sure each 
			 sheet is fitted to its own html tab!*/
			subRoutine(i);
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
					Object.keys(config.theWhat).forEach(function(i, j) {
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
	
	processWb : function() {
				/*processing the workbook here:*/
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
					/*get the number of worksheets, i.e., the tabs:*/
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
	/* $('#textarea textarea').on('mousedown', function() {
		this.value = '';	
	}); */
	
	/*processing the process the workbook btn*/
	$('#process_wb').on('click', function() {
		var val = $('textarea[id="range_new_val_text_area"]').val();
		/* config.workSheet = $('textarea[id="ws_text_area"]').val(); */
		/*match if we have got the Date to set to the table*/
		if(val &&  $('tbody').html() && $('textarea[id="range_new_val_text_area"]').val().match(/^\n?\s?\D+?\d+?\s?(?=[-])\s?[-]\s?\D+\d+\s?[:]\s?.*/)) {
			if(val.match(/new Date/) && $('textarea[id="range_new_val_text_area"]').val().match(/^\n?\s?\D+?\d+?\s?(?=[-])\s?[-]\s?\D+\d+\s?[:]\s?.*/)){
				config.range = val.match(/^\D+\d+[-]\D+\d+/);
				config.range[0] = config.range[0].replace(/\s+/g, '');
				var d = val.match(/[:](.*)/)[1];
				config.newVal = JSDateToExcelDate(new Function("return " + d+";")().getTime())
			}else if (val.match(/^\n?\s?\D+?\d+?\s?(?=[-])\s?[-]\s?\D+\d+\s?[:]\s?.*/)){
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
		/*match if we have got the other data to set*/
		}else if(val &&  $('tbody').html()) {
			//automation specifically for Natalia 
					// we end up here if the range was set by highlights: 
				var txtarea	= "";
					txtarea = $('textarea[id="range_new_val_text_area"]').val().replace(" ", "");
					txtarea = txtarea.match(/[{|A-Z|1-9|}].*/g);
					if($('textarea[id="range_new_val_text_area"]').val().match(/new Date/)) {
						var d = val;
						config.newVal = JSDateToExcelDate(new Function("return " + d+";")().getTime())
						val = config.newVal;
						console.log("new Date part of code has been matched!");
					}
					/*we check if we have a customized change request to automate: enclose all custom requests with {}*/
					if(txtarea[txtarea.length-1] == "}" && txtarea[0] == "{") {
					//1. get All Client_Names -> array
						var getItemNamesByColumn = function(workSheet, columnName, unique) {
							var workbook = config.wb.Workbook.Sheets;
							var letterRanges = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
							var returnable = [];
							workbook.forEach(function(sheet){
								if(sheet['name'] == workSheet) {
									var ref = config.wb.Sheets[sheet['name']]['!ref'];
									var upperBound = parseInt(config.wb.Sheets[sheet['name']]['!ref'].split(':')[1].match(/\d+/));
									letterRanges.forEach(function(letter) {
										var _columnName = config.wb.Sheets[sheet['name']][letter+1] ? config.wb.Sheets[sheet['name']][letter+1]['v'] : '';
										var theLetter = '';
											if(_columnName == columnName){
												theLetter = letter;
												while(upperBound > 1) {
													config.wb.Sheets[sheet['name']][theLetter + upperBound] && 
													config.wb.Sheets[sheet['name']][theLetter + upperBound]['v'] ? 
													returnable.push(config.wb.Sheets[sheet['name']][theLetter + upperBound]['v']) : 
													returnable; 
													upperBound--;
												}
											}
									});
								}
							});
							return returnable;
						};
						config.clientNames = getItemNamesByColumn('Campaigns', 'Client Name');
						//2. get All the Tasks_Names -> array
						config.tasksNames = getItemNamesByColumn('WBS', 'Task name');
						config.tasksNames.reverse();
						config.tasksNumber = getItemNamesByColumn('WBS', 'Task number');
						config.tasksNumber.reverse();
						
						//3. All IDs -> array
						config.IDs = getItemNamesByColumn('Campaigns', 'ID');
						//3.1 All IDs_+_Tasks -> array for SubTask Number 
						//config.IDs_+_Tasks = 
						//SubTask Number to place here! Final List
						for (var i = config.IDs.length; i--; ){
							 var returnable = [];
								for(var j = 0; j < config.tasksNumber.length; j++){
									returnable.push(config.IDs[i] + ' ' + config.tasksNumber[j]);
								}
						    config.IDs_plus_Tasks.push(returnable);
						}
						/*trimming the array of IDs_plus_Tasks by the number of the clients
						  against the situation when we have extra data over the number of the clients	
						*/
						config.IDs_plus_Tasks.splice(config.clientNames.length, config.IDs_plus_Tasks.length - config.clientNames.length);
						
						var rangeSeeker = function(workSheet /*Final List*/, columnName /*Oracle Project Name*/) {
							var workbook = config.wb['Workbook']['Sheets'];
							var range;
							var letterRanges = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
							var ref; 
							var splitRefArrOf2; 
							var upperBoundNum;
							var higherBoundNum;
							var upperBoundLetter;
							var lowerBoundLetter;
							var columnNameLetter;
							workbook.forEach(function(sheet) {
								if(sheet['name'] == workSheet) {
									ref = config.wb.Sheets[sheet['name']]['!ref'];
									splitRefArrOf2 = ref.split(':');
									upperBoundNum = parseInt(config.wb.Sheets[sheet['name']]['!ref'].split(':')[0].match(/\d+/));
									lowerBoundNum = parseInt(config.wb.Sheets[sheet['name']]['!ref'].split(':')[1].match(/\d+/));
									upperBoundLetter = ref.split(':')[0].match(/\D/)[0];
									lowerBoundLetter = ref.split(':')[1].match(/\D/)[0];
									/*
										у нас есть диапазон по всему листу. нужен диапазон по колонке! e.g., A2-A10
										найти букву колонки и применить к ней конечную границу листа, т.е.: lowerBoundLetter
										итерируй по буквам, чтобы найти букву твоей заданной колонки. нашёл - вертай такое: 
										letter + upperBoundLetter : letter + lowerBoundLetter в строке: 
										единственно неучтенный сценарий, если у нас пустые ячейки, а диапазон возвращается...
									*/ 
									for(var i = letterRanges.length; i--;) {
										if(config.wb.Sheets[sheet['name']][letterRanges[i] + upperBoundNum] && 
										   config.wb.Sheets[sheet['name']][letterRanges[i] + upperBoundNum]['v']){
											if(config.wb.Sheets[sheet['name']][letterRanges[i] + upperBoundNum]['v'] == columnName || 
											   config.wb.Sheets[sheet['name']][letterRanges[i] + upperBoundNum]['v'].includes(columnName)) {
												//range = letterRanges[i] + (upperBoundNum+1) + ":" + letterRanges[i] + lowerBoundNum;
												range = letterRanges[i] + (upperBoundNum+1) + ":" + letterRanges[i] + (upperBoundNum+1);
											}
										}
									}
								}
							});
							return range;
						};
						
						var writeable = function(workbook, range, data /*config.clientNames*/) {
									Object.keys(config.theWhat).forEach(function(i, j) {
										if(config.theWhat[i].forEach && i == workbook) {
											config.theWhat[i].forEach(function(z, w) {
												var splitRange = range.split(':');
												var startRange = range.split(':')[0];
												var startRangeLetter = splitRange[0].match(/\D+/)[0];
												var startRangeNumber = parseInt(splitRange[1].match(/\d+/)[0]);
												for (var iter = 0; iter < data.length; iter++) {
													z[startRange + '-' + startRangeLetter + (startRangeNumber+iter)] = data[iter];
												}
											});
										}
								});
							};
							
							var rangeIncrementer = function(range, byNum) {
								var interim = range.split(':'),
									interimLowerBound = interim[1], 
									interimLowerBoundLetter = interim[1].match(/\D+/)[0], 
									interimLowerBoundNumber = parseInt(interim[1].match(/\d+/)[0]); 
									interimLowerBoundNumber = interimLowerBoundNumber + byNum-1; //changed to skip the empty line in-between
									interim[1] = interimLowerBoundLetter + interimLowerBoundNumber;
									range = range.replace(/[A-Z]\d+$/, interim[1]);
									return range;
							};
							
							var clientNamesRange = rangeSeeker('Final List', 'Oracle Project Name');
							var IDs_plus_TasksRange = rangeSeeker('Final List', 'SubTask Number');
							var tasksRange = rangeSeeker('Final List', 'SubTask Name');
							var subTaskDescriptionRange = rangeSeeker('Final List', 'SubTask Description');
							
							config.clientNames.forEach(function(clientName) {
								console.log(clientName, "config.clientNames.forEach(function(clientName) {");
								//4.1. Client_Name copyTo B2-B[Client_Names.length], Final List
								var clientNamesArr = [];
								for (var i = 0; i < config.tasksNames.length; i++){
									clientNamesArr.push(clientName);
								}
								writeable('Final List', clientNamesRange, clientNamesArr);
								//4.2. IDs_+_Task copyTo D2-D[IDs_+_Tasks.length], Final List
								writeable('Final List', IDs_plus_TasksRange, config.IDs_plus_Tasks[0]);
								config.IDs_plus_Tasks.splice(0, 1);
								//4.3. Tasks_Name copyTo F2-F[Tasks_Names.length], Final List
								writeable('Final List', tasksRange, config.tasksNames);
								writeable('Final List', subTaskDescriptionRange, config.tasksNames);
								clientNamesRange = rangeIncrementer(clientNamesRange, config.tasksNames.length+1);
								tasksRange = rangeIncrementer(tasksRange, config.tasksNames.length+1);
								IDs_plus_TasksRange = rangeIncrementer(IDs_plus_TasksRange, config.tasksNames.length+1);
								subTaskDescriptionRange = rangeIncrementer(subTaskDescriptionRange, config.tasksNames.length+1);
							});
							
							console.log(config.theWhat['Final List'][0]);
							
							for (var sheet in config.theWhat){
								if(config.theWhat[sheet] && ({}).toString.call(config.theWhat[sheet]) == '[object Array]') {
									config.theWhat[sheet].forEach(function(range_value_pair, j) {
										for (var cell in range_value_pair) {
											if(cell.match(/[-]/)) {
												var column = cell.split('-')[0];
												var row = cell.split('-')[1];
												var rowNumber = parseInt(row.match(/\d+/)[0]);
												var rangeLetter = column.match(/\D+/g)[0];
												var val = range_value_pair[cell];
												var ref = config.wb.Sheets[sheet]['!ref'];
												var refLowerBound = parseInt(config.wb.Sheets[sheet]['!ref'].split(':')[1].match(/\d+/));
												if(rowNumber > refLowerBound){
													config.wb.Sheets[sheet]['!ref'].replace(/\d+$/, rowNumber);
												}
												if(config.wb.Sheets[sheet][rangeLetter + rowNumber]) {
													config.wb.Sheets[sheet][rangeLetter + rowNumber]['v'] = val;
												} else {
													config.wb.Sheets[sheet][rangeLetter + rowNumber] = {t: "n", v: val, f: '', w: "0"};
												}
											}
										}
									});
								}
							}
							
							
							config.processWb();
					}
					
		}		
	});
	/*onclick on the btn clear the workbook will clear the area with the html-ised workbook*/
	$('#clear_wb').on('click', function(e){
		$('.table-preview').html('');
	});
	
	
});


