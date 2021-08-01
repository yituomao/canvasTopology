const ca = document.getElementById('ca')
const ctx = ca.getContext('2d')
let winW = window.innerWidth
// 宽高，
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
var imgGroup = [ //0-图片index 1-x 2-y 3-width 4-height 5-points[] 6-其它信息{}
	[0, 0, 0, 80, 80, [], {
		desc: '新的组件'
	}],
	[1, 100, 100, 50, 50]
]
// 点和行对应关系：在点中按位置找到存在imgGroup或shapelist对应的点，连接两点（单独存两点会导致点与图没有对应关系，图动线不动）
var lineGroup = [ //存起点终点位置0-起点在imgGroup位置下标，1.起点在imgGroup中points序列中的下标（可能存在多个起点）2-终点下标1。。 3.。。终点下标2 5-起点类型（shapeList or imgGroup) 6-终点类型

]
var shapeList = [//0-形状类型1，2椭圆，3矩形 1-x 2-y 3-width 4-height 5-其它信息（对象），6-点序列(数组)
	[2, 200, 100, 50, 50, {
		text: '文字',
		fontSize: 12,
		borderType: 'solid',
		color: '#999',
		bgColor: 'yellow',
		borderWidth: 2,
		textColor: 'red',
		textFamily: 'Arial',
		align: 'center'
	},[]]

]
let act_line = null

var step = 80; //像素跨度，网格
let imgList = []



// let imgList = document.querySelectorAll('img')

