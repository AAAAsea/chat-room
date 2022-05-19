export default function formatDate(size){
	if(size < 1024)
		return ~~(size/1024) + 'B'
	else if(size < 1024*1024)
		return ~~(size/1024) + 'KB'
	else if(size < 1024*1024*1024)
		return ~~(size/1024/1024) + 'M'		
}
