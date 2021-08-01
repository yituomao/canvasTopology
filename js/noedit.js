const ca = document.getElementById('ca')
const ctx = ca.getContext('2d')
let winW = window.innerWidth
ca.width = winW
ca.height = 400

const posit = ca.getBoundingClientRect()
var open_id = ''
let img_load_succ = false
const ctl = {
	status: 'normal',
	hover_obj: null,
	hover_type: '',
	hover_ind: '',
	no_obj: true,
	lock_ind: '',
	lock_type: '',
	noclick: false,
	title: ''
}
var url_list = [
	// 图片地址列表
	{
		url: 'img/zhuji.png',
		id: 0
	},
	{
		url: 'img/qiang.png',
		id: 1
	},
	{
		url: 'img/routers.png',
		id: 2
	},
	{
		url: 'img/hub.png',
		id: 3
	},
	{
		url: 'img/cloud.png',
		id: 4
	},
	{
		url: 'img/cloud.png',
		id: 5
	},
	{
		url: 'img/earth.png',
		id: 6
	},
	{
		url: 'img/ethnet.png',
		id: 7
	},
	{
		url: 'img/hub.png',
		id: 9
	},
	{
		url: 'img/pc.png',
		id: 8
	},
]
var imgGroup = [ ]
// 点和行对应关系：在点中按位置找到存在imgGroup或shapelist对应的点，连接两点（单独存两点会导致点与图没有对应关系，图动线不动）
var lineGroup = [ //存起点终点位置0-起点在imgGroup位置下标，1.起点在imgGroup中points序列中的下标（可能存在多个起点）2-终点下标1。。 3.。。终点下标2 5-起点类型（shapeList or imgGroup) 6-终点类型

]
var shapeList = [//0-形状类型1，2椭圆，3矩形 1-x 2-y 3-width 4-height 5-其它信息，6-点序列
	]


let act_line = null

var step = 80; //像素跨度，网格
let imgList = []



// let imgList = document.querySelectorAll('img')

function init() {
	// str为需要还原的数据
	let str={"imgGroup":[[0,485,99,80,80,[[2,54],[26,1],[0,28]],{"desc":"新的组件"}],[1,223,283,50,50,[[50,14],[26,2],[9,2]]]],"lineGroup":[[1,0,0,0,{"text":"出口专线的上行带宽大小、下行带宽大小、接收带宽使用率、发送带宽使用率、外网PING时延/丢包率"},"img","img"],[0,1,0,0,{"text":"双击修改文本"},"img","shape"],[0,1,1,1,{"text":"双击修改文本"},"shape","img"],[0,2,1,2,{"text":"双击修改文本"},"shape","img"],[0,3,0,2,{"text":"双击修改文本"},"shape","img"]],"shapeList":[[2,337,25,50,50,{"text":"文字","fontSize":12,"borderType":"solid","color":"#999","bgColor":"yellow","borderWidth":2,"textColor":"red","textFamily":"Arial","align":"center"},[[49,17],[30,49],[1,24],[44,40]]]],"url_list":[{"url":"img/zhuji.png","id":0},{"url":"img/qiang.png","id":1},{"url":"img/routers.png","id":2},{"url":"img/hub.png","id":3},{"url":"img/cloud.png","id":4},{"url":"img/cloud.png","id":5},{"url":"img/earth.png","id":6},{"url":"img/ethnet.png","id":7},{"url":"img/hub.png","id":9},{"url":"img/pc.png","id":8}]};

	if (str) {
		imgGroup = str.imgGroup
		lineGroup = str.lineGroup
		shapeList = str.shapeList
		url_list = str.url_list
	}


	// 还原数据，为imgGroup,lineGroup,shapeList赋值，格式以之前保存的为准，图片链接放进url_list中（图片id与imgGroup有对应关系）
	// 还原过后=>
	// 。。。
	let flag = 0
	url_list.forEach((item, i) => {
		let img = new Image()
		img.src = item.url
		img.id = item.id
		img.onload = function() {
			// console.log(flag)
			imgList.push(img)
			flag++;
			if (flag == url_list.length) {
				img_load_succ = true
				draw(99999, 0) //所有图片加载成功后绘制最开始的画面，不然会报错
			}
		}
	})

}
init()

