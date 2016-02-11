


var GROUND_KEY = 1;
var CABLE_KEY = 2;
var GROUND_NAME = 'ground';
var CABLE_NAME = 'cable';
var DEBUG = true;
var TEST_TIMETABLE = true;

$(document).ready(function(){
  printLog("call document ready");
  $('.move_broadcasting').click(function(){
    printLog("click move broadcasting");
    showBroadcastingPage(this.title);
  });	
});

function showBroadcastingPage(aBroadcasting)
{
  printLog("call showBroadcastingPage");
  var url = getBroadcastringFileUrl(aBroadcasting);
  getUsedAjax(url,handleGetBroadcastingList);  
};

function getBroadcastringFileUrl(aBroadcasting)
{
  printLog("call getBroadcastringFileUrl");
  if (aBroadcasting==GROUND_KEY)
  {
    var file_name =  GROUND_NAME;
  }
  else
  {
    var file_name = CABLE_NAME;
  }
  return "./files/"+file_name+".txt";
};

function getTimeTableUrl(aKey)
{
  printLog("call getTimeTableUrl");
  var today = getToday();
  if (TEST_TIMETABLE) return './files/ex_timetalb.html';
  return 'http://m.news.naver.com/broadcast/programList.nhn?menu=2&groupId=1&chNo='+aKey+'&date='+today+'';
}

function handleGetBroadcastingList(data)
{
  printLog("call handleGetBroadcastingList");
  printLog(data);  
  var html = getBroadcastingListHtml(data);  
  showingHtmlPage("#broadcasting",html);
  
  $(".move_timetable").click(function(){
    printLog("click move timetable");
    showTimeTablePage(this.title);
  });	  
};


function getBroadcastingListHtml(aData)
{
  var broadcastingLineArray = splitData(aData,"^");  
  var html = '';
  html += '<ul class="rounded">';
  for (var index=0;index < broadcastingLineArray.length;index++)
  {
    var tempBroadcastingLine = jQuery.trim(broadcastingLineArray[index]);    
    var tempBroadcastingSection = splitData(tempBroadcastingLine,"|");
    printLog(tempBroadcastingLine);       
    printLog(tempBroadcastingSection);
    var name = tempBroadcastingSection[0];
    var key = tempBroadcastingSection[1];
    html += '<li class="arrow"><a title ="'+key+'" value="'+name+'" class="move_timetable" href="#">'+name+'</a></li>';
  }  
  html += '</ul>';
  return html;
}
function getToday()
{
  printLog("call getToday");
  var date = new Date();  
  return date.format("yyyymmdd")
}

function showTimeTablePage(key)
{
  printLog("call showTimeTablePage");
  var url = getTimeTableUrl(key);
  printLog(url);
  getUsedAjax(url,handleGetTimeTable);  
}
function handleGetTimeTable(data)
{
  printLog("call handleGetTimeTable");  
  var html = getTimeTableHtml(data);
  showingHtmlPage("#timetable",html);
};

function showingHtmlPage(elementId,aHtml)
{
  var wrapperDiv = getJqtCurrentPageWrapper(elementId); 
  emptyHTML(wrapperDiv);  
  var insert = $(aHtml);  	
  $(wrapperDiv).append(insert);  
  goToPage(elementId,'slideleft');
};

function getTimeTableHtml(aData)
{
  var timeTableArray = splitData(aData,"<li>");
  printLog(timeTableArray.length);
  var html = '<ul>';  
  for (var index=1;index<timeTableArray.length-1 ;index++ )
  {
    html += '<li>';
    printLog(timeTableArray[index]);
	html += timeTableArray[index];
	html += '</li>';    
  }
  html += '</ul>';
  return html;
};



function printLog(message)
{
  if (DEBUG){
    console.info(message);
  }
};
function splitData(data,separator) {
	return data.split(separator);	
};
function getUsedAjax(aUrl,callbackFunc)
{
  printLog("call getUsedAjax");  
  $.ajax({
    url:aUrl,
    error : function(e){
      console.info(e.message);
      return false;
    },
    success : function(data){       
      callbackFunc(data);
    }
  })
};
function emptyHTML(Id){
  printLog("call emptyHTML");  
  $(Id).empty();
};
function goToPage(pageId,event,reverse) {
  printLog("call goToPage");  
  if (event==null) event='';
  if (reverse==null) reverse=false;
  jQT.goTo(pageId,event,reverse);	
};
function getJqtCurrentPageWrapper(pageId) {
  printLog("call getJqtCurrentPageWrapper");  
  var wrapperPage = pageId+'-wrapper';
  return wrapperPage;
};


/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};