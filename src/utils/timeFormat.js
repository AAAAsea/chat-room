export default function formatDate(time){
	var date = time;
	var 
    // year = date.getFullYear(),
		month = date.getMonth()+1,//月份是从0开始的
		day = date.getDate(),
		hour = date.getHours(),
		min = date.getMinutes(),
		sec = date.getSeconds();

	var preArr = Array.apply(null,Array(10)).map(function(elem, index) {
		return '0'+index;
	});

  let newTime = '';
  if(new Date() - date > 24*60*60*1e3)
    newTime = (preArr[month]||month) + '-' + (preArr[day]||day) + ' ';
	newTime += 
				(preArr[hour]||hour) + ':' +
				(preArr[min]||min) + ':' +
				(preArr[sec]||sec);

	return newTime;			
}