function reset() {//清空画布
	ca.width = ca.width
	ca.height = ca.height

}
function draw(x = 9999, y = 0) {
	if (!img_load_succ) {
		return
	}
	reset()
	let hover_type = 'none' //鼠标在哪种类型元素上none,img,border,link
	let cursor = 'auto' //鼠标状态
	ctx.font = "bold 13px Arial"; //画笔样式
	let title = ''
	let tips=''

	ctx.beginPath();
	// console.log(step)
	if (step != 0) {//网格
		for (var i = 0; i * step < ca.height; i++) { //绘制行
			ctx.moveTo(0, i * step); //移动
			ctx.lineTo(ca.width, i * step); //画线
		}

		for (var i = 0; i * step < ca.width; i++) { //绘制列
			ctx.moveTo(i * step, 0); //移动
			ctx.lineTo(i * step, ca.height); //画线
		}

		ctx.closePath(); //闭环
		ctx.strokeStyle = "#e5e5e5"
		ctx.stroke(); //绘制
	}



	ctx.beginPath()

	ctx.rect(0, 0, ca.width, ca.height);
	ctx.closePath()
	if (ctx.isPointInPath(x, y)) {//整个canvas，还原状态
		cursor = 'auto'
		title = ''
		hover_type = 'none'
		ctl.hover_ind = -1
		tips=''
	}
	imgGroup.forEach((item, i) => {
		let img = imgList.find(function(obj) {
			return obj.id == item[0]
		})
		// console.log(item,imgList)
		let pat = ctx.createPattern(img, "repeat");
		// ctx.fillStyle=pat
		ctx.beginPath()
		ctx.drawImage(img, item[1], item[2], item[3], item[4])
		ctx.rect(item[1], item[2], item[3], item[4]);
		ctx.lineWidth = 5
		ctx.closePath()
		// ctx.fill();
		if (ctx.isPointInPath(x, y)) {
			cursor = 'auto'
			title = '双击调整参数，单击选中图案'
			hover_type = 'img'
			ctl.hover_ind = i

			ctx.strokeStyle = "pink"
			ctx.stroke()
			if(item[6]){
				tips=item[6].desc
			}
			
			if (ctx.isPointInStroke(x, y)) {
				cursor = 'crosshair'
				title = '当前位置可连线'

				// console.log(ctl.no_obj)
				hover_type = 'border'
				ctl.hover_ind = i
				// ctx.lineWidth = 5
				ctx.strokeStyle = "red"
				ctx.stroke()


			}
		} else {

			if (ctl.lock_type == 'img' && ctl.lock_ind === i) {
				ctx.strokeStyle = "orange"
				ctx.stroke()
			}

		}
		if (item[6]) { //描述
			ctx.font = "12px Arial"
			ctx.beginPath()

			//Place each word at y=100 with different textBaseline values
			ctx.textBaseline = "top";
			let textX = item[1] + item[3] / 2
			let textY = item[2] + item[4]
			ctx.fillStyle = "#999"
			ctx.textAlign = 'center'
			ctx.fillText(item[6].desc, textX, textY);
			ctx.closePath()

			// ctx.save()
			// ctx.translate(textX,textX)
			// ctx.rotate(Math.PI/6);
			// ctx.fillText("文字2", 0, 0);
			// ctx.restore()
		}


	})
	if (act_line != null && ctl.status == 'link') {
		ctx.beginPath();
		ctx.moveTo(act_line[0], act_line[1]);
		act_line[2] = x
		act_line[3] = y
		ctx.lineTo(x, y);
		// ctx.lineTo(300,600);

		ctx.closePath()
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 5

		ctx.strokeStyle = 'palegreen';
		ctx.stroke();


	}
	let p1, p2
	lineGroup.forEach((item, i) => {
		// console.log(item)
		// console.log(imgGroup)
		if(item[5]=='img'){
			p1 = [...imgGroup[item[0]][5][item[1]]]
			p1[0] += imgGroup[item[0]][1]
			p1[1] += imgGroup[item[0]][2]
		}else if(item[5]=='shape'){
			
			p1 = [...shapeList[item[0]][6][item[1]]]
			p1[0] += shapeList[item[0]][1]
			p1[1] += shapeList[item[0]][2]
		}
		if(item[6]=='img'){
			p2 = [...imgGroup[item[2]][5][item[3]]]
			p2[0] += imgGroup[item[2]][1]
			p2[1] += imgGroup[item[2]][2]

		}else if(item[6]=='shape'){
			p2 = [...shapeList[item[2]][6][item[3]]]
			p2[0] += shapeList[item[2]][1]
			p2[1] += shapeList[item[2]][2]

		}
// 		p1 = [...imgGroup[item[0]][5][item[1]]]
// 		p2 = [...imgGroup[item[2]][5][item[3]]]
// 
// 		p1[0] += imgGroup[item[0]][1]
// 		p1[1] += imgGroup[item[0]][2]
// 		p2[0] += imgGroup[item[2]][1]
// 		p2[1] += imgGroup[item[2]][2]
		// console.log(p1,p2)
		ctx.beginPath();
		ctx.moveTo(...p1);

		ctx.lineTo(...p2);
		// ctx.lineTo(300,600);

		ctx.closePath()
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 5
		

		// console.log(ctx)
		if (ctx.isPointInStroke(x, y)) {
			// console.log('true')
			ctl.hover_ind = i
			hover_type = 'line'
			ctx.strokeStyle = 'green';
			title = '双击修改描述文字'
			tips=item[4].text
			ctx.stroke();
		} else {
			ctx.strokeStyle = '#999';
			if (ctl.lock_ind == i && ctl.lock_type == 'line') {
				ctx.strokeStyle = 'orange';
			}
			ctx.stroke();
		}


	})
	shapeList.forEach((item, i) => {
		let param = item[5] || {}
		
		if (item[0] === 1) { //线
			ctx.beginPath();
			// console.log(item)
			ctx.moveTo(item[1], item[2]);

			ctx.lineTo(item[1] + item[3], item[2] + item[4]);
			// ctx.lineTo(300,600);
			if (param.borderType == 0) {
				ctx.setLineDash([10, 10, 10]);
			}
			ctx.lineWidth = param.borderWidth
			ctx.closePath()
			ctx.strokeStyle = item[5].borderColor;
			ctx.stroke()
		} else if (item[0] === 2) { //椭圆
			if (item[5]) { //描述
				ctx.fontSize = item[5].fontSize
				ctx.beginPath()

				//Place each word at y=100 with different textBaseline values
				ctx.textBaseline = item[5].align;
				let textX = item[1] + item[3] / 2
				let textY = item[2] + item[4]
				ctx.fillStyle = item[5].textColor
				ctx.textAlign = 'center'
				ctx.lineWidth = param.borderWidth
				ctx.fillText(item[5].text, textX, textY);
				ctx.closePath()


			}
			ctx.beginPath()
			if (param.borderType == 0) {
				ctx.setLineDash([10, 10, 10]);
			}
			ctx.strokeStyle = param.borderColor
			ctx.fillStyle = param.bgColor
			ctx.ellipse(item[1] + item[3] / 2, item[2] + item[4] / 2, item[3] / 2, item[4] / 2, 0, 0, Math.PI * 2)
			ctx.closePath()
			if (param.bgColor != '#000000') {
				ctx.fill()

			}
			ctx.stroke()

			// ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
		} else if (item[0] === 3) { //矩形
			if (item[5]) { //描述
				ctx.fontSize = item[5].fontSize
				ctx.beginPath()

				//Place each word at y=100 with different textBaseline values
				ctx.textBaseline = item[5].align;
				let textX = item[1] + item[3] / 2
				let textY = item[2] + item[4]
				ctx.fillStyle = item[5].textColor
				ctx.textAlign = 'center'
				ctx.lineWidth = param.borderWidth
				ctx.fillText(item[5].text, textX, textY);
				ctx.closePath()


			}
			ctx.beginPath()

			if (param.borderType == 0) {
				ctx.setLineDash([10, 10, 10]);
			}

			ctx.strokeStyle = param.color
			ctx.rect(item[1], item[2], item[3], item[4]);
			ctx.fillStyle = param.bgColor
			// ctx.fillRect(item[1], item[2], item[3], item[4]);
			ctx.closePath()
			if (param.bgColor != '#000000') {
				ctx.fill()

			}
			ctx.stroke()
		}
		if (ctx.isPointInPath(x, y)) {
			hover_type = 'shape'
			
			ctl.hover_ind = i
			tips=item[5].text
		}
		if (ctx.isPointInStroke(x, y)) {
			cursor = 'crosshair'
			title = '当前位置可连线'
			
			
			ctx.strokeStyle = "red"
			ctx.stroke()
			
			hover_type = 'borders'
			ctl.hover_ind = i
		}
		if (ctl.lock_type == 'shape' && ctl.lock_ind == i) {
			ctx.strokeStyle = 'orange'
			ctx.stroke()
		}
	})
	// if(ctl.no_obj===true){
	// 	$(ca).css({
	// 		cursor: 'auto',
	// 	
	// 	})
	// }
// 	$(ca).css({
// 		cursor: cursor,
// 
// 	})
if(tips==''){
	$('.shower').hide()
}else{
	$('.shower').show()
	$('.shower').html(tips)
}

	// $(ca).attr({
	// 	title: title
	// })
	ctl.hover_type = hover_type //
}