function init() {
	// str为需要还原的数据
	let str;

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


function draw(x = 9999, y = 0) {
	if (!img_load_succ) {
		return
	}
	reset()
	let hover_type = 'none' //鼠标在哪种类型元素上none,img,border,link
	let cursor = 'auto' //鼠标状态
	ctx.font = "bold 13px Arial"; //画笔样式
	let title = ''


	ctx.beginPath();
	// console.log(step)
	if (step != 0) {
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
	if (ctx.isPointInPath(x, y)) {
		cursor = 'auto'
		title = ''
		hover_type = 'none'
		ctl.hover_ind = -1
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
		ctx.lineWidth = 3
		if (item[4]) {
			let textX = (p1[0] + p2[0]) / 2
			let textY = (p1[1] + p2[1]) / 2
			let arcs = Math.atan((p1[1] - p2[1]) / (p1[0] - p2[0]))
			ctx.textBaseline = "top";

			ctx.save()
			ctx.translate(textX, textY)
			ctx.rotate(arcs);
			ctx.fillText(item[4].text, 0, 5);
			ctx.restore()
		}

		// console.log(ctx)
		if (ctx.isPointInStroke(x, y)) {
			// console.log('true')
			ctl.hover_ind = i
			hover_type = 'line'
			ctx.lineWidth =5

			ctx.strokeStyle = 'green';
			title = '双击修改描述文字'

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
		if (item[5]) { //描述
			ctx.font = item[5].fontSize+'px '+item[5].fontFamily
			ctx.beginPath()
		
			//Place each word at y=100 with different textBaseline values
			ctx.textBaseline = item[5].align;
			let textX = item[1] + item[3] / 2
			let textY = item[2] + item[4]
			ctx.fillStyle = item[5].textColor
			ctx.textAlign = item[5].align
			ctx.lineWidth = param.borderWidth
			ctx.fillText(item[5].text, textX, textY);
			ctx.closePath()
		
		
		}
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
			
			ctx.beginPath()
			if (param.borderType == 0) {
				ctx.setLineDash([10, 10, 10]);
			}
			ctx.strokeStyle = param.borderColor
			ctx.fillStyle = param.bgColor
			ctx.ellipse(item[1] + item[3] / 2, item[2] + item[4] / 2, item[3] / 2, item[4] / 2, 0, 0, Math.PI * 2)
			ctx.closePath()
			if (param.bgColor != '#000000') {//如果为黑色，则不填充背景
				ctx.fill()

			}
			ctx.stroke()

			// ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
		} else if (item[0] === 3) { //矩形
			
			ctx.beginPath()

			if (param.borderType == 0) {
				ctx.setLineDash([10, 10, 10]);
			}

			ctx.strokeStyle = param.borderColor
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
	$(ca).css({
		cursor: cursor,

	})
	$(ca).attr({
		title: title
	})
	ctl.hover_type = hover_type //
}


function reset() {//清空画布
	ca.width = ca.width
	ca.height = ca.height

}
let container = document.getElementsByClassName('canvas')[0]
container.addEventListener('mousemove', function(e) {


	if (ctl.status == 'drag') {
		if (this.startType == 'img') {
			let obj = imgGroup[this.startInd]
			obj[1] = e.clientX - posit.left - obj[3] / 2
			obj[2] = e.clientY - posit.top - obj[4] / 2
		}
		if (this.startType == 'border'||this.startType == 'borders') {
			act_line = [this.startX, this.startY, 0, 0, this.startInd]
			ctl.status = 'link'
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

	if (ctl.status == 'link') {
		console.log('end_line')
		
		if((act_line[4] != ctl.hover_ind&&this.startType==ctl.hover_type)||(this.startType!=ctl.hover_type&&(ctl.hover_type=='border'||ctl.hover_type=='borders'))){
			let stype,etype,sind,eind;
			// 起点
			if(this.startType=='border'){
				stype='img'
				act_line[0] -= imgGroup[act_line[4]][1]
				act_line[1] -= imgGroup[act_line[4]][2]
				if (imgGroup[act_line[4]][5] instanceof Array) {
					imgGroup[act_line[4]][5].push(act_line.slice(0, 2))
				
				} else { //起点坐标集
					imgGroup[act_line[4]][5] = [act_line.slice(0, 2)]
				}
				sind=imgGroup[act_line[4]][5].length - 1
			}else if(this.startType=='borders'){
				stype='shape'
				act_line[0] -= shapeList[act_line[4]][1]
				act_line[1] -= shapeList[act_line[4]][2]
				if (shapeList[act_line[4]][6] instanceof Array) {
					shapeList[act_line[4]][6].push(act_line.slice(0, 2))
				
				} else { //起点坐标集
					shapeList[act_line[4]][6] = [act_line.slice(0, 2)]
				}
				sind=shapeList[act_line[4]][6].length - 1

			}
			// 终点
			if(ctl.hover_type=='border'){
				etype='img'
				act_line[2] -= imgGroup[ctl.hover_ind][1]
				act_line[3] -= imgGroup[ctl.hover_ind][2]
				if (imgGroup[ctl.hover_ind][5] instanceof Array) {
					imgGroup[ctl.hover_ind][5].push(act_line.slice(2, 4))
				
				} else { //终点坐标集
					imgGroup[ctl.hover_ind][5] = [act_line.slice(2, 4)]
				}
				eind=imgGroup[ctl.hover_ind][5].length -1
			}else if(ctl.hover_type=='borders'){
				etype='shape'
				act_line[2] -= shapeList[ctl.hover_ind][1]
				act_line[3] -= shapeList[ctl.hover_ind][2]
				if (shapeList[ctl.hover_ind][6] instanceof Array) {
					shapeList[ctl.hover_ind][6].push(act_line.slice(2, 4))
				
				} else { //终点坐标集
					shapeList[ctl.hover_ind][6] = [act_line.slice(2, 4)]
				}
				eind=shapeList[ctl.hover_ind][6].length -1

				// console.log(shapeList[ctl.hover_ind][6])
			}
			console.log(stype,etype,sind,eind)
			lineGroup.push([act_line[4], sind, ctl.hover_ind, eind, {
					text: '双击修改文本'
				},stype,etype
			])
		}
		
		act_line = null
// 		if (act_line[4] != ctl.hover_ind && ctl.hover_type == 'border') {
// 			// 起点
// 			let sp = imgGroup[act_line[4]]
// 			let ep = imgGroup[ctl.hover_ind]
// 			act_line[0] -= imgGroup[act_line[4]][1]
// 			act_line[1] -= imgGroup[act_line[4]][2]
// 			// 终点
// 			act_line[2] -= imgGroup[ctl.hover_ind][1]
// 			act_line[3] -= imgGroup[ctl.hover_ind][2]
// 			// console.log(act_line)
// 			if (imgGroup[act_line[4]][5] instanceof Array) {
// 				imgGroup[act_line[4]][5].push(act_line.slice(0, 2))
// 
// 			} else { //起点坐标集
// 				imgGroup[act_line[4]][5] = [act_line.slice(0, 2)]
// 			}
// 			if (imgGroup[ctl.hover_ind][5] instanceof Array) {
// 				imgGroup[ctl.hover_ind][5].push(act_line.slice(2, 4))
// 
// 			} else { //终点坐标集
// 				imgGroup[ctl.hover_ind][5] = [act_line.slice(2, 4)]
// 			}
// 			// 
// 			lineGroup.push([act_line[4], imgGroup[act_line[4]][5].length - 1, ctl.hover_ind, imgGroup[ctl.hover_ind][5].length -
// 				1, {
// 					text: '双击修改文本'
// 				},'img'
// 			])
// 		}
// 		act_line = null
	}
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
container.addEventListener('dblclick', function(e) { //双击图像
	if (ctl.hover_type == 'img' && ctl.hover_ind !== '') {
		console.log(ctl.hover_ind)
		ctl.lock_ind = ctl.hover_ind
		ctl.lock_type = 'img'
		layui.form.val('formDemo',
			imgGroup[ctl.hover_ind][6]
		)
		open_id = layer.open({
			type: 1,
			title: '参数配置',
			area: ['80%', '600px'], //宽高
			content: $('#changeParam'),
		})

	} else if (ctl.hover_type == 'line' && ctl.hover_ind !== '') { //双击线条
		ctl.lock_ind = ctl.hover_ind
		ctl.lock_type = 'line'

		//多窗口模式，层叠置顶
		//例子2
		layer.prompt({
			formType: 2,
			value: lineGroup[ctl.lock_ind][4].text,
			title: '修改文本',
			offset: [100, 100],
			area: ['200px', '200px'] //自定义文本域宽高
		}, function(value, index, elem) {
			lineGroup[ctl.lock_ind][4].text = value
			layer.close(index);
		});
		draw(99999, 0)
	} else if (ctl.hover_type == 'shape' && ctl.hover_ind !== '') { //双击形状
		console.log(ctl.hover_ind)
		ctl.lock_ind = ctl.hover_ind
		ctl.lock_type = 'shape'
	layui.form.val('shapeForm',
		shapeList[ctl.hover_ind][5]
	)
			// layui.form.val("shapeForm", shapeList[ctl.lock_ind][5]);
			console.log(layui.form)
		open_id = layer.open({
			type: 1,
			title: '参数配置',
			area: ['80%', '600px'], //宽高
			content: $('#shapeParam'),
		})
	}

})


function delLine() { //移除线条
	if (ctl.lock_type == 'line') {
		lineGroup.splice(ctl.lock_ind, 1)
		ctl.lock_ind = ''
		draw(999999, 0)
	}

}

function addImg() {
	imgGroup.push([0, 0, 0, 50, 50])
	draw(999999, 0)

}

function changeImg(data) { //图像修改
	console.log(data)
	
	// 
	imgGroup[ctl.lock_ind][6] = data
	if (data.width != '') {
		imgGroup[ctl.lock_ind][3] = data.width
	}
	if (data.height != '') {
		imgGroup[ctl.lock_ind][4] = data.height
	}
	if (data.images != '') {
		let ind=url_list.findIndex(item=>{return item.url==data.images})
		if(ind==-1){
			console.log(111)
			let id=url_list.length
			
			let img = new Image
			img.src = data.images
			img.id=id
			url_list.push({id:id,url:data.images})
			img.onload=function(){
				
				imgList.push(img)
				imgGroup[ctl.lock_ind][0] =id
				
				draw(999999, 0)
			}
		}else{
			imgGroup[ctl.lock_ind][0] =url_list[ind].id
		}
		
	
	}else{//如果没有图片就用默认的
		imgGroup[ctl.lock_ind][0] = data.type
		draw(999999, 0)
	}
	
	layer.close(open_id)
}

function removeImg() {
	if (ctl.lock_type == 'img'&&ctl.lock_ind!=-1) {

		let delgroup = []
		lineGroup.forEach((item, i) => {
			if(item[5]=='img'){
				if (item[0] > ctl.lock_ind) { //如果线的起点在前面的图
					item[0] -= 1
				} else if (item[0] === ctl.lock_ind) { //如果线的起点在图上
					delgroup.push(i)
				
				}
			}
			if(item[6]=='img'){
				if (item[2] > ctl.lock_ind) { //如果线的终点在前面的图
					item[2] -= 1
				} else if (item[2] === ctl.lock_ind) { //如果线的终点在图上
					delgroup.push(i)
				
				}
			}
			
		})

		console.log(lineGroup)
		delgroup.sort(function(a, b) {
			return a - b
		}).reverse().forEach(item => { //排序反向按index顺序删除
			lineGroup.splice(item, 1)
		})
		console.log(delgroup)
		imgGroup.splice(ctl.lock_ind, 1)
	}
	draw(999999, 0)
ctl.lock_ind=-1
}

function gridChange(n) { //网格


	step = n
	draw(999999, 0)

}

function addShape() {
	shapeList.push([3, 200, 100, 50, 50, {
		text: '文字',
		fontSize: 12,
		borderType: 'solid',
		color: '#999',
		bgColor: 'yellow',
		borderWidth: 2,
		textColor: 'red',
		textFamily: 'Arial',
		align: 'center'
	}])
	draw(999999, 0)

}

function removeShape() {
	if (ctl.lock_type == 'shape'&&ctl.lock_ind!=-1) {
			let delgroup = []
			lineGroup.forEach((item, i) => {
				if(item[5]=='shape'){
					if (item[0] > ctl.lock_ind) { //如果线的起点在前面的图
						item[0] -= 1
					} else if (item[0] === ctl.lock_ind) { //如果线的起点在图上
						delgroup.push(i)
					
					}
				}
				if(item[6]=='shape'){
					if (item[2] > ctl.lock_ind) { //如果线的终点在前面的图
						item[2] -= 1
					} else if (item[2] === ctl.lock_ind) { //如果线的终点在图上
						delgroup.push(i)
					
					}
				}
				
			})
		
			console.log(lineGroup)
			delgroup.sort(function(a, b) {
				return a - b
			}).reverse().forEach(item => { //排序反向按index顺序删除
				lineGroup.splice(item, 1)
			})
			console.log(delgroup)
			shapeList.splice(ctl.lock_ind, 1)
		
		
		ctl.lock_ind = -1
		draw()
	}
}

function changeShape(data) {//形状修改
	console.log(data)
	let shape = data.shape == 'line' ? 1 : data.shape == 'rect' ? 3 : 2;
	let item = shapeList[ctl.lock_ind]
	shapeList[ctl.lock_ind] = [
		shape, parseInt(data.posit_x) || item[1], parseInt(data.posit_y) || item[2], parseInt(data.width) || item[3],
		parseInt(data.height) || item[4], {
			text: data.text,
			fontSize: data.fontSize,
			borderType: data.borderType,
			color: data.color,
			bgColor: data.bgColor,
			borderWidth: data.borderWidth,
			textColor: data.textColor,
			textFamily: data.fontFamily,
			align: data.align,
			borderColor: data.borderColor
		}
	]
	layer.close(open_id)
	draw()
}

function save() { //保存
	let str = JSON.stringify({
		imgGroup,
		lineGroup,
		shapeList,
		url_list
	})
	console.log(str)
	console.log(imgGroup) //图像数据
	console.log(lineGroup) //线的数据
	console.log(shapeList) //形状数据
	layer.open({
		type: 1,
		title: '数据',
		area: ['80%', '600px'], //宽高
		content: str,
	})
// 	var strDataURI = ca.toDataURL()
// 
// 	const el = document.createElement('a');
// 	// 设置 href 为图片经过 base64 编码后的字符串，默认为 png 格式
// 	el.href = ca.toDataURL();
// 	el.download = '文件名称';
// 
// 	// 创建一个点击事件并对 a 标签进行触发
// 	const event = new MouseEvent('click');
// 	// el.dispatchEvent(event);//下载图片
// 
}
