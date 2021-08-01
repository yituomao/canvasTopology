const ca=document.getElementById('ca')
const ctx=ca.getContext('2d')
ca.width=1200
ca.height=500
const posit=ca.getBoundingClientRect()
const container=document.getElementsByClassName('canvas')[0]
container.addEventListener('mousedown',function(e){
	ctl.startX=e.clientX-posit.x
	ctl.mousedown=true
	ctl.startY=e.clientY-posit.y
	// console.log(ctl.startX,ctl.startY)
})
container.addEventListener('mouseup',function(e){
	// ctl.line_start=false
	ctl.endX=e.clientX-posit.x
	ctl.mousedown=false
	ctl.mouseup=true
	ctl.line_start=false
	ctl.endY=e.clientY-posit.y
	if(!ctl.updiv){
		ctl.line_group.splice(line_id,1)
	}
	ctl.drag_el=true
	

})
container.addEventListener('mousemove',function(e){
	
	if(ctl.drag_el===true&&ctl.mousedown&&ctl.updiv){//拖动中
	ctl.add_line=false
		let div=divGroup[ctl.drag_div_id]
		let img=imgGroup[ctl.drag_div_id]
		div.x=e.clientX-$(div).width()/2-getOffsetLeft(div)+div.offsetLeft
		div.y=e.clientY-$(div).height()/2-getOffsetTop(div)+div.offsetTop
		$(div).css({
			left:div.x,
			top:div.y
		})
		
		reset()
		img.x1=div.x
		img.y1=div.y
		// draw()
	}
	if(ctl.line_start===true&&ctl.updiv===false&&ctl.mousedown===true){//画线中
		let line=[[ctl.startX,ctl.startY,e.clientX-posit.x,e.clientY-posit.y]]
			
		ctl.line_group[line_id]=line
		// draw(e.clientX,e.clientY)
		// if(!Array.isArray(ctl.line_group[ctl.parentId])){
		// 	ctl.line_group[ctl.parentId]=new Array()
		// }
		// ctl.line_group[ctl.parentId][line.id]=line
		// draw(e.clientX,e.clientY)
	}
	draw(e.clientX,e.clientY)
})


var getOffsetLeft = function(obj){
              var tmp = obj.offsetLeft;
              var val = obj.offsetParent;
              while(val != null){
              tmp += val.offsetLeft;
                val = val.offsetParent;
               }
            return tmp;
            }
		var getOffsetTop =  function(obj){
               var tmp = obj.offsetTop;
               var val = obj.offsetParent;
             while(val != null){
                tmp += val.offsetTop;
               val = val.offsetParent;
               }
                return tmp;
             }