let container = document.getElementsByClassName('canvas')[0]
container.addEventListener('mousemove', function(e) {

$('.shower').css({
	left:e.clientX+5,
	top:e.clientY+5
})
	if (ctl.status == 'drag') {
		if (this.startType == 'img') {
			let obj = imgGroup[this.startInd]
			obj[1] = e.clientX - posit.left - obj[3] / 2
			obj[2] = e.clientY - posit.top - obj[4] / 2
		}
		if (this.startType == 'border'||this.startType == 'borders') {
			// act_line = [this.startX, this.startY, 0, 0, this.startInd]
			// ctl.status = 'link'
		}
		if (this.startType == 'shape') {
			let obj = shapeList[this.startInd]
			obj[1] = e.clientX - posit.left - obj[3] / 2
			obj[2] = e.clientY - posit.top - obj[4] / 2
		}

	}
	if (ctl.status == 'link') {

	}
	draw(e.clientX - posit.left, e.clientY - posit.top)
})
container.addEventListener('mousedown', function(e) {
	ctl.status = 'drag'
	this.startX = e.clientX - posit.left
	this.startY = e.clientY - posit.top
	this.startType=ctl.hover_type
	this.startInd=ctl.hover_ind
	
	// init(e.clientX-posit.left,e.clientY-posit.top)
})
container.addEventListener('mouseup', function(e) {


	if ((this.startX - e.clientX !== posit.left) && (this.startY - e.clientY !== posit.top)) {
		console.log('move')
		// e.preventDefault()
		// e.stopPropagation()
		ctl.noclick = true
	} else {
		ctl.noclick = false
	}
	ctl.status = 'normal'
	// init(e.clientX-posit.left,e.clientY-posit.top)
})
container.addEventListener('click', function(e) {
	console.log(ctl)
	if (ctl.hover_type == 'line' && ctl.hover_ind !== '') { //单击线条
		ctl.lock_ind = ctl.hover_ind
		ctl.lock_type = 'line'


	} else if (ctl.hover_type == 'img' && ctl.hover_ind !== '' && !ctl.noclick) { //单击图像
		ctl.lock_ind = ctl.hover_ind
		ctl.lock_type = 'img'
	} else if (ctl.hover_type == 'shape' && ctl.hover_ind !== '' && !ctl.noclick) { //单击形状
		ctl.lock_ind = ctl.hover_ind
		ctl.lock_type = 'shape'
	} else {
		ctl.lock_ind = ''
		ctl.lock_type = ''
	}
})






