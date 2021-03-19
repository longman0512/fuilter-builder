/*!
 * bootstrap-treetable - jQuery plugin for bootstrapview treetable
 *
 * Copyright (c) 2007-2015 songhlc
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://github.com/songhlc
 *
 * Version:  1.0.0
 *
 */
var tempData = [];
var modal = "";

// Get the button that opens the modal
var btn = "";
var filterLabel = "";
var filterType = "multiple";
var itemNum = 1;
var recursive = false;
var filterElement = {};
var tempCurElement = "";
var tempCurLevel = "";
var tempRow = "";
var filters = [];
var filterIndex = "";
var filterLength = 0;
// Get the <span> element that closes the modal

(function($){
	$.fn.bstreetable = function(options){
		$window = window;
		var element = this;
        var $container;
		var settings = {
			container:window,
			data:[],
			extfield:[],//{title:"column name",key:"",type:"input"}
			nodeaddEnable:true,
			maxlevel:9,
			nodeaddCallback:function(data,callback){},
			noderemoveCallback:function(data,callback){},
			nodeupdateCallback:function(data,callback){},
            customalert:function(msg){
                alert(msg);
            },
            customconfirm:function(msg){
                return confirm(msg);
            },
            text:{
                NodeDeleteText:"Are You Sure To Delete This Filter?"
            }
		};
		var TREENODECACHE = "treenode";
        var language ={};
        
		language.addchild = "Add Filter";
		if(options) {          
            $.extend(settings, options);
        }
        /* Cache container as jQuery as object. */
        $container = (settings.container === undefined ||
                      settings.container === window) ? $window : $(settings.container);
        /*render data*/
        var dom_addFirstLevel = $("<div class='tt-operation m-b-sm'></div>").append($("<button class='btn btn-primary btn-sm j-saveClass'>Save Filters<button style='display: none;' id= 'j-saveFilter' class='btn btn-primary btn-sm j-saveFilter'><i class='fa fa-level-down'></i>&nbsp;Save Filters</button>"));
        var dom_table = $("<div class='tt-body'></div>");
        var dom_header = $("<div class='tt-header'></div>");
        /*renderHeader*/
        renderHeader(dom_header);
        element.html('').append(dom_addFirstLevel).append(dom_header);
        var treeData = {};
        /*render firstlevel tree*/
        // tempData = settings.data
        for(var i=0;i<settings.data.length;i++){
        	var row = settings.data[i];
        	//render first level row while row.pid equals 0 or null or undefined
        	if(!row.pid){
                generateTreeNode(dom_table,row,1);
        		treeData[row.id] = row;
        	}
        	
        }

        element.append(dom_table);
        /*delegate click event*/
        element.delegate(".j-expend","click",function(event){
        	//点击输入框不触发展开式事件
        	if(event.target.classList[0]=="fa"){
        		var treenode = treeData[$(this).attr('data-id')];
	        	toggleicon($(this));
	        	/*如果数据已经加载过，则只切换显示状态*/
	        	if($(this).parent().attr('data-loaded')){
	        		toggleExpendStatus($(this),treenode);        		
	        	}
	        	else{	        	
		        	loadNode($(this),treenode);
	        	}
        	}        	        
        });

        // add first level elements
        element.delegate(".j-addClass","click",function(){
            var curElement = $(".tt-body");
            var id = 0;
            var count = 1;
            tempData.map((d, index)=>{
                if(id < d.id){
                    id = d.id
                }
                if(d.pid == 0){
                    count++
                }
            })
            var curLevel = 1;
            var innercode = makeInnercode(curLevel, "", count)
            var row = {id:(id+1),name:"",pid:0, innercode: innercode};
            tempData.push(row)
            settings.data = tempData
            generateTreeNode(curElement,row,curLevel,true);
        });
        element.delegate(".j-edit","click",function(event){
            var id= $(this).parents(".class-level-ul").attr("data-id")
            $("#filterLabel").val(filters[id].label)
            $("#FilterType").val(filters[id].type)
            $("#ppid").val(id)
            if(filters[id].recursive){
                document.getElementById('recursive').checked = true
            } else {
                document.getElementById('recursive').checked = false
            }
            if(filters[id].type == "checkbox" || filters[id].type == "radio" || filters[id].type == "select" || filters[id].type == "multi-select"){
                var container = document.querySelector('#selectPanel');
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                container = $("#selectPanel")
                container.append('<div class="row mTop-30"><div class="col-md-3"><button type="button" class="btn btn-primary mb-3" onclick="addMultipleItem()">Add new Item</button></div><div class="col-md-3"><button type="button" class="btn btn-warning mb-3" style="display:none;" id="removeBtn" onclick="removeMultipleItem()">Remove Item</button></div></div>'); 
                var i = 0   
                filters[id].detail.map((ele, index)=>{
                    container.append('<div class="row mTop-30"><div class="col-md-4"><div class="input-group"><span class="input-group-text">Label</span><input type="text" class="form-control" id="multiItemLabel'+(++i)+'" aria-label="With textarea" value='+ele.label+'></input></div></div><div class="col-md-4"><div class="input-group"><span class="input-group-text">Value</span><input type="text" class="form-control" value='+ele.value+' id="multiItemValue'+(i)+'" aria-label="With textarea"></input></div></div><div class="col-md-4"><div class="form-check"><input class="form-check-input" type="checkbox" '+(ele.defaultFlag?"checked":false)+' id="multiItemDefault'+(i)+'"><label class="form-check-label" for="multiItemDefault1">Set as Default</label></div></div></div>');    
                    itemNum = index +1
                })
                
                if(i > 1){
                    document.getElementById("removeBtn").style.display="block"
                }
            } else if( filters[id].type == "exact"){
                document.getElementById("exactPanel").style.display = "block"
                document.getElementById("rangePanel").style.display = "none"
                document.getElementById("selectPanel").style.display = "none"
                document.getElementById("exactDefValue").value = filters[id].default
            } else if(filters[id].type == "exact-number"){
                document.getElementById("rangePanel").style.display = "block"
                document.getElementById("selectPanel").style.display = "none"
                document.getElementById("exactPanel").style.display = "none"

                document.getElementById("defValue").value = filters[id].default
            }
             
            modal.style.display = "block";
        });
        function makeInnercode(level, parentInnercode, innercode){
            var result = ""
            if(level == 1){
                result += innercode+"'"
                for(var i = 0; i < 8; i++){
                    result += "00";
                    if(i != 7) result += "'"
                }
            } else {
                var pInnercode = typeof parentInnercode!="string"?parentInnercode.toString().split("'"):parentInnercode.split("'")
                for(var i = 0; i< pInnercode.length; i++){
                    if(i == level-1){
                        result += innercode<10?"0"+innercode:innercode
                    } else {
                        result += pInnercode[i]
                    }
                    if(i != pInnercode.length-1){
                        result += "'"
                    }
                }
            }

            return result
        }
        element.delegate(".j-saveClass","click",function(){
            console.log(typeof filters, filters.length)
            var res = []
            for(var i in filters) 
                res.push(filters[i]); 
            console.log(res)
            $.ajax({
                url:"db.php",
                type:"post",
                data: {
                    id: "addFilter",
                    data: JSON.stringify(res)
                },
                success:function(result){
                    alert("saved")                    
                },
                error:function(error){
                }
            })
        });
        /*delegate remove event*/
        element.delegate(".j-remove","click",function(event){
            var parentDom = $(this).parents(".class-level-ul");
            var isRemoveAble = false;
            if(parentDom.attr("data-loaded")=="true"){
                if(parentDom.parent().find(".class-level").length>0){
                    settings.customalert("Can not be deleted!");
                    return;
                }
                else{
                    isRemoveAble = true;
                }
            }
            else{
                if(parentDom.attr("data-id")){
                    var existChild = false;
                    for(var i=0;i<settings.data.length;i++){
                        if(settings.data[i].pid==parentDom.attr("data-id")){
                            existChild = true;
                            break;
                        }
                    }
                    if(existChild){
                        settings.customalert("Can not be deleted!");
                        return;
                    }
                    else{
                        isRemoveAble = true;
                    }
                }
                else{
                    isRemoveAble = true;
                }
            }
            if(isRemoveAble){
                var that = $(this);
                //删除确认
                if(settings.customconfirm(settings.text.NodeDeleteText)){
                    var id= that.parents(".class-level-ul").attr("data-id")
                    // filters.splice(Number(id), 1)
                    // console.log(id)
                    delete filters[id]
                    console.log(filters)
                    console.log("removed")
                    that.parents(".class-level-ul").parent().remove();
                }
            }
        });
        /*delegate addchild event*/
        // add a root nodechild function
        element.delegate(".j-addChild","click",function(){
            filterElement = {}
            modal.style.display = "block";
        	tempCurElement = $(this).closest(".class-level");
            var requiredInput = tempCurElement.find(".form-control*[required]");
            var hasError = false;
            if(!hasError){
                var pid = tempCurElement.find(".j-expend").attr("data-id");
                tempCurLevel = $(this).parents(".class-level-ul").attr("data-level")-0+1; 
                var id = 0;
                var count = 1;
                var pInnercode = ""
                tempData.map((d, index)=>{
                    if(id < d.id){
                        id = d.id
                    }
                    if(d.pid == pid){
                        count++
                    }
                    if (pid == d.id){
                        pInnercode =  d.innercode
                    }
                })
                
                var innercode = ""
                tempRow = {id:(id+1),name:"",pid:pid, innercode: innercode};
                // tempData.push(row)
            }
        });
        element.delegate("#j-saveFilter","click",function(){
            console.log(document.getElementById("ppid").value)
            
            if(document.getElementById("ppid").value != ""){
                $("[data-id="+document.getElementById("ppid").value+"]").parent().remove()
                document.getElementById("ppid").value = ""
                console.log("edit save")
            } else {
                console.log("new")
                filterElement.pid = tempCurElement.find(".class-level-ul").attr("data-innercode")
                filters["filter"+filterLength] = filterElement
                filterIndex = "filter"+filterLength++
            }
            
            generateTreeNode(tempCurElement,tempRow,tempCurLevel, true);   
        });
        /*焦点事件*/
        element.delegate(".form-control","focus",function(){
            //在blur事件里如果输入内容为空会添加has-error样式
            $(this).parent().removeClass("has-error");
        });
        /*delegate lose focus event*/
        element.delegate(".form-control","blur",function(){
            var curElement = $(this);
            var data = {};
            /*代码里用了太多的parent的方式需要重构一下*/
            data.id = curElement.parent().parent().attr("data-id");
            var parentUl = curElement.closest(".class-level-ul");
            data.pid = parentUl.attr("data-pid");
            data.innercode = parentUl.attr("data-innercode");
            data.pinnercode = curElement.parents(".class-level-"+(parentUl.attr("data-level")-1)).children("ul").attr("data-innercode");
            parentUl.find(".form-control").each(function(){
                data[$(this).attr("name")]=$(this).val();                
            });
            if(!data.id&&!curElement.attr("data-oldval")){   
                
                settings.nodeaddCallback(data,function(_data){
                    tempData.map((temp, index)=>{
                        if(temp.id == data.id){
                            temp.name = data.name
                        }
                    })        
                    settings.data = tempData
                    if(_data){
                        curElement.parent().attr("data-id",_data.id);
                        curElement.parent().parent().attr("data-id",_data.id);
                        curElement.parent().parent().attr("data-innercode",_data.innercode);
                        curElement.attr("data-oldval",curElement.val());
                    }
                });                            
            }
            else if(curElement.attr("data-oldval")!=curElement.val()){
                tempData.map((temp, index)=>{
                    if(temp.id == data.id){
                        temp.name = data.name
                    }
                })
                settings.data = tempData
                settings.nodeupdateCallback(data,function(){
                    curElement.attr("data-oldval",curElement.val());
                });
                
            }
        });
        function rebuildTemp(pid, pInnercode){
            var child = $("[data-pid="+pid+"]")
            if(!child.length){
                return false
            }

            for(var i = 0; i< child.length; i++){
                child[i].children[2].firstChild.innerText = makeInnercode(child[i].getAttribute("data-level"), pInnercode, (i+1))
                var id = child[i].getAttribute("data-id")
                tempData.map((td, index)=>{
                    if(td.id == id){
                        td.innercode = makeInnercode(child[i].getAttribute("data-level"), pInnercode, (i+1))
                    }
                })
                rebuildTemp(child[i].getAttribute("data-id"), makeInnercode(child[i].getAttribute("data-level"), pInnercode, (i+1)))
            }
        }
		/*渲染表头*/
        function renderHeader(_dom_header){
        	var dom_row = $('<div></div>');
        	dom_row.append($("<span class='maintitle'></span>").text(settings.maintitle));
        	dom_row.append($("<span></span>"));        	
        	//render extfield
    		for(var j=0;j<settings.extfield.length;j++){
    			var column = settings.extfield[j];    			
    			$("<span></span>").css("min-width","166px").text(column.title).appendTo(dom_row);
    		}
    		dom_row.append($("<span class='textalign-center'>Operation</span>")); 
    		_dom_header.append(dom_row);
        }
        //动态生成扩展字段
        function generateColumn(row,extfield){
        	var generatedCol;
        	switch(extfield.type){
        		case "input":generatedCol=$("<input type='text' class='form-control input-sm'/>").val(row[extfield.key]).attr("data-oldval",row[extfield.key]).attr("name",extfield.key);break;
        		default:generatedCol=$("<span></span>").text(row[extfield.key]);break;
        	}
        	return generatedCol;
        }
        function toggleicon(toggleElement){
        	var _element = toggleElement.find(".fa");
        	if(_element.hasClass("fa-plus")){
        		_element.removeClass("fa-plus").addClass("fa-minus");
        		toggleElement.parent().addClass("selected");
        	}else{
        		_element.removeClass("fa-minus").addClass("fa-plus");
        		toggleElement.parent().removeClass("selected")
        	}
        }
		function toggleExpendStatus(curElement){
			if(curElement.find(".fa-minus").length>0){
                 curElement.parent().parent().find(".class-level").removeClass("rowhidden");
            }
            else{
                curElement.parent().parent().find(".class-level").addClass("rowhidden");
            }
           
		}
		function collapseNode(){

		}
		/*展开节点*/
		function expendNode(){

		}
		/*加载子节点*/
		function loadNode(loadElement,parentNode){
			var curElement = loadElement.parent().parent();
        	var curLevel = loadElement.parent().attr("data-level")-0+1; 
        	//TODO:将已经加载过的数据从list中删除，减少循环次数
        	if(parentNode&&parentNode.id){
                for(var i=0;i<settings.data.length;i++){
    	        	var row = settings.data[i];
    	        	//render first level row while row.pid equals 0 or null or undefined
    	        	if(row.pid==parentNode.id){
    	        		generateTreeNode(curElement,row,curLevel);
                        //cache treenode 
                        treeData[row.id] = row;
    	        	}	        	
    	        }                
            }
            loadElement.parent().attr('data-loaded',true);
	        
		}
        /*初始化需要生成的下级节点的 params:
        curElement当前节点，
        row对应行数据，
        curLevel以及当前层级*/
        function generateTreeNode(curElement,row,curLevel,isPrepend){
            isPrepend = false
            var dom_row = $('<div class="class-level class-level-'+curLevel+'"></div>');
            var dom_ul =$('<ul class="class-level-ul"></ul>');
            if(row.innercode){
                dom_ul.attr("data-pid",row.pid).attr("data-level",curLevel).attr("data-id",row.id);
            } else {
                dom_ul.attr("data-pid",row.pid).attr("data-level",curLevel).attr("data-id", filterIndex);
            }            
            row.innercode&&dom_ul.attr("data-innercode",row.innercode);
            if(row.innercode){ // if the node is category
                if(curLevel-0>=settings.maxlevel){
                    $('<li class="j-expend"></li>').append('<label class="fa p-xs"></label>').append($("<input type='text' class='form-control input-sm' required/>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',row.id).appendTo(dom_ul);
                    dom_ul.attr("data-loaded",true);
                }
                else{
                    $('<li class="j-expend"></li>').append('<label class="fa fa-plus p-xs"></label>').append($("<input type='text' class='form-control input-sm' required/>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',row.id).appendTo(dom_ul);
                }
            } else { // if the node is filter
                if(curLevel-0>=settings.maxlevel){
                    switch(filterElement.type){
                        case "checkbox":
                            var ulValue = $('<ul class="filter-value"></ul>')
                            filterElement.detail.map((filterVal, index)=>{
                                ulValue.append('<li class="value-list"><input type="checkbox" '+(filterVal.defaultFlag?'checked':'')+' disabled/>&nbsp;'+filterVal.label+'&nbsp;[value: '+filterVal.value+']&nbsp;</li>')
                            })
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div> class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            dom_ul.attr("data-loaded",true);
                            break;
                        case "radio":
                            var ulValue = $('<ul class="filter-value"></ul>')
                            filterElement.detail.map((filterVal, index)=>{
                                ulValue.append('<li class="value-list"><input type="radio" '+(filterVal.defaultFlag?'checked':'')+' disabled/>&nbsp;'+filterVal.label+'&nbsp;[value: '+filterVal.value+']&nbsp;</li>')
                            })
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div> class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            dom_ul.attr("data-loaded",true);
                            break;
                        case "select":
                            var ulValue = $('<ul class="filter-value"></ul>')
                            var selValue = $('<select readonly></select>')
                            var listValue = $('<li class="value-list"></li>')
                            filterElement.detail.map((filterVal, index)=>{
                                selValue.append('<option '+(filterVal.defaultFlag?'selected':'disabled')+' value="volvo">&nbsp;'+filterVal.label+'&nbsp;[value: '+filterVal.value+']&nbsp;</option>')
                            })
                            listValue.append(selValue)
                            ulValue.append(listValue)
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div> class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            dom_ul.attr("data-loaded",true);
                                break;
                        case "multi-select":
                            var ulValue = $('<ul class="filter-value"></ul>')
                            var selValue = $('<select readonly></select>')
                            var listValue = $('<li class="value-list"></li>')
                            filterElement.detail.map((filterVal, index)=>{
                                selValue.append('<option '+(filterVal.defaultFlag?'selected':'disabled')+' value="volvo">&nbsp;'+filterVal.label+'&nbsp;[value: '+filterVal.value+']&nbsp;</option>')
                            })
                            listValue.append(selValue)
                            ulValue.append(listValue)
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div> class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            dom_ul.attr("data-loaded",true);
                                break;
                            break;
                        case "exact-number":
                            var ulValue = $('<ul class="filter-value"></ul>')
                                ulValue.append('<li class="value-list exact-number"><button>-</button><input type="number" value ='+(filterElement.default?filterElement.default:0)+' disabled/><button>+</button>&nbsp;[default:'+filterElement.default+']</li>')
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div> class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            dom_ul.attr("data-loaded",true);
                            break;
                        case "exact":
                            var ulValue = $('<ul class="filter-value"></ul>')
                                ulValue.append('<li class="value-list exact-number"><input type="text" value ='+(filterElement.default?filterElement.default:0)+' disabled/>&nbsp;[default:'+filterElement.default+']</li>')
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div> class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            dom_ul.attr("data-loaded",true);
                            break;
                    }
                }
                else{
                    switch(filterElement.type){
                        case "checkbox":
                            var ulValue = $('<ul class="filter-value"></ul>')
                            filterElement.detail.map((filterVal, index)=>{
                                ulValue.append('<li class="value-list"><input type="checkbox" '+(filterVal.defaultFlag?'checked':'')+' disabled/>&nbsp;'+filterVal.label+'&nbsp;[value: '+filterVal.value+']&nbsp;</li>')
                            })
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            break;
                        case "radio":
                            var ulValue = $('<ul class="filter-value"></ul>')
                            filterElement.detail.map((filterVal, index)=>{
                                ulValue.append('<li class="value-list"><input type="radio" '+(filterVal.defaultFlag?'checked':'')+' disabled />&nbsp;'+filterVal.label+'&nbsp;[value: '+filterVal.value+']&nbsp;</li>')
                            })
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            break;
                        case "select":
                            var ulValue = $('<ul class="filter-value"></ul>')
                            var selValue = $('<select readonly></select>')
                            var listValue = $('<li class="value-list"></li>')
                            filterElement.detail.map((filterVal, index)=>{
                                selValue.append('<option '+(filterVal.defaultFlag?'selected':'disabled')+' value="volvo">&nbsp;'+filterVal.label+'&nbsp;[value: '+filterVal.value+']&nbsp;</option>')
                            })
                            listValue.append(selValue)
                            ulValue.append(listValue)
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            dom_ul.attr("data-loaded",true);
                                break;
                        case "multi-select":
                            var ulValue = $('<ul class="filter-value"></ul>')
                            var selValue = $('<select readonly></select>')
                            var listValue = $('<li class="value-list"></li>')
                            filterElement.detail.map((filterVal, index)=>{
                                selValue.append('<option '+(filterVal.defaultFlag?'selected':'disabled')+' value="volvo">&nbsp;'+filterVal.label+'&nbsp;[value: '+filterVal.value+']&nbsp;</option>')
                            })
                            listValue.append(selValue)
                            ulValue.append(listValue)
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            dom_ul.attr("data-loaded",true);
                            break;
                        case "exact-number":
                            var ulValue = $('<ul class="filter-value"></ul>')
                                ulValue.append('<li class="value-list exact-number"><button>-</button><input type="number" value = '+(filterElement.default?filterElement.default:0)+' disabled/><button>+</button>&nbsp;[default: '+filterElement.default+']&nbsp;</li>')
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            break;
                        case "exact":
                            var ulValue = $('<ul class="filter-value"></ul>')
                            ulValue.append('<li class="value-list exact-number"><input type="text" value ='+(filterElement.default?filterElement.default:0)+' disabled/>&nbsp;[default:'+filterElement.default+']</li>')
                            $('<li class="j-expend"></li>').append('<label class="fa fa-filter filter-space"></label>').append($("<div class='form-control input-sm' required>"+filterElement.label+"["+filterElement.type+"]</div>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',"filter"+filterIndex).append(ulValue).appendTo(dom_ul);
                            break;
                    }
                }
            }
           
            if(settings.nodeaddEnable){
                if(curLevel-0>=settings.maxlevel){
                    $("<li></li>").attr("data-id",row.id).appendTo(dom_ul);
                }
                else{
                    $("<li></li>").append($('<button class="btn btn-outline btn-sm j-addChild"><i class="fa fa-plus"></i>'+language.addchild +'</button>').attr("data-id",row.id)).appendTo(dom_ul);    
                }
            }       
            for(var j=0;j<settings.extfield.length;j++){
                    var colrender = settings.extfield[j];
                    var coltemplate = generateColumn(row,colrender);
                    $('<li></li>').attr("data-id",row.id).html(coltemplate).appendTo(dom_ul);
            }
            if(row.innercode){ // if the node is category, user can't remove it in this panel
                dom_ul.append($("<li></li>"));
            } else { // if the node is filter, use can remove or edit it in this panel
                dom_ul.append($("<li><i class='fa fa-edit j-edit'></i><i class='fa fa-remove j-remove'></i></li>"));

            }
            dom_row.append(dom_ul);
            if(isPrepend){
                curElement.prepend(dom_row);
            }
            else{
                curElement.append(dom_row);
            }
        }
	}
})(jQuery)