const ctl={
	mousedown:false,
	mouseup:false,
	add_line:false,
	drag_el:true,
	drag_flag:false,
	line_flag:false,
	line_group:[],
	box_group:[],
	line_start:false,
	line_end:false,
	startX:0,
	startY:0,
	endX:0,endY:0,
	select_line:false,
	parentId:'',
	updiv:false,
	updivid:'',
	drag_div_id:'',
	draw_line_id:''
}
function reset(){
	ca.width=1200
	ca.height=500
}
function draw(x,y){
	x=x-posit.x
	y=y-posit.y
	reset()
	
	imgGroup.forEach(item=>{
		
		ctx.drawImage(item,item.x1,item.y1,120,120)
		
	})
	ctl.line_group.forEach(item=>{
		ctx.beginPath();
		ctx.moveTo(item[0][0],item[0][1]);
		ctx.lineTo(item[0][2],item[0][3]);
		// ctx.lineTo(300,600);
		
		ctx.closePath()
		ctx.strokeStyle = 'blue';
		ctx.lineWidth=5
		// console.log(ctx)
		 if(ctx.isPointInStroke(x,y)&&ctl.select_line===true) {
			
			 ctx.strokeStyle = 'green';
			 ctx.stroke();
			} else {
			  ctx.strokeStyle = 'pink';
			  ctx.stroke();
			}
		
	})

	
}
function addLine(){
	console.log('ct')
	ctl.add_line=true
	ctl.drag_el=false
}
function delLine(){
	ctl.select_line=true
}
function AddElement(x,y){
	this.x=x;
	this.y=y;
	this.div=null
	this.img=null
	this.line=null
	this.line_all=0
	var that=this
	this.dragStart=function(e){
		this.flag=1
		ctl.drag_div_id=this.id
		ctl.drag_flag=true
		this.startX=e.clientX-posit.x
		this.startY=e.clientY-posit.y
		ctl.startX=e.clientX-posit.x
		ctl.startY=e.clientY-posit.y
		if(ctl.add_line===true){
			console.log('llll')
		}
	}
	this.draging=function(e){
		
		if(this.flag===1&&ctl.drag_el===true){
			
			// let x=e.clientX-$(this).width()/2-getOffsetLeft(this)+this.offsetLeft
			// let y=e.clientY-$(this).height()/2-getOffsetTop(this)+this.offsetTop
			// $(this).css({
			// 	left:x,
			// 	top:y
			// })
			// 
			// reset()
			// 
			// ctx.drawImage(that.img,x,y,120,120)
			
		}
		if(ctl.add_line===true){
			console.log('addlinme')
			let x=e.clientX-getOffsetLeft(this)
			let y=getOffsetTop(this)-e.clientY
			console.log(x,y)
			if(x>0&&x<5||x<this.offsetLeft&&(x+5>this.offsetLeft)){
				$(this).css({
					cursor:'crosshair',
					 borderColor:'red'

				})
				ctl.line_flag=true
			}else{
				$(this).css({
					cursor:'auto',
					borderColor:'#bbb'

				})
				// ctl.line_flag=false

			}
		}
		
		if(ctl.add_line===true&&ctl.line_flag==true&&this.flag===1){
			console.log(that)
			
			
			ctl.line_start=true
			ctl.parentId=this.id
			// ctx.clearRect(this.startX,this.startY,e.clientX,e.clientY)
			// ctx.beginPath();
			// ctx.moveTo(this.startX,this.startY);
			// ctx.lineTo(e.clientX,e.clientY);
			// // ctx.lineTo(300,600);
			// ctx.strokeStyle = 'blue';
			// ctx.stroke();
			
		}
	}
	this.click=function(){//画线完成判断
		
	}
	this.dragEnd=function(){
		this.flag=0
		ctl.drag_flag=false
		if(ctl.line_start&&ctl.parentId!=that.id){
			ctl.line_start=false
			ctl.line_end=true
			if(Array.isArray())
			this.line_end.push(line_id)
			line_id++
		}
	}
	this.mouseIn=function(e){
		ctl.updiv=true
		ctl.updivid=this.id
		$(this).css({
			border:'5px solid #bbb'
		})
	}
	this.mouseLeave=function(e){
		ctl.updiv=false
		this.flag=0
		$(this).css({
			border:'none'
		})
	}
	
}

// 1.图形元素，长，宽，x，y，图片，包含线段，其它信息，
let div_id=0
let line_id=0
const element_img=[
	"./img/router.png",
	"./img/router.png",
]
const divGroup=[]
const imgGroup=[]
const lineGroup=[]
AddElement.prototype.init=function(){
	this.type=1;
	this.div=document.createElement('div')
	divGroup.push(this.div)
	this.div.id=div_id++;
	$(this.div).css({
		left:this.x,
		top:this.y,
		width:120,
		background:'#ff99ff88',
		height:120,
		boxSizing:'border-box'
	})
	this.div.addEventListener('mousedown',this.dragStart)
	this.div.addEventListener('mousemove',this.draging)
	this.div.addEventListener('mouseenter',this.mouseIn)
	this.div.addEventListener('mouseleave',this.mouseLeave)
	this.div.addEventListener('mouseup',this.dragEnd)
	this.div.addEventListener('click',this.click)
	$('.canvas').append(this.div)
	this.img=new Image()
	this.img.id=this.div.id
	let that=this
	this.img.x1=that.x
	this.img.y1=that.y
	imgGroup.push(this.img)
	this.img.src="./img/router.png"
	this.img.onload=function(){
		ctl.box_group.push({img:that.img,x:that.x,y:that.y})
			draw()
		}
	
}
let add1=new AddElement(200,100)
add1.init()
let add2=new AddElement(100,200)
add2.init()