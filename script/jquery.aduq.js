//声明字典命名空间
if(!window.web){ web={}; }
if(!window.dictionary){ dictionary={}; }
if(!window.dictionarys){ dictionarys={}; }
var chooseWeb={};
var btn_sure=1;
var aonclick={};
web.currentUser;
web.rootdir="/"+web.appCode+"/";
var dialogTP={};
//判断登录超时跳转登录页
$.ajaxSetup({
    complete: function (xhr) {
        if (xhr.responseJSON && xhr.responseJSON.errcode==401) {
			getparent().location.href=web.rootdir+"login";
		}
    }
});
var mesAlert=function(title,mes,icon,func){
	if(func){
		$.messager.alert(title, mes, icon,function(){
			eval(func+"()");
		});
	}else{
		$.messager.alert(title, mes, icon);
	}
};
var mesShow=function(title,mes,time,className){
	$.messager.show({
		title: title,
		msg: mes,
		timeout: time,
		styleClass:(className || 'green'),
		showType: "slide",
		style: {
			right: '',
			top: document.body.scrollTop+67,
			bottom: ''
		}
	});
};
var mesConfirm=function(title,mes,func,nofunc){
	$.messager.confirm(title,mes,function(r){
        if (r){
            func();
        }else{
			if(nofunc) nofunc();
		}
    });
};
var mesProgress=function(className){
	getparent().mesProgressClose();
	$.messager.progress({
		styleClass:(className || 'progress'),
        //title:"温馨提示",
        //msg:"正在加载中...",
        text:"loading...",
        interval:1000
	});
};
var mesProgressClose=function(){
	$.messager.progress('close');
};
var dialogP=function(url,iframeN,title,callback,nobutton,width,height,onclose){
	if($("#"+callback,window.parent.document).length==0){
		var $diaid=$("<div id='"+callback+"'></div>");
		$("body",window.parent.document).append($diaid);
	}else{
		var $diaid=$("#"+callback,window.parent.document);
		$diaid.html("");
	}
	var href={"name":callback+"Val"};
	var src=tourl(url.indexOf("http")>-1?url:(web.rootdir+url),href);
	var diaopts={
		title:title,
		modal: true,//是否将窗体显示为模式化窗口
		closed: false,
		content: "<iframe id='"+callback+"F' name='"+callback+"F' scrolling='auto' frameborder='0' src='"+src+"' style='width:100%; height:100%; display:block;'></iframe>"
	};
	if(width){
		if(typeof width=="string" && width=="maximized")
			diaopts.maximized=true;
		else
			diaopts.width=width;
	}else{
		diaopts.width=1000;
		//diaopts.maximized=true;
	}
	if(height){
		if(typeof height=="string" && height=="maximized")
			diaopts.maximized=true;
		else
			diaopts.height=height;
	}else{
		diaopts.height=550;
		//diaopts.maximized=true;
	}		
	if(!nobutton){
		diaopts.buttons=[{
			text: "确认",
			handler: function () {
				chooseWeb[callback+"Val"]=window[callback+"F"].window.getchoosedata();
				if(chooseWeb[callback+"Val"] && chooseWeb[callback+"Val"].state!=0){
					var iframs=iframeN.split("|");
					var ifN=window[iframs[0]];
					if(!ifN){
						var aN=window;
						for(var i=iframs.length-1;i>0;i--){
							if(aN[iframs[i]]){
								aN=aN[iframs[i]].window;
							}
						}
						ifN=aN;
					}
					ifN.window[callback](chooseWeb[callback+"Val"]);
					//(window[iframeN] || (window.rightiframe?(window.rightiframe.window[iframeN]?window.rightiframe.window[iframeN]:window.rightiframe):window)).window[callback](chooseWeb[callback+"Val"]);
					if(chooseWeb[callback+"Val"] && chooseWeb[callback+"Val"].state==1) $("#"+callback).dialog("close");
				}
			}
		}, {
			text: "关闭",
			handler: function () {
				$("#"+callback).dialog("close");
			}
		}];
	}
	if(onclose){
		diaopts.onClose=onclose;
	}
	$diaid.dialog(diaopts);	
	getparent().winResize();
};
var dialogT=function(callback,diaopts){
	if($("#"+callback,window.parent.document).length==0){
		var $diaid=$("<div id='"+callback+"'></div>");
		$("body",window.parent.document).append($diaid);
	}else{
		var $diaid=$("#"+callback,window.parent.document);
		$diaid.html("");
	}
	$diaid.dialog(diaopts);
	//return $diaid;
};
var sDTOnload=function(callback,formid){
	var pageparam=dialogTP[callback].pageparam;
	var gps=dialogTP[callback].gps;
	var $form=$(window[callback+"F"].document).find(formid?("#"+formid):(pageparam.listtable.listname+"AddForm"));	
	$form.find("input.cselectorImageUpload").each(function (i, v) {//重置form之后文件上传控件变形或者重置
        $(v).trigger("change");
    });
	$form.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
        $(v).trigger("change");
    });
    //重置form之后如果下拉框有需要特殊处理就特殊处理一下
    $form.find("select.easyui-combobox").each(function (i, v) {
        if ($(v).attr("conchange")) {//赋值之后对其他影响
            if ($(v).attr("conchange").indexOf("()") > -1)
                eval($(v).attr("conchange").replace("()", "") + "('" + $(v).val() + "')");
            else
                eval($(v).attr("conchange") + "('" + $(v).val() + "')");
        }
    });
    //处理默认值
	if ($form.attr("initsystem")) {
		if ($form.attr("initsystem").indexOf("()") > -1)
			window[callback+'F'].window[$form.attr("initsystem").replace("()", "")]();
		else
			window[callback+'F'].window[$form.attr("initsystem")]();
		$form.find("input").removeClass("validatebox-invalid");//把对话框里面的样式重置
		$form.find("span.textbox-invalid").removeClass("textbox-invalid");//把下拉选择框里面的样式重置
	}
    if (pageparam.dialogform.ctable) {
        var tabs = pageparam.dialogform.ctable.split(",");
        for (var i in tabs) {
            $form.find("table[id='" + tabs[i] + "'] tbody tr").remove();
        }
    }else{
		$form.find("table[pathsave]").each(function(i,v){
			$(v).find("tbody tr").remove();
		});
	}
    if(gps.type && gps.type=="read") window[callback+'F'].window.formReady();
	if (gps.id) {
        //如果是修改就给对话框传要修改的记录数据
		if (pageparam.dialogform.getcmd || $form.attr("cmd-select")) {//如果需要调命令获取数据
			var ajaxopts={
				url: pageparam.dialogform.getcmd || $form.attr("cmd-select"),
				data: gps,
				success: function (datai) {
					var row = datai.data;
					//数据赋值之前要干什么
					if ($form.attr("bindval")) {
						if ($form.attr("bindval").indexOf("()") > -1)
							window[callback+'F'].window[$form.attr("bindval").replace("()", "")](row,pageparam);
						else
							window[callback+'F'].window[$form.attr("bindval")](row,pageparam);
					}
				}
			};
			if (pageparam.dialogform.scontentType || $form.attr("scontentType")) {
				ajaxopts.contentType=pageparam.dialogform.scontentType || $form.attr("scontentType");
			}
			ajaxgeneral(ajaxopts);
		} else {
			//数据赋值之前要干什么
			if ($form.attr("bindval")) {
				if ($form.attr("bindval").indexOf("()") > -1)
					window[callback+'F'].window[$form.attr("bindval").replace("()", "")](dialogTP[callback].row,pageparam);
				else
					window[callback+'F'].window[$form.attr("bindval")](dialogTP[callback].row,pageparam);
			}
		}
    }	
	getparent().winResize();
};
function winResize(){
	var s=getBrowserInfo();
	if (s.browser=="msie" && parseInt(s.ver)<9) {
		$("body").css("overflow-y","scroll");
	}
};
var dialogF=function(title,formN,iframeN){
	if($("#"+formN,window.parent.document).length==0){
		var $diaid=$("<div id='"+formN+"'></div>");
		$("body",window.parent.document).append($diaid);
	}else{
		var $diaid=$("#"+formN,window.parent.document);
		$diaid.html("");
	}
	$diaid.append((window[iframeN] || (window.rightiframe?window.rightiframe.window[iframeN]:window)).$("#"+formN+"Form").clone().removeClass("hide"));
	var $form=$diaid.find("#"+formN+"Form");
	$form.find("input[classpath],select[classpath],textarea[classpath]").each(function(i,v){
		var classpath=$(v).attr("classpath");
		var opts={};
		if($(v).attr("required")) opts.required=true;
		switch(classpath){
			case "easyui-validatebox":
				if($(v).attr("validType")) opts.validType=$(v).attr("validType");
				$(v).validatebox(opts);
				break;
			case "easyui-combobox":
				$(v).combobox(opts);
				break;
			case "easyui-datebox":
				$(v).datebox(opts);
				break;
		}
	});
	var diaopts={
		title:title,
		width:800,
		height:450,
		modal: true,//是否将窗体显示为模式化窗口
		closed: false,
		buttons:[{
			text: "确认",
			handler: function () {
				if (btn_sure == 1) {
                    btn_sure = 2;
					if($form.form("validate")){
						var uploadv = 1;
						$form.find("input.cselectorImageUpload").each(function (i, v) {
							if ($(v).attr("required") && $(v).val() == "") {
								uploadv = 0;
								//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
								getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
								return false;
							}
						});
						$form.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
							$(v).trigger("getdata");
							if ($(v).attr("required") && $(v).val() == "") {
                                uploadv = 0;
                                //getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
								getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
                                return false;
                            }
						});
                        if (uploadv == 1) {
                            var data = {};
                            $form.find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
                                if ($(v).attr("name")) {
                                    if ($(v).attr("type") == "password") {
                                        data[v.name] = hex_md5(v.value);
                                    } else if($(v).hasClass("cselectorImageUpload")){
                                        data[v.name] = v.value?($(v).attr("valType")?v.value:$.evalJSON(v.value)):[];
                                    } else{
                                        data[v.name] = v.value || "";
                                    }
                                }
                            });
							//(window[iframeN] || (window.rightiframe?window.rightiframe.window[iframeN]:window)).window[formN](data,formN);
							(window[iframeN] || (window.rightiframe?window.rightiframe.window[iframeN]:window)).window.callback(data,formN+"Form");
                            btn_sure = 1;
                            $("#" + formN).dialog("close");
                        }
					}else{
						formValidateInfo($form);
						btn_sure = 1;
					}
				}
			}
		}, {
			text: "关闭",
			handler: function () {
				$("#"+callback).dialog("close");
			}
		}]
	};
	$diaid.dialog(diaopts);
};
var dialogClose=function(dialogid){
	$("#"+dialogid).dialog("close");
};
var tabClose=function(id){
	if($("#"+id,window.parent.document).length>0){
		$("#"+id+" i.fr",window.parent.document).trigger("click");
	}
};
var dialogSetTitle=function(id,title){
	if($("#"+id,window.parent.document).length>0){
		$("#"+id,window.parent.document).dialog("setTitle",title);
	}
};
var tabClick = function (id, href,gps) {
    if ($("#" + id, window.parent.document).length > 0) {	
		if(href || gps) var path=$("#"+id,window.parent.document).attr("path");
		if(href) $("#"+id,window.parent.document).attr("path",href);
		if(gps) $("#"+id,window.parent.document).attr("path",tourl($("#"+id,window.parent.document).attr("path"),gps));
		if($("#"+id,window.parent.document).parents("ul").prev("a").length>0){
			for(var i=$("#"+id,window.parent.document).parents("ul").prev("a").length-1;i>=0;i--){
				$($("#"+id,window.parent.document).parents("ul").prev("a")[i]).trigger("click");
			}
		}
		$("#"+id,window.parent.document).trigger("click");
		if(href || gps) $("#"+id,window.parent.document).attr("path",path);
	}
};
var tabOpen=function(url,title){
	var uA=url.split("?")[0].split("/");
	var id=uA[uA.length-1].split(".")[0];
	var $id=$("#li_" + id,window.parent.document);
	if ($id.length > 0) {
		$id.addClass("a_hover").siblings().removeClass("a_hover");
		var $idif=$("#li_" + id + "_if",window.parent.document);
		$idif.show().siblings().hide();
		$(".right_tab a i.fr",window.parent.document).removeClass("i_color");
		$("#li_" + id + " i.fr",window.parent.document).addClass("i_color");
		$id.insertAfter("#li_home",window.parent.document);
		var tourl = url + (url.indexOf("?") > 0 ? "&" : "?") + "tm=" + (new Date()).getTime();
		$idif.insertAfter("#li_home_if",window.parent.document).attr("src",tourl);
	}else {
		$(".right iframe").hide();
		//IE6、IE7样式
		if ($.support.msie) {//($.browser.msie && ($.browser.version == "6.0") && !$.support.style) || ($.browser.msie && ($.browser.version == "7.0"))
			$("<a id='li_" + id + "' class='a_hover'><i class='iconfont fr i_color'>&#xe63e;</i><font>" + title + "</font></a>").insertAfter("#li_home",window.parent.document);
			$("#li_" + id,window.parent.document).css("width", (title.length) * 18 + 15);
		} else {
			$("<a id='li_" + id + "' class='a_hover'><font>" + title + "</font><i class='iconfont fr i_color'>&#xe63e;</i></a>").insertAfter("#li_home",window.parent.document);
		}
		$("#li_" + id,window.parent.document).addClass("a_hover").siblings().removeClass("a_hover");
		$(".right_tab a i.fr",window.parent.document).removeClass("i_color");
		$("#li_" + id + " i.fr",window.parent.document).addClass("i_color");
		var tourl = url + (url.indexOf("?") > 0 ? "&" : "?") + "tm=" + (new Date()).getTime();
		calculateHeight();
		$("<iframe name='" + id + "' id='li_" + id + "_if' style='height:"+ih+"px;' src='" + tourl + "' frameborder='0'></iframe>").insertAfter("#li_home_if",window.parent.document);
	}
};
//加载表格
function loadGrid(pageparam) {
	/**模糊查询
	var search_txt = "";
	for (var i = 0; i <= $(".search_txt").length; i++) {
		if ($(".search_txt:eq(" + i + ")").val())
			search_txt += $(".search_txt:eq(" + i + ")").val() + ",";
	}
	search_txt = search_txt.substr(0, search_txt.length - 1);
	$(".search_txt").val("");//如果点击查询后不想清空文本框可以把这一句删除
	**/
    if (!pageparam.dialogclose) {
        if (pageparam.dialogform) {
            $(pageparam.dialogform.dialogid).dialog("close");//关闭对话框
            if (pageparam.dialogform.ctableDialog) {
                var dialogs = pageparam.dialogform.ctableDialog.split(",");
                for (var i in dialogs) {
                    if (dialogs[i] != "") {
                        $("#" + dialogs[i]).dialog("close");//子选项对话框
                    }
                }
            }
        }
        if (pageparam.readDialog) {
            $(pageparam.readDialog.dialogid).dialog("close");//关闭对话框
            if (pageparam.readDialog.ctableReadDialog) {
                var dialogs = pageparam.readDialog.ctableReadDialog.split(",");
                for (var i in dialogs) {
                    if (dialogs[i] != "") {
                        $("#" + dialogs[i]).dialog("close");//子选项对话框
                    }
                }
            }
        }
        if (pageparam.dialoglistbtn) {
            $(pageparam.dialoglistbtn.dialogid).dialog("close");//关闭对话框
        }
    }
	var tableopts={
		tableid:pageparam.listtable.listname.split("#")[1],
        method: "post",//请求远程数据的 method 类型,默认post
        striped: true,//奇偶行使用不同背景色,默认false
		nowrap:true,//把数据显示在一行里,默认true
        collapsible: true,//表格可折叠
        //url: pageparam.listtable.querycmd,//"从远程站点请求数据的URL，模糊查询例子：${path}/sys/shdstOrderAjax?search_txt="+search_txt
        //sortName: "lastUpdateTime",//定义可以排序的列
        sortOrder: pageparam.listtable.sortOrder || "asc",//定义列的排序顺序，只能用asc(默认)或desc
        remoteSort: pageparam.listtable.remoteSort || false,//是否从服务器给数据排序,默认true
        idField: pageparam.listtable.idField || "id",//标识字段
		singleSelect:pageparam.listtable.singleSelect || false,//只能选择一行
        checkOnSelect:false,//true点击当行有效，false点击复选框有效
        fitColumns: true,//自动扩大或缩小列的尺寸以适应表格的宽度并且防止水平滚动,设为true
	    //fitColumns: false,//自动扩大或缩小列的尺寸以适应表格的宽度并且防止水平滚动,默认false
        //frozenColumns: pageparam.listtable.frozenColumns,
        //columns: pageparam.listtable.columns,
		onLoadSuccess:function(data){//在数据加载成功的时候触发
			if(data.errcode==401){//登录超时
				getparent().location.href=web.rootdir+"action/login";
			}
			if(data.errcode && data.errcode!=0){
				//$.messager.show({
				//	title:"温馨提示",
				//	msg:data.message,
				//	timeout:2500,
				//	showType:"slide",
				//	style:{
				//		right:'',
				//		top:10,
				//		bottom:''
				//	}
				//});
				//getparent().mesAlert("温馨提示",data.message || "操作失败", 'error');
				getparent().mesShow("温馨提示",data.message || "操作失败", 2000,'red');
			}else{			
				if($(pageparam.listtable.listname).datagrid("getPager").length>0){//修复带复选框的列表选中一页改变页签时取消选中状态
					$(pageparam.listtable.listname).datagrid("getPager").pagination("options").onChangePageSize=function(pageSize){
						$(pageparam.listtable.listname).datagrid("clearChecked");//刷新table
					}
				}
				if(pageparam.listtable.onLoadSuccess){
					eval(pageparam.listtable.onLoadSuccess(data));
				}
                var listtable = pageparam.listtable.listname.substr(1, pageparam.listtable.listname.length - 1);
                $("."+listtable+" a.easyui-tooltip").tooltip("destroy").each(function(i,v){
                    $(v).tooltip({
                        listTab:true,
                        content: $('<div>'+$(v).attr("title")+'</div>'),
                        onShow: function() {
                            $(this).tooltip('arrow').css('left', 20);
                            $(this).tooltip('tip').css({
                                backgroundColor: '#e2f4ff',
                                borderColor: '#39aef5',
                                left: $(this).offset().left
                            })
                        },
						onUpdate: function(cc){
                            cc.panel({
                                width: $(v).parent("div").width() || 200,
                                height: 'auto',
                                border: false,
                                bodyCls:'bgtransparent'
                            });
                        }
                    });
                });
                $(".tooltip.listTab").remove();				
				if(pageparam.listtable.controller){
					var listname = pageparam.listtable.listname.substr(1, pageparam.listtable.listname.length - 1);
					getCurrent("controlListBtn('"+pageparam.listtable.controller+"','"+listname+"','"+(pageparam.listtable.deleteall?pageparam.listtable.deleteall.id:null)+(pageparam.listtable.unShowFieds?("','"+pageparam.listtable.unShowFieds):"")+"')");		
				}
			}
	    },
		//onLoadError:function(){//在载入远程数据产生错误的时候触发
		//	getparent().location.href=web.rootdir+"action/login";
		//	$.messager.alert("温馨提示","操作失败", 'error');
		//},
		onLoadError:function(data){//在载入远程数据产生错误的时候触发
			var res=$.evalJSON(data.responseText);
			//getparent().mesAlert("温馨提示",res.status+"&nbsp;&nbsp;"+res.error+"</br>"+res.message, 'error');
			getparent().mesShow("温馨提示",res.status+"&nbsp;&nbsp;"+res.error+"</br>"+res.message, 2000,'red');
			if(res.message.indexOf("login_tab")>-1){
				getparent().location.href=web.rootdir+"action/login";
			}
		},		
        pagination: pageparam.listtable.pagination==false?false:true,//在 datagrid 的底部显示分页栏
        rownumbers: pageparam.listtable.rownumbers==false?false:true//显示行号
    };
	if(pageparam.listtable.frozenColumns){
		tableopts.frozenColumns=pageparam.listtable.frozenColumns;
		for(var j in pageparam.listtable.frozenColumns){
			for(var i in pageparam.listtable.frozenColumns[j]){
				if(pageparam.listtable.frozenColumns[j][i].tooltip && (!pageparam.listtable.frozenColumns[j][i].formatter)){
					pageparam.listtable.frozenColumns[j][i].formatter=function(value, row, index){
						//return value?"<a href='#' title='"+value+"' class='tooltip_c easyui-tooltip'>"+value+"</a>":"";
						return value?"<span class='titleTooltipA'>"+value+"</span>":"";
					}
				}
			}
		}
	}
	if(pageparam.listtable.columns){
		tableopts.columns=pageparam.listtable.columns;		
		for(var j in pageparam.listtable.columns){
			for(var i in pageparam.listtable.columns[j]){
				if(pageparam.listtable.columns[j][i].tooltip && (!pageparam.listtable.columns[j][i].formatter)){
					pageparam.listtable.columns[j][i].formatter=function(value, row, index){					
						//return value?"<a href='#' title='"+value+"' class='tooltip_c easyui-tooltip'>"+value+"</a>":"";
						return value?"<span class='titleTooltipA'>"+value+"</span>":"";
					}
				}
			}
		}
	}
	if(pageparam.listtable.checkboxall || pageparam.listtable.checkboxall==false){
		tableopts.singleSelect=!pageparam.listtable.checkboxall;//是否支持全选
	}
	if(pageparam.listtable.dataName){
		tableopts.dataName=pageparam.listtable.dataName;
	}
	if(pageparam.listtable.sortName){
		tableopts.sortName=pageparam.listtable.sortName;
	}
	if(pageparam.listtable.contentType){
		tableopts.contentType=pageparam.listtable.contentType;//传值方式
	}
	if(!pageparam.listtable.noload){//是否默认查询数据
		if(pageparam.listtable.querycmd){
			tableopts.url=web.rootdir+pageparam.listtable.querycmd;//查询命令
		}else{
			if(pageparam.listtable.data){
				tableopts.data=pageparam.listtable.data;//如果不用查询数据直接设置data也可以
			}
		}
	}
	if(pageparam.listtable.queryParams){
		tableopts.queryParams=pageparam.listtable.queryParams;//传额外值
	}
	if(pageparam.listtable.nowrap+""){
		tableopts.nowrap=pageparam.listtable.nowrap;//把数据显示在一行里
	}
	if(pageparam.listtable.toolbar){
		tableopts.toolbar=pageparam.listtable.toolbar;//新增按钮
	}
	if(pageparam.listtable.height){
		tableopts.height=pageparam.listtable.height;//新增按钮
	}
	if(pageparam.listtable.showFooter){
		tableopts.showFooter=pageparam.listtable.showFooter;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.collapsible){
		tableopts.collapsible=pageparam.listtable.collapsible;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onBeforeLoad){
		tableopts.onBeforeLoad=pageparam.listtable.onBeforeLoad;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onBeforeCheck){
		tableopts.onBeforeCheck=pageparam.listtable.onBeforeCheck;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onCheck){
		tableopts.onCheck=pageparam.listtable.onCheck;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onUncheck){
		tableopts.onUncheck=pageparam.listtable.onUncheck;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onCheckAll){
		tableopts.onCheckAll=pageparam.listtable.onCheckAll;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onBeforeRender){
		$.fn.datagrid.defaults.view.onBeforeRender=pageparam.listtable.onBeforeRender;
	}
	if(pageparam.listtable.onUncheckAll){
		tableopts.onUncheckAll=pageparam.listtable.onUncheckAll;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.loadFilter){
		tableopts.loadFilter=pageparam.listtable.loadFilter;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onClickRow){
		tableopts.onClickRow=pageparam.listtable.onClickRow;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onEndEdit){
		tableopts.onEndEdit=pageparam.listtable.onEndEdit;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onBeforeEdit){
		tableopts.onBeforeEdit=pageparam.listtable.onBeforeEdit;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onBeginEdit){
		tableopts.onBeginEdit=pageparam.listtable.onBeginEdit;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onAfterEdit){
		tableopts.onAfterEdit=pageparam.listtable.onAfterEdit;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.onCancelEdit){
		tableopts.onCancelEdit=pageparam.listtable.onCancelEdit;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.scrollbarSize){
		tableopts.scrollbarSize=pageparam.listtable.scrollbarSize;//"scrollbarSize":0,scrollbarSize参数不管用，easyui写死为18了，用styleClass
	}
	if(pageparam.listtable.styleClass){
		tableopts.styleClass=pageparam.listtable.styleClass;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.rowStyler){
		tableopts.rowStyler=pageparam.listtable.rowStyler;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.fitColumns==false){
		tableopts.fitColumns=pageparam.listtable.fitColumns;//底部栏，一般用来放合计
	}
	if(pageparam.listtable.selectOnCheck){
		tableopts.selectOnCheck=pageparam.listtable.selectOnCheck;//底部栏，一般用来放合计
	}
	var pageT=10;
	if(window.sessionStorage){
		if(window.sessionStorage.getItem(pageparam.listtable.listname)){
			pageT=window.sessionStorage.getItem(pageparam.listtable.listname)
			tableopts.pageSize=pageT;
		}
	}else{
		if(web.getCookie(pageparam.listtable.listname)){
			pageT=web.getCookie(pageparam.listtable.listname)
			tableopts.pageSize=pageT;
		}
	}
    $(pageparam.listtable.listname).datagrid(tableopts);
	var pageopts={
		pageSize:pageT,//每页显示的记录条数，默认为10
		pageList: [10, 20, 30, 40],//可以设置每页记录条数的列表
		beforePageText: "第",//页数文本框前显示的汉字
		afterPageText: "页    共 {pages} 页",
		displayMsg: "当前显示 {from} - {to} 条记录，共 {total} 条记录"
	};
	if(pageparam.listtable.pagerbar){
		pageopts.buttons=pageparam.listtable.pagerbar;//分页栏加按钮
	}
	var p = $(pageparam.listtable.listname).datagrid("getPager");//返回页面对象
	$(p).pagination(pageopts);
	
	if(!aonclick[pageparam.listtable.listname]){//为防止重复绑定a标签
		aonclick[pageparam.listtable.listname]=1;
		loadonClick(pageparam);
	}
};
function controlListBtn(para,id,delAllId,fieds){
	if(para.indexOf(web.currentUser.username)<0){	
		if(fieds){
			var fs=fieds.split(",");
			for(var i in fs){
				$("#"+id).datagrid("hideColumn",fs[i]);
			}
		}
		$("#"+id+"QueryForm a.showDialog,."+id+" a.showDialog,."+id+" a.showDialogTop,."+id+" a[delete],."+id+" a#"+delAllId+",.controller").remove();
	}
};
//前端分页取数据
function pagerFilter(data){
	if(typeof data.data=="string"){
		var list=$.evalJSON(htmlDecode(data.data)).list;
		data.data={};
        data.data.rows=list;
	}else {
        data.data.rows = data.data.listData || data.data.originalRows || data.data || data || [];
        if(data.data.USERTYPE) data.data.rows=[];
    }
	if(data.data.listData){
		var datas=[];
		for(var i in data.data.rows){
			var l=0;
			var ll=0;
			for(var j in data.data.rows[i]){
				l++;
				if(data.data.rows[i][j]==null || data.data.rows[i][j]=="") ll++
			}
			if(l!=ll) datas.push(data.data.rows[i]);
		}
		data.data.rows=datas;
	}
    if (typeof data.data.rows.length == 'number' && typeof data.data.rows.splice == 'function'){    // 判断数据是否是数组
        data = {
			errcode:data.errcode,
			status:data.status,
			data:{
				total: data.data.rows.length,
				rows: data.data.rows
			}
        }
    }
    var dg = $(this);
    var opts = dg.datagrid('options');
    var pager = dg.datagrid('getPager');
    pager.pagination({
        onSelectPage:function(pageNum, pageSize){
            opts.pageNumber = pageNum;
            opts.pageSize = pageSize;
            pager.pagination('refresh',{
                pageNumber:pageNum,
                pageSize:pageSize
            });
            dg.datagrid('loadData',data);
        }
    });
    if (!data.data.originalRows){
        data.data.originalRows = (data.data.rows);
    }
    var start = (opts.pageNumber-1)*parseInt(opts.pageSize);
    var end = start + parseInt(opts.pageSize);
    data.data.rows = (data.data.originalRows.slice(start, end));
    return data;
};
function loadonClick(pageparam) {
    var listtable = pageparam.listtable.listname.substr(1, pageparam.listtable.listname.length - 1);	
	if(pageparam.dialogform){//初始化form表单的文件上传控件
		$(pageparam.dialogform.formname).find("input.cselectorImageUpload").each(function(i,v){
			initfileupload($(v));
		});
	}
	if(pageparam.readDialog){//初始化form表单的文件上传控件
		$(pageparam.readDialog.formname).find("input.cselectorImageUpload").each(function(i,v){
			initfileupload($(v));
		});
	}
	if($("#"+listtable+"QueryForm").length>0){//初始化form表单的文件上传控件
		$("#"+listtable+"QueryForm").find("input.cselectorImageUpload").each(function(i,v){
			initfileupload($(v));
		});
	}
    //选择每页显示多少条
    $("." + listtable).on("change", "select.pagination-page-list", function () {
        if ($(this).val() == "10") {
            if (window.sessionStorage) {
                window.sessionStorage.removeItem(pageparam.listtable.listname);
            } else {
                web.delCookie(pageparam.listtable.listname);
            }
        } else {
            if (window.sessionStorage) {
                window.sessionStorage.setItem(pageparam.listtable.listname, $(this).val());
            } else {
                web.setCookie(pageparam.listtable.listname, $(this).val());
            }
        }
    });
    //条件搜索
    $(pageparam.listtable.listname + "QueryForm").on("click", ".searchtable", function () {
		$(pageparam.listtable.listname).datagrid("clearSelections").datagrid("clearChecked");//刷新table
        var listnameF = $(this).parents("form").attr("id");
        var listname = listnameF.replace("QueryForm", "");//.substr(0,listnameF.length-9);
        var params = $("#" + listname).datagrid("options").queryParams;//先取得 datagrid 的查询参数
        if (pageparam.listtable.noload) {//是否默认查询数据
            $("#" + listname).datagrid("options").url = web.rootdir + pageparam.listtable.querycmd;//接口命令
        }
        if ($("#" + listnameF).form("validate")) {//查询条件需要校验
            if (pageparam.listtable.searchvalidate) {//遇到奇葩检验需要单独写时请加searchvalidate，为一个函数必须返回值true或者false
                if (eval(pageparam.listtable.searchvalidate())) {//只有奇葩校验规则返回值为true时才查询
                    searchtable(listnameF, listname, params);
                }
            } else {
                searchtable(listnameF, listname, params);
            }
        } else {
            //getparent().mesAlert("温馨提示", "查询条件校验失败！", 'warning');
			//getparent().mesShow("温馨提示","查询条件校验失败！", 2000,'orange');
			formValidateInfo(listnameF);
        }
    });
    //删除单条数据
    $("." + listtable).on("click", "a[delete]", function () {
        var $t = $(this);
        var id = $t.attr("deleteid");
        var url = $t.attr("delete");
        $.messager.confirm("删除", "确定删除吗？", function (r) {
            if (r) {
                var ajaxopts = {
                    url: url,
                    data: { "id": id },
                    success: function (data) {
						getparent().mesShow("温馨提示",data.message || "操作成功",2000);
                        $(pageparam.listtable.listname).datagrid("reload").datagrid("clearSelections");//刷新table
                    }
                };
                if ($t.attr("contentType")) {
                    ajaxopts.contentType = $t.attr("contentType");
                }
                ajaxgeneral(ajaxopts);
            }
        });
    });
    //批量删除数据参考sysUserList.html
    if (pageparam.listtable.deleteall) {
        $("." + listtable).on("click", "a#" + pageparam.listtable.deleteall.id, function () {
            var datas = $(pageparam.listtable.listname).datagrid("getChecked");
            var ids = [];
            for (var i in datas) {
                ids.push(datas[i].id || datas[i].ID);
            }
            if (ids.length > 0) {
                $.messager.confirm("删除", "确定删除吗？", function (r) {
                    if (r) {
                        var ajaxopts = {
                            url: pageparam.listtable.deleteall.url,
                            data: ids,
                            success: function (data) {
								getparent().mesShow("温馨提示",data.message || "操作成功",2000);
                                $(pageparam.listtable.listname).datagrid("reload").datagrid("clearSelections").datagrid("clearChecked");//刷新table
                            }
                        };
                        if (pageparam.listtable.deleteall.contentType) {
                            ajaxopts.contentType = pageparam.listtable.deleteall.contentType;
                        }else{
							ajaxopts.data={"ids":ids.join(",")};
						}
                        ajaxgeneral(ajaxopts);
                    }
                });
            } else {
                //getparent().mesAlert("温馨提示", "请选择要删除的行！", 'info');
				getparent().mesShow("温馨提示","请选择要删除的行！", 2000,'red');
            }
        });
    }
    //打开新增或修改对话框
    if (pageparam.dialogform) {
        $("." + listtable + "," + pageparam.listtable.listname + "QueryForm").on("click", "a.showDialog", function () {
            $(pageparam.listtable.listname).datagrid("clearSelections");//取消选择所有当前页中所有的行
            $(pageparam.dialogform.formname).form("reset").find("input,textarea").removeClass("validatebox-invalid");//把对话框里面的样式重置
            $(pageparam.dialogform.formname).find("span.textbox-invalid").removeClass("textbox-invalid");//把下拉选择框里面的样式重置
            $(pageparam.dialogform.formname).find("input.cselectorImageUpload").each(function (i, v) {//重置form之后文件上传控件变形或者重置
                $(v).trigger("change");
            });
			$(pageparam.dialogform.formname).find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
                $(v).trigger("change");
            });
            //重置form之后如果下拉框有需要特殊处理就特殊处理一下
            $(pageparam.dialogform.formname).find("select.easyui-combobox").each(function (i, v) {
                if ($(v).attr("conchange")) {//赋值之后对其他影响
                    if ($(v).attr("conchange").indexOf("()") > -1)
                        eval($(v).attr("conchange").replace("()", "") + "('" + $(v).val() + "')");
                    else
                        eval($(v).attr("conchange") + "('" + $(v).val() + "')");
                }
            });
            //处理默认值
            if ($(pageparam.dialogform.formname).attr("initsystem")) {
                eval($(pageparam.dialogform.formname).attr("initsystem"));
				$("input").removeClass("validatebox-invalid");//把对话框里面的样式重置
				$("span.textbox-invalid").removeClass("textbox-invalid");//把下拉选择框里面的样式重置
            }
            if (pageparam.dialogform.ctable) {
                var tabs = pageparam.dialogform.ctable.split(",");
                for (var i in tabs) {
                    $(pageparam.dialogform.formname + " table[id='" + tabs[i] + "'] tbody tr").remove();
                }
            }
            var index = parseInt($(this).attr("showDialogindex"));
            if (index >= 0) {
                //如果是修改就给对话框传要修改的记录数据
                $(pageparam.listtable.listname).datagrid("selectRow", index);//选择一行，行索引从0开始
                var row = $(pageparam.listtable.listname).datagrid("getSelected");//返回第一个被选中的行或如果没有选中的行则返回null
                if (row) {
                    if (pageparam.dialogform.getcmd || $(pageparam.dialogform.formname).attr("cmd-select")) {//如果需要调命令获取数据
                        var ajaxopts={
                            url: pageparam.dialogform.getcmd || $(pageparam.dialogform.formname).attr("cmd-select"),
                            data: { "id": row[pageparam.listtable.idField || "id"] },
                            success: function (datai) {
                                row = datai.data;
                                //数据赋值之前要干什么
                                if ($(pageparam.dialogform.formname).attr("beforerender")) {
                                    if ($(pageparam.dialogform.formname).attr("beforerender").indexOf("()") > -1)
                                        eval($(pageparam.dialogform.formname).attr("beforerender").replace("()", "(row,true)"));
                                    else
                                        eval($(pageparam.dialogform.formname).attr("beforerender") + "(row,true)");
                                }
                                //把取到的数据赋值到对应form表单
                                formval(row, pageparam.dialogform.formname, pageparam.dialogform.ctable, (pageparam.dialogform.divimages || ""), pageparam.dialogform.ctablerender);								
								//数据赋值之后要干什么
								if ($(pageparam.dialogform.formname).attr("getcallback")) {
									if ($(pageparam.dialogform.formname).attr("getcallback").indexOf("()") > -1)
										eval($(pageparam.dialogform.formname).attr("getcallback").replace("()", "(row)"));
									else
										eval($(pageparam.dialogform.formname).attr("getcallback") + "(row)");
								}
                            }
                        };
						if (pageparam.dialogform.scontentType || $(pageparam.dialogform.formname).attr("scontentType")) {
							ajaxopts.contentType=pageparam.dialogform.scontentType || $(pageparam.dialogform.formname).attr("scontentType");
						}
						ajaxgeneral(ajaxopts);
                    } else {
                        //数据赋值之前要干什么
                        if ($(pageparam.dialogform.formname).attr("beforerender")) {
                            if ($(pageparam.dialogform.formname).attr("beforerender").indexOf("()") > -1)
                                eval($(pageparam.dialogform.formname).attr("beforerender").replace("()", "(row,true)"));
                            else
                                eval($(pageparam.dialogform.formname).attr("beforerender") + "(row,true)");
                        }
                        //把取到的数据赋值到对应form表单
                        formval(row, pageparam.dialogform.formname, pageparam.dialogform.ctable, (pageparam.dialogform.divimages || ""), pageparam.dialogform.ctablerender);						
						//数据赋值之后要干什么
						if ($(pageparam.dialogform.formname).attr("getcallback")) {
							if ($(pageparam.dialogform.formname).attr("getcallback").indexOf("()") > -1)
								eval($(pageparam.dialogform.formname).attr("getcallback").replace("()", "(row)"));
							else
								eval($(pageparam.dialogform.formname).attr("getcallback") + "(row)");
						}
                    }
                }
            } else {
                //打开对话框之前要干什么
                if ($(pageparam.dialogform.formname).attr("beforerender")) {
                    if ($(pageparam.dialogform.formname).attr("beforerender").indexOf("()") > -1)
                        eval($(pageparam.dialogform.formname).attr("beforerender").replace("()", "({},false)"));
                    else
                        eval($(pageparam.dialogform.formname).attr("beforerender") + "({},false)");
                }
            }
            btn_sure = 1;
            var dialogformopts = {
                modal: true,//是否将窗体显示为模式化窗口
                closed: pageparam.dialogclose ? true : false
            };
            if (!pageparam.dialogform.dialognobutton) {//判断是否需要对话框按钮
                dialogformopts.buttons = [{
                    text: "确认",
                    handler: function () {
                        if (btn_sure == 1) {
							var formid=pageparam.dialogform.formname.substr(1,pageparam.dialogform.formname.length-1);
							var $form=$(pageparam.dialogform.formname);
							var url=pageparam.dialogform.insertcmd || $form.attr("cmd-insert");
							if(index>=0){
								url=pageparam.dialogform.updatacmd || $form.attr("cmd-update");
							}
                            if ($(pageparam.dialogform.formname).form("validate")) {//表单检验是否成功
                                var uploadv = 1;
                                $(pageparam.dialogform.formname).find("input.cselectorImageUpload").each(function (i, v) {
                                    if ($(v).attr("required") && $(v).val() == "") {
                                        uploadv = 0;
                                        //getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
										//getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
                                        return false;
                                    }
                                });								
								$(pageparam.dialogform.formname).find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
									$(v).trigger("getdata");
									if ($(v).attr("required") && $(v).val() == "") {
                                        uploadv = 0;
                                        //getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
										//getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
                                        return false;
                                    }
								});
                                if (uploadv == 1) {
                                    btn_sure = 2;
                                    if ($(pageparam.dialogform.formname).attr("contentType")) {//设置contentType表示不用form表单方式提交，支持json和kv，设置什么就以什么方式传值
                                        var data = {};
                                        $(pageparam.dialogform.formname).find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
                                            if ($(v).attr("name")) {
                                                if ($(v).attr("type") == "password") {
                                                    data[v.name] = hex_md5(v.value || "");
                                                } else if($(v).hasClass("cselectorImageUpload")){
                                                    data[v.name] = v.value?($(v).attr("valType")?v.value:$.evalJSON(v.value)):[];
                                                } else{
                                                    data[v.name] = v.value || "";
                                                }
                                            }
                                        });

                                        //特殊处理列表大json串
                                        if (pageparam.dialogform.ctable) {
                                            var tabs = pageparam.dialogform.ctable.split(",");
                                            for (var i in tabs) {
                                                var list = [];
                                                var $table = $(pageparam.dialogform.formname + " table[id='" + tabs[i] + "']");
                                                $table.find("tbody tr").each(function (x, y) {
                                                    var listi = {};
                                                    $(y).find("td[path]").each(function (a, b) {
                                                        listi[$(b).attr("path")] = $(b).text() || "";
                                                    });
                                                    $(y).find("a[path]").each(function (a, b) {
                                                        listi[$(b).attr("path")] = $(b).attr("href") || "";
                                                    });												
													$(y).find("input,select,textarea").each(function (a, b) {
														if ($(b).attr("name")) {
															if ($(b).attr("type") == "password") {
																listi[b.name] = hex_md5(b.value || "");
															} else if($(b).hasClass("cselectorImageUpload")){
																listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
															} else{
																listi[b.name] = b.value || "";
															}
														}
													});
                                                    list.push(listi);
                                                });
                                                data[tabs[i]] = $table.attr("listType")?list:$.toJSON(list);
                                            }
                                        }else{
											$(pageparam.dialogform.formname).find("table[pathsave]").each(function(i,v){
												var list=[];
												$(v).find("tbody tr").each(function (x, y) {
													var listi = {};
													$(y).find("td[path]").each(function (a, b) {
														listi[$(b).attr("path")] = $(b).text() || "";
													});
													$(y).find("a[path]").each(function (a, b) {
														listi[$(b).attr("path")] = $(b).attr("href") || "";
													});													
													$(y).find("input,select,textarea").each(function (a, b) {
														if ($(b).attr("name")) {
															if ($(b).attr("type") == "password") {
																listi[b.name] = hex_md5(b.value || "");
															} else if($(b).hasClass("cselectorImageUpload")){
																listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
															} else{
																listi[b.name] = b.value || "";
															}
														}
													});
													list.push(listi);
												});
												data[$(v).attr("pathsave")] = $(v).attr("listType")?list:$.toJSON(list);
											});
										}
                                        var submitval = true;
                                        if (pageparam.dialogform.onSubmit) {//如果提交之前需要额外传参或者其他操作可在页面上配置onSubmit函数，要求有return true;或者return false;(说明中断提交)
                                            submitval = eval(pageparam.dialogform.onSubmit(data));
                                        }
                                        if (submitval) {
                                            if (pageparam.dialogform.suretext) {
                                                var suretext = eval(pageparam.dialogform.suretext());
                                                $.messager.confirm(suretext.title, suretext.titletext, function (r) {
                                                    if (r) {
														formajax(url,data,(pageparam.dialogform.contentType || $form.attr("contentType")),pageparam,(pageparam.dialogform.submitcallback || $form.attr("submitcallback")));
                                                    }
                                                });
                                                btn_sure = 1;
                                            } else {
													formajax(url,data,(pageparam.dialogform.contentType || $form.attr("contentType")),pageparam,(pageparam.dialogform.submitcallback || $form.attr("submitcallback")));
                                            }
                                        }else{
											btn_sure = 1;
										}
                                    } else {//原始form表单提交方式
                                        var formopts = {
                                            url: index >= 0 ? web.rootdir + pageparam.dialogform.updatacmd : web.rootdir + pageparam.dialogform.insertcmd,
                                            dataType: "json",
                                            success: function (data) {//成功
                                                btn_sure = 1;
                                                data = $.evalJSON(data);
                                                if (data.errcode == 0) {
                                                    $.messager.show({
                                                        title: "温馨提示",
                                                        msg: data.message || "操作成功",
                                                        timeout: 2500,
                                                        showType: "slide",
                                                        style: {
                                                            right: '',
                                                            top: '',
                                                            bottom: ''
                                                        }
                                                    });
                                                    $(pageparam.dialogform.dialogid).dialog("close");//关闭对话框
                                                    $(pageparam.listtable.listname).datagrid("reload").datagrid("clearSelections");//刷新table
                                                } else {
                                                    //getparent().mesAlert("温馨提示", data.message, 'error');
													getparent().mesShow("温馨提示",data.message, 2000,'red');
                                                    btn_sure = 1;
                                                }
                                            }, error: function (data) {
                                                if (data.responseText.indexOf("login_tab") > -1) {
                                                    getparent().location.href = web.rootdir + "action/login";
                                                } else {
                                                    //getparent().mesAlert("温馨提示", "操作失败", 'error');
													getparent().mesShow("温馨提示","操作失败", 2000,'red');
                                                    btn_sure = 1;
                                                }
                                            }
                                        };
                                        if (pageparam.dialogform.onSubmit) {
                                            formopts.onSubmit = pageparam.dialogform.onSubmit;
                                        }
                                        $(pageparam.dialogform.formname).form("submit", formopts);
                                    }
                                }else{
									formValidateInfo(formid);
								}
                            } else {//校验不成功，如果有提示信息弹出提示信息
								formValidateInfo(formid);                                
                            }
                        }
                    }
                }, {
                    text: "关闭",
                    handler: function () {
                        $(pageparam.dialogform.dialogid).dialog("close");
                    }
                }];
            }
            $(pageparam.dialogform.dialogid).dialog(dialogformopts);
            if (pageparam.dialogclose) $(pageparam.dialogform.dialogid).dialog('open');
        });
        //外部引用新增或修改对话框
		$("." + listtable + "," + pageparam.listtable.listname + "QueryForm").on("click", "a.showDialogTop,a.readDialogTop", function () {
            $(pageparam.listtable.listname).datagrid("clearSelections");//取消选择所有当前页中所有的行
			var listPageName=$(this).attr("listPageName");
			var callback=listtable+"showDialogTop";
			var url=$(this).attr("openlayer");
            var gps=getQueryString(url);
			var index = parseInt($(this).attr("showDialogindex"));
			getparent().dialogTP[callback]={"pageparam":pageparam,"gps":gps};
            if (gps.id) {
                //如果是修改就给对话框传要修改的记录数据
                $(pageparam.listtable.listname).datagrid("selectRow", index);//选择一行，行索引从0开始
                var row = $(pageparam.listtable.listname).datagrid("getSelected");//返回第一个被选中的行或如果没有选中的行则返回null
				getparent().dialogTP[callback].row=row;
			}
			var opts={
				title:$(this).attr("title") || "新增或修改",
				width:$(this).attr("width") || 1000,
				height:$(this).attr("height") || 550,
				modal: true,//是否将窗体显示为模式化窗口
				closed: false,
                buttons:[],
				content: "<iframe id='"+callback+"F' name='"+callback+"F' scrolling='auto' frameborder='0' src='"+web.rootdir+url+"' style='width:100%; height:100%; display:block;' onload='getparent().sDTOnload(\""+callback+"\")'></iframe>"
			};
			btn_sure == 1;
			if(!gps.nobutton) {
				var closeBtn={
                    text: "关闭",
                    handler: function () {
                        getparent().dialogClose(callback);
                    }
                };
				var sureBtn={
                    text: "确认",
                    handler: function () {
                        if (btn_sure == 1) {
                            var $form = $(getparent().window[callback + "F"].document).find(pageparam.listtable.listname + "AddForm");
                            var url = pageparam.dialogform.insertcmd || $form.attr("cmd-insert");
							if(pageparam.dialogform.showDialogTopCmd) url=$form.attr("cmd-insert") || pageparam.dialogform.insertcmd;
                            if (gps.id) {
                                url = pageparam.dialogform.updatacmd || $form.attr("cmd-update");
								if(pageparam.dialogform.showDialogTopCmd) url=$form.attr("cmd-update") || pageparam.dialogform.updatacmd;
                            }

                            if (getparent().window[callback + 'F'].window.fvalidate()) {//表单检验是否成功
                                //var uploadv = 1;
                                //$form.find("input.cselectorImageUpload").each(function (i, v) {
                                //    if ($(v).attr("required") && $(v).val() == "") {
                                //        uploadv = 0;
                                //        //getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
                                //        //getparent().mesShow("温馨提示", $(v).attr("mesInfo"), 2000, 'orange');
                                //        return false;
                                //    }
                                //});																							
								//$form.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
								//	$(v).trigger("getdata");
								//	if ($(v).attr("required") && $(v).val() == "") {
								//		uploadv = 0;
								//		//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
								//		//getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
								//		return false;
								//	}
								//});
                                //if (uploadv == 1) {
                                    btn_sure = 2;
                                    if ($form.attr("contentType")) {//设置contentType表示不用form表单方式提交，支持json和kv，设置什么就以什么方式传值
                                        var data = {};
                                        $form.find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
                                            if ($(v).attr("name")) {
                                                if ($(v).attr("type") == "password") {
                                                    data[v.name] = hex_md5(v.value || "");
                                                } else if ($(v).hasClass("cselectorImageUpload")) {
                                                    data[v.name] = v.value ? ($(v).attr("valType") ? v.value : $.evalJSON(v.value)) : [];
                                                } else {
                                                    data[v.name] = v.value || "";
                                                }
                                            }
                                        });
                                        //特殊处理列表大json串
                                        if (pageparam.dialogform.ctable) {
                                            var tabs = pageparam.dialogform.ctable.split(",");
                                            for (var i in tabs) {
                                                var list = [];
                                                var $table = $form.find("table[id='" + tabs[i] + "']");
                                                $table.find("tbody tr").each(function (x, y) {
                                                    var listi = {};
                                                    $(y).find("td[path]").each(function (a, b) {
                                                        listi[$(b).attr("path")] = $(b).text() || "";
                                                    });
                                                    $(y).find("a[path]").each(function (a, b) {
                                                        listi[$(b).attr("path")] = $(b).attr("href") || "";
                                                    });											
													$(y).find("input,select,textarea").each(function (a, b) {
														if ($(b).attr("name")) {
															if ($(b).attr("type") == "password") {
																listi[b.name] = hex_md5(b.value || "");
															} else if($(b).hasClass("cselectorImageUpload")){
																listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
															} else{
																listi[b.name] = b.value || "";
															}
														}
													});
                                                    list.push(listi);
                                                });
                                                data[tabs[i]] = $table.attr("listType") ? list : $.toJSON(list);
                                            }
                                        } else {
                                            $form.find("table[pathsave]").each(function (i, v) {
                                                var list = [];
                                                $(v).find("tbody tr").each(function (x, y) {
                                                    var listi = {};
                                                    $(y).find("td[path]").each(function (a, b) {
                                                        listi[$(b).attr("path")] = $(b).text() || "";
                                                    });
                                                    $(y).find("a[path]").each(function (a, b) {
                                                        listi[$(b).attr("path")] = $(b).attr("href") || "";
                                                    });											
													$(y).find("input,select,textarea").each(function (a, b) {
														if ($(b).attr("name")) {
															if ($(b).attr("type") == "password") {
																listi[b.name] = hex_md5(b.value || "");
															} else if($(b).hasClass("cselectorImageUpload")){
																listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
															} else{
																listi[b.name] = b.value || "";
															}
														}
													});
                                                    list.push(listi);
                                                });
                                                data[$(v).attr("pathsave")] = $(v).attr("listType") ? list : $.toJSON(list);
                                            });
                                        }
                                        var submitval = true;
                                        if (pageparam.dialogform.onSubmit) {//如果提交之前需要额外传参或者其他操作可在页面上配置onSubmit函数，要求有return true;或者return false;(说明中断提交)
                                            submitval = getparent().window[callback + 'F'].window[pageparam.dialogform.onSubmit](data);
                                        }
                                        if ($form.attr("onSubmit")) {
                                            if ($form.attr("onSubmit").indexOf("()") > -1)
                                                submitval = getparent().window[callback + 'F'].window[$form.attr("onSubmit").replace("()", "")](data);
                                            else
                                                submitval = getparent().window[callback + 'F'].window[$form.attr("onSubmit")](data);
                                        }
                                        if ($form.attr("beforeSubmit")) {
                                            if ($form.attr("beforeSubmit").indexOf("()") > -1)
                                                submitval = getparent().window[callback + 'F'].window[$form.attr("beforeSubmit").replace("()", "")](data);
                                            else
                                                submitval = getparent().window[callback + 'F'].window[$form.attr("beforeSubmit")](data);
                                        }
                                        if (submitval) {
                                            if (pageparam.dialogform.suretext) {
                                                var suretext = getparent().window[callback + 'F'].window[pageparam.dialogform.suretext]();
                                                $.messager.confirm(suretext.title, suretext.titletext, function (r) {
                                                    if (r) {
                                                        formajax(url, data, (pageparam.dialogform.contentType || $form.attr("contentType")), pageparam, (pageparam.dialogform.submitcallback || $form.attr("submitcallback")), callback, listPageName);
                                                    }
                                                });
                                                btn_sure = 1;
                                            } else {
                                                formajax(url, data, (pageparam.dialogform.contentType || $form.attr("contentType")), pageparam, (pageparam.dialogform.submitcallback || $form.attr("submitcallback")), callback, listPageName);
                                            }
                                        }else{
											btn_sure = 1;
										}
                                    } else {//原始form表单提交方式
                                        var formopts = {
                                            url: index >= 0 ? web.rootdir + pageparam.dialogform.updatacmd : web.rootdir + pageparam.dialogform.insertcmd,
                                            dataType: "json",
                                            success: function (data) {//成功
                                                btn_sure = 1;
                                                data = $.evalJSON(data);
                                                if (data.errcode ==0) {
                                                    $.messager.show({
                                                        title: "温馨提示",
                                                        msg: data.message || "操作成功",
                                                        timeout: 2500,
                                                        showType: "slide",
                                                        style: {
                                                            right: '',
                                                            top: '',
                                                            bottom: ''
                                                        }
                                                    });
                                                    $(pageparam.dialogform.dialogid).dialog("close");//关闭对话框
                                                    $(pageparam.listtable.listname).datagrid("reload").datagrid("clearSelections");//刷新table
                                                } else {
                                                    //getparent().mesAlert("温馨提示", data.message, 'error');
                                                    getparent().mesShow("温馨提示", data.message, 2000, 'red');
                                                    btn_sure = 1;
                                                }
                                            }, error: function (data) {
                                                if (data.responseText.indexOf("login_tab") > -1) {
                                                    getparent().location.href = web.rootdir + "action/login";
                                                } else {
                                                    //getparent().mesAlert("温馨提示", "操作失败", 'error');
                                                    getparent().mesShow("温馨提示", "操作失败", 2000, 'red');
                                                    btn_sure = 1;
                                                }
                                            }
                                        };
                                        if (pageparam.dialogform.onSubmit) {
                                            formopts.onSubmit = pageparam.dialogform.onSubmit;
                                        }
                                        $form.form("submit", formopts);
                                    }
                                //}
                            } else {//校验不成功，如果有提示信息弹出提示信息
                                //getparent().mesAlert("温馨提示", "必填项校验不通过！", 'error');
                                //getparent().mesShow("温馨提示", "必填项校验不通过！", 2000, 'red');
                            }
                        }
                    }
                };
                if ($(this).parents("form").length>0 && $(this).attr("again")) {
                    opts.buttons.push({
                        text: "创建并继续",
                        handler: function () {
                            if (btn_sure == 1) {
                                var $form = $(getparent().window[callback + "F"].document).find(pageparam.listtable.listname + "AddForm");
                                var url = pageparam.dialogform.insertcmd || $form.attr("cmd-insert");
                                if (gps.id) {
                                    url = pageparam.dialogform.updatacmd || $form.attr("cmd-update");
                                }

                                if (getparent().window[callback + 'F'].window.fvalidate()) {//表单检验是否成功
                                    //var uploadv = 1;
                                    //$form.find("input.cselectorImageUpload").each(function (i, v) {
                                    //    if ($(v).attr("required") && $(v).val() == "") {
                                    //        uploadv = 0;
                                    //        //getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
                                    //        //getparent().mesShow("温馨提示", $(v).attr("mesInfo"), 2000, 'orange');
                                    //        return false;
                                    //    }
                                    //});																
									//$form.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
									//	$(v).trigger("getdata");
									//	if ($(v).attr("required") && $(v).val() == "") {
									//		uploadv = 0;
									//		//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
									//		//getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
									//		return false;
									//	}
									//});
                                    //if (uploadv == 1) {
                                        btn_sure = 2;
                                        if ($form.attr("contentType")) {//设置contentType表示不用form表单方式提交，支持json和kv，设置什么就以什么方式传值
                                            var data = {};
                                            $form.find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
                                                if ($(v).attr("name")) {
                                                    if ($(v).attr("type") == "password") {
                                                        data[v.name] = hex_md5(v.value);
                                                    } else if ($(v).hasClass("cselectorImageUpload")) {
                                                        data[v.name] = v.value ? ($(v).attr("valType") ? v.value : $.evalJSON(v.value)) : [];
                                                    } else {
                                                        data[v.name] = v.value;
                                                    }
                                                }
                                            });
                                            //特殊处理列表大json串
                                            if (pageparam.dialogform.ctable) {
                                                var tabs = pageparam.dialogform.ctable.split(",");
                                                for (var i in tabs) {
                                                    var list = [];
                                                    var $table = $form.find("table[id='" + tabs[i] + "']");
                                                    $table.find("tbody tr").each(function (x, y) {
                                                        var listi = {};
                                                        $(y).find("td[path]").each(function (a, b) {
                                                            listi[$(b).attr("path")] = $(b).text() || "";
                                                        });
                                                        $(y).find("a[path]").each(function (a, b) {
                                                            listi[$(b).attr("path")] = $(b).attr("href") || "";
                                                        });											
														$(y).find("input,select,textarea").each(function (a, b) {
															if ($(b).attr("name")) {
																if ($(b).attr("type") == "password") {
																	listi[b.name] = hex_md5(b.value || "");
																} else if($(b).hasClass("cselectorImageUpload")){
																	listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
																} else{
																	listi[b.name] = b.value || "";
																}
															}
														});
                                                        list.push(listi);
                                                    });
                                                    data[tabs[i]] = $table.attr("listType") ? list : $.toJSON(list);
                                                }
                                            } else {
                                                $form.find("table[pathsave]").each(function (i, v) {
                                                    var list = [];
                                                    $(v).find("tbody tr").each(function (x, y) {
                                                        var listi = {};
                                                        $(y).find("td[path]").each(function (a, b) {
                                                            listi[$(b).attr("path")] = $(b).text() || "";
                                                        });
                                                        $(y).find("a[path]").each(function (a, b) {
                                                            listi[$(b).attr("path")] = $(b).attr("href") || "";
                                                        });												
														$(y).find("input,select,textarea").each(function (a, b) {
															if ($(b).attr("name")) {
																if ($(b).attr("type") == "password") {
																	listi[b.name] = hex_md5(b.value || "");
																} else if($(b).hasClass("cselectorImageUpload")){
																	listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
																} else{
																	listi[b.name] = b.value || "";
																}
															}
														});
                                                        list.push(listi);
                                                    });
                                                    data[$(v).attr("pathsave")] = $(v).attr("listType") ? list : $.toJSON(list);
                                                });
                                            }
                                            var submitval = true;
                                            if (pageparam.dialogform.onSubmit) {//如果提交之前需要额外传参或者其他操作可在页面上配置onSubmit函数，要求有return true;或者return false;(说明中断提交)
                                                submitval = getparent().window[callback + 'F'].window[pageparam.dialogform.onSubmit](data);
                                            }
                                            if ($form.attr("onSubmit")) {
                                                if ($form.attr("onSubmit").indexOf("()") > -1)
                                                    submitval = getparent().window[callback + 'F'].window[$form.attr("onSubmit").replace("()", "")](data);
                                                else
                                                    submitval = getparent().window[callback + 'F'].window[$form.attr("onSubmit")](data);
                                            }
                                            if ($form.attr("beforeSubmit")) {
                                                if ($form.attr("beforeSubmit").indexOf("()") > -1)
                                                    submitval = getparent().window[callback + 'F'].window[$form.attr("beforeSubmit").replace("()", "")](data);
                                                else
                                                    submitval = getparent().window[callback + 'F'].window[$form.attr("beforeSubmit")](data);
                                            }
                                            if (submitval) {
                                                if (pageparam.dialogform.suretext) {
                                                    var suretext = getparent().window[callback + 'F'].window[pageparam.dialogform.suretext]();
                                                    $.messager.confirm(suretext.title, suretext.titletext, function (r) {
                                                        if (r) {
                                                            formajax(url, data, (pageparam.dialogform.contentType || $form.attr("contentType")), pageparam, (pageparam.dialogform.submitcallback || $form.attr("submitcallback")), callback, listPageName,true);
                                                        }
                                                    });
                                                    btn_sure = 1;
                                                } else {
                                                    formajax(url, data, (pageparam.dialogform.contentType || $form.attr("contentType")), pageparam, (pageparam.dialogform.submitcallback || $form.attr("submitcallback")), callback, listPageName,true);
                                                }
                                            }else{
												btn_sure = 1;
											}
                                        } else {//原始form表单提交方式
                                            var formopts = {
                                                url: index >= 0 ? web.rootdir + pageparam.dialogform.updatacmd : web.rootdir + pageparam.dialogform.insertcmd,
                                                dataType: "json",
                                                success: function (data) {//成功
                                                    btn_sure = 1;
                                                    data = $.evalJSON(data);
                                                    if (data.errcode == 0) {
                                                        $.messager.show({
                                                            title: "温馨提示",
                                                            msg: data.message || "操作成功",
                                                            timeout: 2500,
                                                            showType: "slide",
                                                            style: {
                                                                right: '',
                                                                top: '',
                                                                bottom: ''
                                                            }
                                                        });
                                                        $(pageparam.dialogform.dialogid).dialog("close");//关闭对话框
                                                        $(pageparam.listtable.listname).datagrid("reload").datagrid("clearSelections");//刷新table
                                                    } else {
                                                        //getparent().mesAlert("温馨提示", data.message, 'error');
                                                        getparent().mesShow("温馨提示", data.message, 2000, 'red');
                                                        btn_sure = 1;
                                                    }
                                                }, error: function (data) {
                                                    if (data.responseText.indexOf("login_tab") > -1) {
                                                        getparent().location.href = web.rootdir + "action/login";
                                                    } else {
                                                        //getparent().mesAlert("温馨提示", "操作失败", 'error');
                                                        getparent().mesShow("温馨提示", "操作失败", 2000, 'red');
                                                        btn_sure = 1;
                                                    }
                                                }
                                            };
                                            if (pageparam.dialogform.onSubmit) {
                                                formopts.onSubmit = pageparam.dialogform.onSubmit;
                                            }
                                            $form.form("submit", formopts);
                                        }
                                    //}
                                } else {//校验不成功，如果有提示信息弹出提示信息
                                    //getparent().mesAlert("温馨提示", "必填项校验不通过！", 'error');
                                    //getparent().mesShow("温馨提示", "必填项校验不通过！", 2000, 'red');
                                }
                            }
                        }
                    });
                }
                if (gps.type && gps.type == "read") {
                    opts.buttons.push({
                        text: "修改",
                        handler: function () {							
                            $("#"+callback).dialog("setTitle","修改");
							var options=$("#"+callback).dialog("options");
							url=url.replace("&type=read","").replace("type=read&","").replace("type=read","");	
							getparent().dialogTP[callback].gps=getQueryString(url);	
							options.content="<iframe id='"+callback+"F' name='"+callback+"F' scrolling='auto' frameborder='0' src='"+web.rootdir+url+"' style='width:100%; height:100%; display:block;' onload='getparent().sDTOnload(\""+callback+"\")'></iframe>";		
							options.buttons=[sureBtn,closeBtn];
							$("#"+callback).dialog(options);
                            //getparent().window[callback + 'F'].window.formReadyNO();
                        }
                    });
                }else{			
					opts.buttons=[sureBtn,closeBtn];
				}
            }
            getparent().dialogT(callback,opts,pageparam);
        });
        //外部引用新增或修改对该列表无关
        $("." + listtable + "," + pageparam.listtable.listname + "QueryForm").on("click", "a.newDialogTop", function () {
            $(pageparam.listtable.listname).datagrid("clearSelections");//取消选择所有当前页中所有的行
			var formName=$(this).attr("formName");
            var listPageName=$(this).attr("listPageName");
            var callback=listtable+"newDialogTop";
            var url=$(this).attr("openlayer");
            var gps=getQueryString(url);
            var index = parseInt($(this).attr("showDialogindex"));
            getparent().dialogTP[callback]={"pageparam":pageparam,"gps":gps};
            if (gps.id) {
                //如果是修改就给对话框传要修改的记录数据
                $(pageparam.listtable.listname).datagrid("selectRow", index);//选择一行，行索引从0开始
                var row = $(pageparam.listtable.listname).datagrid("getSelected");//返回第一个被选中的行或如果没有选中的行则返回null
                getparent().dialogTP[callback].row=row;
            }
            var opts={
                title:$(this).attr("title") || "创建新窗口",
                width:$(this).attr("width") || 1000,
                height:$(this).attr("height") || 550,
                modal: true,//是否将窗体显示为模式化窗口
                closed: false,
                buttons:[],
                content: "<iframe id='"+callback+"F' name='"+callback+"F' scrolling='auto' frameborder='0' src='"+web.rootdir+url+"' style='width:100%; height:100%; display:block;' onload='getparent().sDTOnload(\""+callback+"\",\""+formName+"\")'></iframe>"
            };
            btn_sure == 1;
			if ($(this).attr("again")) {
                opts.buttons.push({
                    text: "创建并继续",
                    handler: function () {
                        if (btn_sure == 1) {
                            var $form=$(getparent().window[callback+"F"].document).find("#"+formName);
                            var url=$form.attr("cmd-insert");
                            if(gps.id){
                                url=$form.attr("cmd-update");
                            }

                            if (getparent().window[callback+'F'].window.fvalidate()) {//表单检验是否成功
                                //var uploadv = 1;
                                //$form.find("input.cselectorImageUpload").each(function (i, v) {
                                //    if ($(v).attr("required") && $(v).val() == "") {
                                //        uploadv = 0;
                                //        //getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
                                //        getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
                                //        return false;
                                //    }
                                //});															
								//$form.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
								//	$(v).trigger("getdata");
								//	if ($(v).attr("required") && $(v).val() == "") {
								//		uploadv = 0;
								//		//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
								//		getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
								//		return false;
								//	}
								//});
                                //if (uploadv == 1) {
                                    btn_sure = 2;
                                    if ($form.attr("contentType")) {//设置contentType表示不用form表单方式提交，支持json和kv，设置什么就以什么方式传值
                                        var data = {};
                                        $form.find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
                                            if ($(v).attr("name")) {
                                                if ($(v).attr("type") == "password") {
                                                    data[v.name] = hex_md5(v.value);
                                                } else if($(v).hasClass("cselectorImageUpload")){
                                                    data[v.name] = v.value?($(v).attr("valType")?v.value:$.evalJSON(v.value)):[];
                                                } else{
                                                    data[v.name] = v.value;
                                                }
                                            }
                                        });
                                        $form.find("table[pathsave]").each(function(i,v){
                                            var list=[];
                                            $(v).find("tbody tr").each(function (x, y) {
                                                var listi = {};
                                                $(y).find("td[path]").each(function (a, b) {
                                                    listi[$(b).attr("path")] = $(b).text() || "";
												});
                                                $(y).find("a[path]").each(function (a, b) {
                                                    listi[$(b).attr("path")] = $(b).attr("href") || "";
												});											
												$(y).find("input,select,textarea").each(function (a, b) {
													if ($(b).attr("name")) {
														if ($(b).attr("type") == "password") {
															listi[b.name] = hex_md5(b.value || "");
														} else if($(b).hasClass("cselectorImageUpload")){
															listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
														} else{
															listi[b.name] = b.value || "";
														}
													}
												});
                                                list.push(listi);});
                                            data[$(v).attr("pathsave")] = $(v).attr("listType")?list:$.toJSON(list);
                                        });
                                        var submitval = true;
                                        if ($form.attr("onSubmit")) {
                                            if ($form.attr("onSubmit").indexOf("()") > -1)
                                                submitval =getparent().window[callback+'F'].window[$form.attr("onSubmit").replace("()", "")](data);
                                            else
                                                submitval =getparent().window[callback+'F'].window[$form.attr("onSubmit")](data);
                                        }
                                        if ($form.attr("beforeSubmit")) {
                                            if ($form.attr("beforeSubmit").indexOf("()") > -1)
                                                submitval =getparent().window[callback+'F'].window[$form.attr("beforeSubmit").replace("()", "")](data);
                                            else
                                                submitval =getparent().window[callback+'F'].window[$form.attr("beforeSubmit")](data);
                                        }
                                        if (submitval) {
                                            if ($form.attr("suretext")) {
                                                var suretext = getparent().window[callback+'F'].window[$form.attr("suretext")]();
                                                $.messager.confirm(suretext.title, suretext.titletext, function (r) {
                                                    if (r) {
                                                        formajax(url,data,$form.attr("contentType"),pageparam,$form.attr("submitcallback"),callback,listPageName,true);
                                                    }
                                                });
                                                btn_sure = 1;
                                            } else {
                                                formajax(url,data,$form.attr("contentType"),pageparam,$form.attr("submitcallback"),callback,listPageName,true);
                                            }
                                        }else{
											btn_sure = 1;
										}
                                    }
                                //}
                            } else {//校验不成功，如果有提示信息弹出提示信息
                                //getparent().mesAlert("温馨提示", "必填项校验不通过！", 'error');
                                //getparent().mesShow("温馨提示","必填项校验不通过！", 2000,'red');
                            }
                        }
                    }
                });
            }
            if(gps.type && gps.type=="read"){
                opts.buttons.push({
                    text: "修改",
                    handler: function () {
						$("#"+callback).dialog("setTitle","修改");
                        getparent().window[callback+'F'].window.formReadyNO();
                    }
                });
            }
            opts.buttons.push({
                text: "确认",
                handler: function () {
                    if (btn_sure == 1) {
                        var $form=$(getparent().window[callback+"F"].document).find("#"+formName);
                        var url=$form.attr("cmd-insert");
                        if(gps.id){
                            url=$form.attr("cmd-update");
                        }

                        if (getparent().window[callback+'F'].window.fvalidate()) {//表单检验是否成功
                            //var uploadv = 1;
                            //$form.find("input.cselectorImageUpload").each(function (i, v) {
                            //    if ($(v).attr("required") && $(v).val() == "") {
                            //        uploadv = 0;
                            //        //getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
                            //        getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
                            //        return false;
                            //    }
                            //});															
							//$form.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
							//	$(v).trigger("getdata");
							//	if ($(v).attr("required") && $(v).val() == "") {
							//		uploadv = 0;
							//		//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
							//		getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
							//		return false;
							//	}
							//});
                            //if (uploadv == 1) {
                                btn_sure = 2;
                                if ($form.attr("contentType")) {//设置contentType表示不用form表单方式提交，支持json和kv，设置什么就以什么方式传值
                                    var data = {};
                                    $form.find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
                                        if ($(v).attr("name")) {
                                            if ($(v).attr("type") == "password") {
                                                data[v.name] = hex_md5(v.value || "");
                                            } else if($(v).hasClass("cselectorImageUpload")){
                                                data[v.name] = v.value?($(v).attr("valType")?v.value:$.evalJSON(v.value)):[];
                                            } else{
                                                data[v.name] = v.value || "";
                                            }
                                        }
                                    });
                                    $form.find("table[pathsave]").each(function(i,v){
                                    	var list=[];
                                    	$(v).find("tbody tr").each(function (x, y) {
                                    		var listi = {};
                                    		$(y).find("td[path]").each(function (a, b) {
                                    			listi[$(b).attr("path")] = $(b).text() || "";
											});
                                    		$(y).find("a[path]").each(function (a, b) {
                                    			listi[$(b).attr("path")] = $(b).attr("href") || "";
											});											
											$(y).find("input,select,textarea").each(function (a, b) {
												if ($(b).attr("name")) {
													if ($(b).attr("type") == "password") {
														listi[b.name] = hex_md5(b.value || "");
													} else if($(b).hasClass("cselectorImageUpload")){
														listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
													} else{
														listi[b.name] = b.value || "";
													}
												}
											});
                                    		list.push(listi);});
                                    	data[$(v).attr("pathsave")] = $(v).attr("listType")?list:$.toJSON(list);
                                    });
                                    var submitval = true;
                                    if ($form.attr("onSubmit")) {
                                        if ($form.attr("onSubmit").indexOf("()") > -1)
                                            submitval =getparent().window[callback+'F'].window[$form.attr("onSubmit").replace("()", "")](data);
                                        else
                                            submitval =getparent().window[callback+'F'].window[$form.attr("onSubmit")](data);
                                    }
                                    if ($form.attr("beforeSubmit")) {
                                        if ($form.attr("beforeSubmit").indexOf("()") > -1)
                                            submitval =getparent().window[callback+'F'].window[$form.attr("beforeSubmit").replace("()", "")](data);
                                        else
                                            submitval =getparent().window[callback+'F'].window[$form.attr("beforeSubmit")](data);
                                    }
                                    if (submitval) {
                                        if ($form.attr("suretext")) {
                                            var suretext = getparent().window[callback+'F'].window[$form.attr("suretext")]();
                                            $.messager.confirm(suretext.title, suretext.titletext, function (r) {
                                                if (r) {
                                                    formajax(url,data,$form.attr("contentType"),pageparam,$form.attr("submitcallback"),callback,listPageName);
                                                }
                                            });
                                            btn_sure = 1;
                                        } else {
                                            formajax(url,data,$form.attr("contentType"),pageparam,$form.attr("submitcallback"),callback,listPageName);
                                        }
                                    }else{
										btn_sure = 1;
									}
                                }
                            //}
                        } else {//校验不成功，如果有提示信息弹出提示信息
                            //getparent().mesAlert("温馨提示", "必填项校验不通过！", 'error');
                            //getparent().mesShow("温馨提示","必填项校验不通过！", 2000,'red');
                        }
                    }
                }
            }, {
                text: "关闭",
                handler: function () {
                    getparent().dialogClose(callback);
                }
            });
            getparent().dialogT(callback,opts,null);
        });
        //新增子选项
		$(pageparam.dialogform.formname).on("click", "a.a_add_btnN", function () {

		});
		//新增子选项打开对话框
        $(pageparam.dialogform.formname).on("click", "a.a_add_btn,a.a_mod_btn", function () {
            var $t = $(this);
            var formname = $t.attr("dialogname")+"Form";
            var dialogname = $t.attr("dialogname")+"Dialog";
			var $formt=$("form#" + formname);
            $formt.form("reset").find("input,textarea").removeClass("validatebox-invalid");//把对话框里面的值重置
            $formt.find("span.textbox-invalid").removeClass("textbox-invalid");//把下拉选择框里面的样式重置
            $formt.find("input.cselectorImageUpload").each(function (i, v) {//重置form之后文件上传控件变形或者重置
                $(v).trigger("change");
            });																		
			$formt.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
				$(v).trigger("change");
			});
            //重置form之后如果下拉框有需要特殊处理就特殊处理一下
            $formt.find("select.easyui-combobox").each(function (i, v) {
                if ($(v).attr("conchange")) {//赋值之后对其他影响
                    if ($(v).attr("conchange").indexOf("()") > -1)
                        eval($(v).attr("conchange").replace("()", "") + "('" + $(v).val() + "')");
                    else
                        eval($(v).attr("conchange") + "('" + $(v).val() + "')");
                }
            });
			//处理默认值
            if ($formt.attr("initsystem")) {
                eval($formt.attr("initsystem"));
				$("input").removeClass("validatebox-invalid");//把对话框里面的样式重置
				$("span.textbox-invalid").removeClass("textbox-invalid");//把下拉选择框里面的样式重置
            }
            if ($t.hasClass("a_mod_btn")) {
                //如果是修改就给对话框传要修改的记录数据
                var row = {};//返回第一个被选中的行或如果没有选中的行则返回null
                $t.parents("tr").find("td[path]").each(function (i, v) {
                    row[$(v).attr("path")] = $(v).text();
                });
                if (row) {
                    //把取到的数据赋值到对应form表单
                    formval(row, "form#" + formname, "", "");
                }
            }
            btn_sure = 1;
            var dialogformopts = {
				//title:$t.attr("title"),
				//width:$t.attr("width") || 800,
				//height:$t.attr("height") || 450,
                modal: true,//是否将窗体显示为模式化窗口
                closed: false,
                buttons: [{
                    text: "确认",
                    handler: function () {
                        if (btn_sure == 1) {
                            if ($formt.form("validate")) {//表单检验是否成功
                                var uploadv = 1;
                                $formt.find("input.cselectorImageUpload").each(function (i, v) {
                                    if ($(v).attr("required") && $(v).val() == "") {
                                        uploadv = 0;
                                        //getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
										//getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
                                        return false;
                                    }
                                });														
								$formt.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
									$(v).trigger("getdata");
									if ($(v).attr("required") && $(v).val() == "") {
										uploadv = 0;
										//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
										//getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
										return false;
									}
								});
                                if (uploadv == 1) {
                                    btn_sure = 2;
                                    var data = {};
                                    $formt.find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
                                        if ($(v).attr("name")) {
                                            if ($(v).attr("type") == "password") {
                                                data[v.name] = hex_md5(v.value || "");
                                            } else if($(v).hasClass("cselectorImageUpload")){
                                                data[v.name] = v.value?($(v).attr("valType")?v.value:$.evalJSON(v.value)):[];
                                            } else{
                                                data[v.name] = v.value || "";
                                            }
                                        }
                                    });
                                    if ($t.hasClass("a_mod_btn")) {
                                        $t.parents("tr").find("td[path]").each(function (i, v) {
                                            $(v).html(data[$(v).attr("path")]);
                                        });
                                    } else {
                                        var $table = $t.parents("table");
                                        var $tr = $($table.find("thead.trow").html());
                                        $tr.find("td[path]").each(function (x, y) {
                                            $(y).text(data[$(y).attr("path")]);
                                        });
                                        $tr.appendTo($table.find("tbody"));
                                    }
                                    btn_sure = 1;
                                    $("#"+dialogname).dialog("close");
                                    //类似新增之后计算总分题数
                                    if ($formt.attr("getcallback")) {
										var callback=$t.attr("iframeN");
                                        //数据赋值之后要干什么
										if ($formt.attr("getcallback").indexOf("()") > -1)
											window[callback].window[$formt.attr("getcallback").replace("()", "")]();
										else
											window[callback].window[$formt.attr("getcallback")]();
                                    }
                                }else{
									formValidateInfo(formname);
								}
                            } else {//校验不成功，如果有提示信息弹出提示信息
                                //getparent().mesAlert("温馨提示", "校验不成功", 'error');
								//getparent().mesShow("温馨提示","校验不成功", 2000,'red');
								formValidateInfo(formname);
                            }
                        }
                    }
                }, {
                    text: "关闭",
                    handler: function () {
						$("#"+dialogname).dialog("close");
                    }
                }]
            };
            $("#"+dialogname).dialog(dialogformopts);
        });
        //删除子选项
        $(pageparam.dialogform.formname).on("click", "a.a_del_btn", function () {
            $(this).parent().parent().remove();
        });
    }
    if (pageparam.readDialog) {
        //查看子选项
        $(pageparam.readDialog.formname).on("click", "a.a_read_btn", function () {
            var $t = $(this);
            var formname = $t.attr("formname");
            var dialogname = $t.attr("dialogname");
            if (pageparam.readDialog.ctableReadCtable) {
                var tabs = pageparam.readDialog.ctableReadCtable.split(",");
                for (var i in tabs) {
                    $("#" + formname + " table[id='" + tabs[i] + "'] tbody tr").remove();
                }
            }
            var row = {};//返回第一个被选中的行或如果没有选中的行则返回null
            if ($t.attr("cmd")) {
                ajaxgeneral({
                    url: $t.attr("cmd"),
                    data: { "id": $t.parents("tr").find("td[path='id']").text() },
                    success: function (data) {
                        row = data.data;
                        if (row) {
                            //把取到的数据赋值到对应form表单
                            formval(row, "#" + formname, (pageparam.readDialog.ctableReadCtable || ""), (pageparam.readDialog.divimages || ""), pageparam.readDialog.ctableDialogrender);
                        }
                    }
                });
            } else {
                $t.parents("tr").find("td[path]").each(function (i, v) {
                    row[$(v).attr("path")] = $(v).text();
                });
                if (row) {
                    //把取到的数据赋值到对应form表单
                    formval(row, "#" + formname, (pageparam.readDialog.ctableReadCtable || ""), (pageparam.readDialog.divimages || ""), pageparam.readDialog.ctableDialogrender);
                }
            }
            $("#" + dialogname).dialog({
                modal: true,//是否将窗体显示为模式化窗口
                closed: pageparam.dialogclose ? true : false
            });
            if (pageparam.dialogclose) $("#" + dialogname).dialog('open');
        });
        //打开并查看数据
        $("." + listtable).on("click", "a.readDialog", function () {
            var $t = $(this);
			var fn=pageparam.readDialog.formname.substr(1,pageparam.readDialog.formname.length-1);
			loadForm(fn);
			formreset(fn);
			formReadonly(fn);
            $(pageparam.listtable.listname).datagrid("clearSelections");//取消选择所有当前页中所有的行
            var index = parseInt($(this).attr("readDialogindex"));
            if (pageparam.readDialog.ctable) {
                var tabs = pageparam.readDialog.ctable.split(",");
                for (var i in tabs) {
                    $(pageparam.readDialog.formname + " table[id='" + tabs[i] + "'] tbody tr").remove();
                }
            }
            //如果是修改就给对话框传要修改的记录数据
            $(pageparam.listtable.listname).datagrid("selectRow", index);//选择一行，行索引从0开始
            var row = $(pageparam.listtable.listname).datagrid("getSelected");//返回第一个被选中的行或如果没有选中的行则返回null
            if (row) {
                if (pageparam.readDialog.getcmd || $(pageparam.readDialog.formname).attr("cmd-select")) {//如果需要调命令获取数据
                    var ajaxopts={
                        url: pageparam.readDialog.getcmd || $(pageparam.readDialog.formname).attr("cmd-select"),
                        data: { "id": row[pageparam.listtable.idField || "id"] },
                        success: function (datai) {
                            row = datai.data;
                            //数据赋值之前要干什么
                            if ($(pageparam.readDialog.formname).attr("beforerender")) {
                                if ($(pageparam.readDialog.formname).attr("beforerender").indexOf("()") > -1)
                                    eval($(pageparam.readDialog.formname).attr("beforerender").replace("()", "(row,true)"));
                                else
                                    eval($(pageparam.readDialog.formname).attr("beforerender") + "(row,true)");
                            }
                            //把取到的数据赋值到对应form表单
                            formval(row, pageparam.readDialog.formname, pageparam.readDialog.ctable, (pageparam.readDialog.divimages || ""), pageparam.readDialog.ctablerender);													
							//数据赋值之后要干什么
							if ($(pageparam.readDialog.formname).attr("getcallback")) {
								if ($(pageparam.readDialog.formname).attr("getcallback").indexOf("()") > -1)
									eval($(pageparam.readDialog.formname).attr("getcallback").replace("()", "(row)"));
								else
									eval($(pageparam.readDialog.formname).attr("getcallback") + "(row)");
							}
                        }
                    };
					if (pageparam.readDialog.scontentType || $(pageparam.readDialog.formname).attr("scontentType")) {
						ajaxopts.contentType=pageparam.readDialog.scontentType || $(pageparam.readDialog.formname).attr("scontentType");
					}
					ajaxgeneral(ajaxopts);
                } else {
                    //数据赋值之前要干什么
                    if ($(pageparam.readDialog.formname).attr("beforerender")) {
                        if ($(pageparam.readDialog.formname).attr("beforerender").indexOf("()") > -1)
                            eval($(pageparam.readDialog.formname).attr("beforerender").replace("()", "(row,true)"));
                        else
                            eval($(pageparam.readDialog.formname).attr("beforerender") + "(row,true)");
                    }
                    //把取到的数据赋值到对应form表单
                    formval(row, pageparam.readDialog.formname, pageparam.readDialog.ctable, (pageparam.readDialog.divimages || ""), pageparam.readDialog.ctablerender);													
					//数据赋值之后要干什么
					if ($(pageparam.readDialog.formname).attr("getcallback")) {
						if ($(pageparam.readDialog.formname).attr("getcallback").indexOf("()") > -1)
							eval($(pageparam.readDialog.formname).attr("getcallback").replace("()", "(row)"));
						else
							eval($(pageparam.readDialog.formname).attr("getcallback") + "(row)");
					}
                }
            }
            var readDialogopts = {
                modal: true,//是否将窗体显示为模式化窗口
                closed: pageparam.dialogclose ? true : false
            };
            //查看可以转编辑  删除
            if (pageparam.readDialog.dialogedit) {
                readDialogopts.buttons = [];
				if(!pageparam.listtable.controller){
					readDialogopts.buttons.push({
						text: "编辑",
						handler: function () {
							if ($t.parent().find("a.showDialog").length == 0) {
								//getparent().mesAlert("温馨提示", "数据不能修改!", 'info');
								getparent().mesShow("温馨提示","数据不能修改", 2000,'blue');
							} else {
								$(pageparam.readDialog.dialogid).dialog('close');
								$t.parent().find("a.showDialog").trigger("click");
							}
						}
					//}, {
					//    text: "删除",
					//    handler: function () {
					//        if ($t.parent().find("a[delete]").length == 0) {
					//            //getparent().mesAlert("温馨提示", "数据不能删除!", 'info');
					//			getparent().mesShow("温馨提示","数据不能修改", 2000,'blue');
					//        } else {
					//            $(pageparam.readDialog.dialogid).dialog('close');
					//            $t.parent().find("a[delete]").trigger("click");
					//        }
					//    }
					});
				}
				readDialogopts.buttons.push({
                    text: "关闭",
                    handler: function () {
                        $(pageparam.readDialog.dialogid).dialog('close');
                    }
                });
            }
            $(pageparam.readDialog.dialogid).dialog(readDialogopts);
            if (pageparam.dialogclose) $(pageparam.readDialog.dialogid).dialog('open');
        });
    }
    if (pageparam.listexport) {
        //导出
        $(document).on("click", "a.export", function () {
            var ajaxopts = {
                url: pageparam.listexport.cmd,
                success: function (data) {
                    window.parent.list();
                }
            };
            var dataobj = {};
            var listnameF = $(this).parents("form").attr("id");
            var fields = $("#" + listnameF).serializeArray();//自动序列化表单元素为JSON对象
            $.each(fields, function (i, field) {
                dataobj[field.name] = field.value;//设置查询参数
            });
            if (pageparam.listexport.ajaxdataname) {
                ajaxopts.data = {};
                ajaxopts.data[pageparam.listexport.ajaxdataname] = dataobj;
            } else {
                ajaxopts.data = dataobj;
            }
            if (pageparam.listexport.contentType) {
                ajaxopts.contentType = pageparam.listexport.contentType;
            }
            ajaxgeneral(ajaxopts);
        });
    }
    //以对话框的形式打开url路径
    $("." + listtable).on("click", "a.openDialog", function () {
        if (pageparam.dialoglistbtn) {
            $(pageparam.listtable.listname).datagrid("clearSelections");//取消选择所有当前页中所有的行
            if (!aonclick[pageparam.dialoglistbtn.dialogid]) {
                aonclick[pageparam.dialoglistbtn.dialogid] = 1;
                var dtopts = {
                    //title: 'My Dialog',
                    //width: 400,
                    //height: 200,
                    closed: pageparam.dialogclose ? true : false,
                    cache: true,
                    modal: true,
                    queryParams: {},
                    onDestroy: function () {

                    },
                    href: web.rootdir+pageparam.dialoglistbtn.dialogurl
                };
                if ($(this).attr("id")) {
                    dtopts.queryParams[$(this).attr("idname") || "id"] = $(this).attr("id");
                }
                if ($(this).attr("width")) {
                    dtopts.width = $(this).attr("width");
                }
                if ($(this).attr("height")) {
                    dtopts.height = $(this).attr("height");
                }
                if ($(this).attr("paras")) {
                    var paras = $(this).attr("paras").split("&");
                    for (var i in paras) {
                        var vals = paras[i].split("=");
                        dtopts.queryParams[vals[0]] = vals[1];
                    }
                }
                if (pageparam.dialoglistbtn.buttons) {//以对话框的形式打开页面，如果设置buttons说明对话框有按钮操作
                    btn_sure = 1;
                    dtopts.buttons = pageparam.dialoglistbtn.buttons;
                }
                $(pageparam.dialoglistbtn.dialogid).dialog(dtopts);
                if (pageparam.dialogclose) $(pageparam.dialoglistbtn.dialogid).dialog('open');
            } else {
                var queryParams = {};
                if ($(this).attr("id")) {
                    queryParams[$(this).attr("idname")] = $(this).attr("id");
                }
                if ($(this).attr("paras")) {
                    var paras = $(this).attr("paras").split("&");
                    for (var i in paras) {
                        var vals = paras[i].split("=");
                        queryParams[vals[0]] = vals[1];
                    }
                }
                $(pageparam.dialoglistbtn.dialogid).dialog("options").queryParams = queryParams;
                $(pageparam.dialoglistbtn.dialogid).dialog("open").dialog("refresh");
            }
        }
    });
};
//查询datagrid
function searchtable(listnameF,listname,params){
	var fields = $("#" + listnameF).serializeArray();//自动序列化表单元素为JSON对象
	$.each(fields, function (i, field) {
	    params[field.name] = field.value;//设置查询参数
	});
	var submitval = true;
	if($("#" + listnameF).attr("onSubmit")){
		if ($("#" + listnameF).attr("onSubmit").indexOf("()") > -1)
			submitval =eval($("#" + listnameF).attr("onSubmit").replace("()", "") + "(params)");
		else
			submitval =eval($("#" + listnameF).attr("onSubmit") + "(params)");
	}
	if($("#" + listnameF).attr("beforeSubmit")){
		if ($("#" + listnameF).attr("beforeSubmit").indexOf("()") > -1)
			submitval =eval($("#" + listnameF).attr("beforeSubmit").replace("()", "") + "(params)");
		else
			submitval =eval($("#" + listnameF).attr("beforeSubmit") + "(params)");
	}
	if (submitval) {
		$("#" + listname).datagrid("options").pageNumber = 1;
		$("#" + listname).datagrid("load").datagrid("clearSelections");//设置好查询参数 reload 一下就可以了
	}
};
var editCellInputSet;
function editCellInputV(t,index,tableid){
    if(editCellInputSet) clearTimeout(editCellInputSet);
    editCellInputSet=setTimeout(function(){
        if($(t).val()!="") $('#'+tableid).datagrid('endEdit', index);
    },1000);
};
$.extend($.fn.datagrid.methods, {
    editCell: function(jq,param){
        return jq.each(function(){
            var opts = $(this).datagrid('options');
            var fields = $(this).datagrid('getColumnFields',true).concat($(this).datagrid('getColumnFields'));
			var fieldInputs=[];
            for(var i=0; i<fields.length; i++){
                var col = $(this).datagrid('getColumnOption', fields[i]);
				if(col.editCellInput) fieldInputs.push(col.field);
                col.editor1 = col.editor;
                if (fields[i] != param.field){
                    col.editor = null;
                }
            }
            $(this).datagrid('beginEdit', param.index);
            var ed = $(this).datagrid('getEditor', param);
            if (ed){
                if ($(ed.target).hasClass('textbox-f')){
                    if(fieldInputs.join(",").indexOf(param.field)>-1){
                        $(ed.target).textbox('textbox').attr('oninput','editCellInputV(this,"'+param.index+'","'+opts.tableid+'")').attr('onpropertychange','editCellInputV(this,"'+param.index+'","'+opts.tableid+'")');
                    }
                    $(ed.target).textbox('textbox').focus();
                } else {
                    if(fieldInputs.join(",").indexOf(param.field)>-1){
                        $(ed.target).attr('oninput','editCellInputV(this,"'+param.index+'","'+opts.tableid+'")').attr('onpropertychange','editCellInputV(this,"'+param.index+'","'+opts.tableid+'")');
                    }
                    $(ed.target).focus();
                }
            }
            for(var i=0; i<fields.length; i++){
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor = col.editor1;
            }
        });
    },
    enableCellEditing: function(jq){
        return jq.each(function(){
            var dg = $(this);
            var opts = dg.datagrid('options');
            opts.oldOnClickCell = opts.onClickCell;
            opts.onClickCell = function(index, field){
				var bcc=true;				
				if(opts.onBeginEdit){
					var row=dg.datagrid('selectRow',index).datagrid('getSelected');
					//dg.datagrid("clearSelections");
					bcc =opts.onBeginEdit(index,row);
					if(bcc==undefined) bcc=true;
				}
				if(bcc){
					if (opts.editIndex != undefined){
						if (dg.datagrid('validateRow', opts.editIndex)){
							dg.datagrid('endEdit', opts.editIndex);
							opts.editIndex = undefined;
						} else {
							return;
						}
					}
					dg.datagrid('selectRow', index).datagrid('editCell', {
						index: index,
						field: field
					});
					opts.editIndex = index;
					opts.oldOnClickCell.call(this, index, field);
				}
            }
        });
    }
});
//合并单元格
$.extend($.fn.datagrid.methods, {
    autoMergeCells: function(jq, opts) {//classFields要合并的单元格是否需要合并判断条件字段
        return jq.each(function() {
            var target = $(this);
            if (!opts) {
                if(!opts.fields) opts.fields = target.datagrid("getColumnFields");
            }
            var rows = target.datagrid("getRows");
            var i = 0,
            j = 0,
            temp = {};
            for (var i=0; i < rows.length; i++) {
                var row = rows[i];
                j = 0;
                for (var j=0; j < opts.fields.length; j++) {
                    var field = opts.fields[j];
                    var tf = temp[field];
                    if (!tf) {
                        tf = temp[field] = {};
                        tf[row[field]] = [i];
                    } else {
                        var tfv = tf[row[field]];
                        if (tfv) {
                            tfv.push(i);
                        } else {
                            tfv = tf[row[field]] = [i];
                        }
                    }
                }
            }
            $.each(temp,
            function(field, colunm) {
                $.each(colunm,
                function() {
                    var group = this;
                    if (group.length > 1) {
                        var before, after, megerIndex = group[0];
                        for (var i = 0; i < group.length; i++) {
                            before = group[i];
                            after = group[i + 1];
							if(opts && opts.classFields){								
								var classFieldsL=0;
								if(rows[after]){
									for(var j in opts.classFields){
										if(rows[before][opts.classFields[j]]==rows[after][opts.classFields[j]]) classFieldsL++;
									}
									if(classFieldsL==opts.classFields.length){
										continue;
									}	
								}
								var rowspan = before - megerIndex + 1;								
								target.datagrid('mergeCells', {
									index: megerIndex,
									field: field,
									rowspan: rowspan
								});
								megerIndex = after;
							}else{							
								if (after && (after - before) == 1) {
									continue;
								}								
								var rowspan = before - megerIndex + 1;
								if (rowspan > 1) {
									target.datagrid('mergeCells', {
										index: megerIndex,
										field: field,
										rowspan: rowspan
									});
								}
								if (after && (after - before) != 1) {
									megerIndex = after;
								}
							}
                        }
                    }
                });
            });
        });
    }
});
//email:匹配E-Mail的正则表达式规则  url:匹配URL的正则表达式规则  length[0,100]:允许在x到x之间个字符。
$.extend($.fn.validatebox.defaults.rules,{
	beforeDateCheck:{//validType="beforeDateCheck"
	     validator:function(value, param){
	        var nowDate = new Date();
			var chooseData=new Date(value.replace(new RegExp("-", 'g'),"/"));
	        return nowDate<=chooseData;
	     },
	     message:"不能选择当前之前的时间"
	},
	afterDateCheck:{//validType="afterDateCheck"
	     validator:function(value, param){
	        var nowDate = new Date();
			var chooseData=new Date(value.replace(new RegExp("-", 'g'),"/"));
	        return nowDate>=chooseData;
	     },
	     message:"不能选择当前之后的时间"
	},
	startDateCheck:{//开始时间跟结束时间对比，用法：validType="startDateCheck['eeDate','ssDate']"  ssDate为开始时间，eeDate为结束时间
		validator:function(value,param){
			var e=$((param[2]?("#"+param[2]+" "):"")+"input[name="+param[0]+"]").val();
			if(e!=""){
				if(value<=e){
					$((param[2]?("#"+param[2]+" "):"")+"input[name="+param[0]+"]").next().removeClass('textbox-invalid');
					$((param[2]?("#"+param[2]+" "):"")+"input[name="+param[0]+"]").next().find("input").removeClass("validatebox-invalid");
					$((param[2]?("#"+param[2]+" "):"")+"input[name="+param[1]+"]").next().removeClass('textbox-invalid');
					$((param[2]?("#"+param[2]+" "):"")+"input[name="+param[1]+"]").next().find("input").removeClass("validatebox-invalid");
				}
				return value<=e;
			}else{
				return true;
			}
		},
		message:"起始时间要大于截止时间"
	},
	endDateCheck:{//结束时间跟开始时间对比，用法：validType="endDateCheck['ssDate','eeDate']"  ssDate为开始时间，eeDate为结束时间
		validator:function(value,param){
			var s=$("input[name="+param[0]+"]").val();
			if(s!=""){
				if(value>=s){
					$((param[2]?("#"+param[2]+" "):"")+"input[name="+param[0]+"]").next().removeClass('textbox-invalid');
					$((param[2]?("#"+param[2]+" "):"")+"input[name="+param[0]+"]").next().find("input").removeClass("validatebox-invalid");
					$((param[2]?("#"+param[2]+" "):"")+"input[name="+param[1]+"]").next().removeClass('textbox-invalid');
					$((param[2]?("#"+param[2]+" "):"")+"input[name="+param[1]+"]").next().find("input").removeClass("validatebox-invalid");
				}
				return value>=s;
			}else{
				return true;
			}
		},
		message:"截止时间要小于起始时间"
	},
	equals:{//验证输入是否一致，一般用于密码与重复密码（validType="equals['#password']"）password为密码的id
        validator: function(value,param){
            return value == $(param[0]).val();
        },
        message:"输入不一致"
    },
	minLength: {//validType="minLength[5]"
        validator: function(value, param){
            return value.length >= param[0];
        },
        message:"至少输入 {0} 个字符"
    },
	maxLength: {//validType="maxLength[5]"
        validator: function(value, param){
            return value.length <= param[0];
        },
        message:"至多输入 {0} 个字符"
    },
    equalLength:{//validType="equalLength[5]"  validType="equalLength[5,4]"
        validator: function(value, param){
        	var len=0;
        	for(var i in param){
				if(value.length == param[i]) len++;
			}
            return len==0?false:true;
        },
        message:"请输入 {0}或{1}或{2}或{3}或{4}或{5} 个字符"
	},
	password:{//validType="password"
		validator:function(value,param){
			return /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*,.\w]{8,}$/.test(value);
		},
		message:"不能小于8位，至少包含大小写字母和数字"
	},
	isCardNo:{//validType="isCardNo"
		validator:function(value,param){
			return /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(value);
		},
		message:"身份证输入不合法"
	},
	telphone:{//validType="telphone"固定电话
		validator:function(value,param){
			return /^((0[0-9]{2,3}-)?([2-9][0-9]{6,7})+(-[0-9]{1,4})?)$/.test(value);
		},
		message:"无效的电话号码"
	},
	phone:{//validType="phone"
		validator:function(value,param){
			//return /^([\+][0-9]{1,3}[ \.\-])?([\(]{1}[0-9]{2,6}[\)])?([0-9 \.\-\/]{7,27})((x|ext|extension)[ ]?[0-9]{1,4})?$/.test(value);
			return /^(1)\d{10}$/.test(value);
		},
		message:"无效的电话号码"
	},
	phoneOrTel:{//validType="phoneOrTel"
		validator:function(value,param){
			return /^(((0[0-9]{2,3}-)?([2-9][0-9]{6,7})+(-[0-9]{1,4})?)|((1)\d{10}))$/.test(value);
		},
		message:"无效的电话号码或者固定电话"
	},
	integer:{//validType="integer"
		validator:function(value,param){
			return /^[\-\+]?\d+$/.test(value);
		},
		message:"不是有效的整数"
	},
	zinteger:{//validType="zinteger"
		validator:function(value,param){
			return /^\d+$/.test(value);
		},
		message:"不是有效的正整数"
	},
	number:{//validType="number"
		validator:function(value,param){
			return /^[\-\+]?(([0-9]+)([\.,]([0-9]+))?|([\.,]([0-9]+))?)$/.test(value);
		},
		message:"无效的数字"
	},
	znumber:{//validType="znumber"
		validator:function(value,param){
			return /^(([0-9]+)([\.,]([0-9]+))?|([\.,]([0-9]+))?)$/.test(value);
		},
		message:"无效的数字"
	},
	date:{//validType="date"
		validator:function(value,param){
			return /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value);
		},
		message:"无效的日期，格式必需为 YYYY-MM-DD"
	},
	ipv4:{//validType="ipv4"
		validator:function(value,param){
			return /^((([01]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))[.]){3}(([0-1]?[0-9]{1,2})|(2[0-4][0-9])|(25[0-5]))$/.test(value);
		},
		message:"无效的 IP 地址"
	},
	million:{//validType="million"
		validator:function(value,param){
			return /^\d{1,10}(?:\.\d{1,6})?$/.test(value);
		},
		message:"金额输入错误，以万元为单位保留6位小数点"
	},
	money:{//validType="money"
		validator:function(value,param){
			return /^\d{1,10}(?:\.\d{1,2})?$/.test(value);
		},
		message:"金额输入错误，以元为单位保留2位小数点"
	}
});
dictionary.sysname="oa|OA门户,plan|计划管理,budget|预算管理,hrLeave|人力资源出国护照审批,application|管理后台,car|车辆管理,ccpn|协作配合,contract|合同管理,document|档案管理,record|登陆日志,accesstoke|访问令牌,unify|统一代理,urmp|需求管理,authoriz|认证授权";
dictionary.deleteprocess="1|action/delete";
dictionary.headerurl="1|updatepassword";
//普通table合并单元格
function autoMergeCells($tabTbody,opts){
	if(!opts.fields) return;
	var fieldTem={};
	$tabTbody.find("tr").each(function(i,v){
		for(var x in opts.fields){
			var field=opts.fields[x];
			var tf=fieldTem[field];
			var tfT=$(v).find("td[path="+field+"]").text();
			if(!tf){
				tf=fieldTem[field]={};
				tf[tfT]=[i];
			}else{
				var tfv=tf[tfT];
				if(tfv){
					tfv.push(i);
				}else{
					tfv=tf[tfT]=[i];
				}
			}
		}
	});
	$.each(fieldTem,function(field,column){
		$.each(column,function(){
			var group=this;	
			if(group.length>0){				
				var before,after,megerIndex=group[0];
				for (var i = 0; i < group.length; i++) {
					before=group[i];
					after=group[i+1];
					if(opts && opts.classFields){								
						var classFieldsL=0;
						var $rAft=$tabTbody.find("tr").eq(after);
						var $rBef=$tabTbody.find("tr").eq(before);
						if($rAft.length>0){
							for(var j in opts.classFields){
								if($rBef.find("td[path="+opts.classFields[j]+"]").text()==$rAft.find("td[path="+opts.classFields[j]+"]").text()) classFieldsL++;
							}
							if(classFieldsL==opts.classFields.length){
								continue;	
							} 										
						}
						var rowspan = before - megerIndex + 1;								
						if(rowspan>1){
							$tabTbody.find("tr").eq(megerIndex).find("td[path="+field+"]").attr("rowspan",rowspan);
							for(var j=megerIndex+1;j<(megerIndex+rowspan);j++){
								if($tabTbody.find("tr").eq(j).find("td[path="+field+"]").length>0){
									$tabTbody.find("tr").eq(j).find("td[path="+field+"]").remove();
								}
							}
						}
						megerIndex = after;
					}else{						
						if(after && (after-before)==1){
							continue;	
						} 
						var rowspan=before-megerIndex+1;
						if(rowspan>1){
							$tabTbody.find("tr").eq(megerIndex).find("td[path="+field+"]").attr("rowspan",rowspan);
							for(var j=megerIndex+1;j<(megerIndex+rowspan);j++){
								if($tabTbody.find("tr").eq(j).find("td[path="+field+"]").length>0){
									$tabTbody.find("tr").eq(j).find("td[path="+field+"]").remove();
								}
							}
						}
						if(after && (after-before)!=1){
							megerIndex=after;
						}
					}
				}
			}
		});
	});
};
//转字典
function getvals(name,val){
	if(dictionarys[name]){
		if (dictionarys[name][val])///如果字典匹配 就显示字典值
			return dictionarys[name][val];
		else
			return "";
	}else{
		var tmp = dictionary[name].split(',');
		dictionarys[name]={};
		for (var i = 0; i < tmp.length; i++) {
			var t1 = tmp[i].split('|')[0];
			var t2 = tmp[i].split('|')[1];
			dictionarys[name][t1] = t2;
		}
		if (dictionarys[name][val])///如果字典匹配 就显示字典值
			return dictionarys[name][val];
		else
			return "";
	}
};
//获取浏览器版本信息
function getBrowserInfo(){
	var Sys = {};
	var ua = navigator.userAgent.toLowerCase();
	var re =/(msie|firefox|chrome|opera|version|trident).*?([\d.]+)/;
	var m = ua.match(re);
	Sys.browser = m[1].replace(/version/, "'safari");
	Sys.ver = m[2];
	return Sys;
};
//表单提交
function formsubmit(formid,formUrl){
	var gps=getQueryString();
	var $form=$("#"+formid);
	$form.form("enableValidation");
	var url=formUrl?formUrl:$form.attr("cmd-insert");
	if(gps.id){
		url=$form.attr("cmd-update");
	}
	if (btn_sure == 1) {
		if ($form.form("validate")) {//表单检验是否成功
			var uploadv = 1;
			$form.find("input.cselectorImageUpload").each(function (i, v) {
				if ($(v).attr("required") && $(v).val() == "") {
					uploadv = 0;
					//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
					getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
					return false;
				}
			});														
			$form.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
				$(v).trigger("getdata");
				if ($(v).attr("required") && $(v).val() == "") {
					uploadv = 0;
					//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
					getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
					return false;
				}
			});
			if (uploadv == 1) {
				btn_sure = 2;
				if ($form.attr("contentType")) {//设置contentType表示不用form表单方式提交，支持json和kv，设置什么就以什么方式传值
					var data=getFormValue(formid);
					var submitval = true;
					if ($form.attr("onSubmit")) {//如果提交之前需要额外传参或者其他操作可在页面上配置onSubmit函数，要求有return true;或者return false;(说明中断提交)
						if ($form.attr("onSubmit").indexOf("()") > -1)
							submitval =eval($form.attr("onSubmit").replace("()", "") + "(data)");
						else
							submitval =eval($form.attr("onSubmit") + "(data)");
					}
					if ($form.attr("beforeSubmit")) {//如果提交之前需要额外传参或者其他操作可在页面上配置onSubmit函数，要求有return true;或者return false;(说明中断提交)
						if ($form.attr("beforeSubmit").indexOf("()") > -1)
							submitval =eval($form.attr("beforeSubmit").replace("()", "") + "(data)");
						else
							submitval =eval($form.attr("beforeSubmit") + "(data)");
					}
					if (submitval) {
						if ($form.attr("suretext")) {
							if ($form.attr("suretext").indexOf("()") > -1)
								var suretext =eval($form.attr("suretext"));
							else
								var suretext =eval($form.attr("suretext") + "()");
							$.messager.confirm(suretext.title, suretext.titletext, function (r) {
								if (r) {
									formajax(url,data,$form.attr("contentType"),null,$form.attr("submitcallback"));
								}
							});
							btn_sure = 1;
						} else {
								formajax(url,data,$form.attr("contentType"),null,$form.attr("submitcallback"));
						}
					}else{
						btn_sure = 1;
					}
				} else {//原始form表单提交方式
					var formopts = {
						url: url,
						dataType: "json",
						success: function (data) {//成功
							btn_sure = 1;
							data = $.evalJSON(data);
							if (data.errcode == 0) {
								$.messager.show({
									title: "温馨提示",
									msg: data.message || "操作成功",
									timeout: 2500,
									showType: "slide",
									style: {
										right: '',
										top: '',
										bottom: ''
									}
								});
							} else {
								//getparent().mesAlert("温馨提示", data.message || "操作失败", 'error');
								getparent().mesShow("温馨提示",data.message || "操作失败", 2000,'red');
								btn_sure = 1;
							}
						}, error: function (data) {
							if (data.responseText.indexOf("login_tab") > -1) {
								getparent().location.href = web.rootdir + "action/login";
							} else {
								//getparent().mesAlert("温馨提示", "操作失败", 'error');
								getparent().mesShow("温馨提示","操作失败", 2000,'red');
								btn_sure = 1;
							}
						}
					};
					if ($form.attr("onSubmit")) {//如果提交之前需要额外传参或者其他操作可在页面上配置onSubmit函数，要求有return true;或者return false;(说明中断提交)
						if ($form.attr("onSubmit").indexOf("()") > -1)
							formopts.onSubmit =eval($form.attr("onSubmit").replace("()", "") + "()");
						else
							formopts.onSubmit =eval($form.attr("onSubmit") + "()");
					}
					if ($form.attr("beforeSubmit")) {//如果提交之前需要额外传参或者其他操作可在页面上配置onSubmit函数，要求有return true;或者return false;(说明中断提交)
						if ($form.attr("beforeSubmit").indexOf("()") > -1)
							formopts.onSubmit =eval($form.attr("beforeSubmit").replace("()", "") + "()");
						else
							formopts.onSubmit =eval($form.attr("beforeSubmit") + "()");
					}
					$form.form("submit", formopts);
				}
			}
		} else {//校验不成功，如果有提示信息弹出提示信息
			btn_sure = 1;
			formValidateInfo(formid);
			$form.find(".easyui-validatebox").each(function (i, v) {
				if (!$(v).validatebox("isValid")) {
					if ($(v).attr("validatemes")) {
						//getparent().mesAlert("温馨提示", $(v).attr("validatemes"), 'error');
						getparent().mesShow("温馨提示",$(v).attr("validatemes"), 2000,'red');
					}
					return false;
				}
			});
		}
	}
};
//重置form
function formreset(formid){
	$("#"+formid).find("input,textarea,select").each(function(i,v){
		if(!$(v).attr("noReset")){
			switch (v.nodeName) {
				case "TEXTAREA"://普通textarea 管理类
					$(v).val("");
					if($(v).hasClass("kindeditor")) $(v).trigger("change");
					break;
				case "SELECT"://select管理类
					if($(v).hasClass("easyui-combobox")){
						$(v).combobox("reset");
					}else if($(v).hasClass("easyui-combogrid")){
						$(v).combogrid("reset");
					}else{
						$(v).val("");
					}
					break;
				case "INPUT"://input管理类
					if(!$(v).attr("class"))//如果没有样式 就给个空
						$(v).attr("class","");
					else{
						$(v).attr("class"," "+$(v).attr("class"));
					}
					if($(v).hasClass("easyui-combobox")){
						$(v).combobox("reset");
					}else if($(v).hasClass("cselectorImageUpload")){//文件上传
						$(v).val("").trigger("change");
					} else if($(v).attr("class").indexOf(" datebox")>-1) {//
						$(v).datebox("setValue","");
					}else if($(v).attr("class").indexOf("datetimebox")>-1) {//日期框
						$(v).datetimebox("setValue","");
					} else {
						if($(v).hasClass("textbox-text") || $(v).hasClass("textbox-value")){
						}else {
                            $(v).val("");
                        }
					}
					break;
				default://普通input select
					$(v).val("");
					break;
			};
		}
	});
	$("#"+formid).find("input,textarea").removeClass("validatebox-invalid");//把对话框里面的样式重置
    $("#"+formid).find("span.textbox-invalid").removeClass("textbox-invalid");//把下拉选择框里面的样式重置
    $("#"+formid).find("table[pathsave]").each(function(i,v){
    	$(v).find("tbody").html("");
	});
    $("#"+formid).find(".readOnlyTable").each(function(i,v){
        $(v).find("span,div").html("");
    });	
};
//新增修改提交
function formajax(url,data,contentType,pageparam,submitcallback,callback,listPageName,again) {
	var ajaxopts={
		url:url,
		data:data,
		success:function(data){
			getparent().mesShow("温馨提示","操作成功",2000);
			btn_sure = 1;
			if(callback){
				if(pageparam){
					//var dialogid=pageparam.dialogform.dialogid.substr(1, pageparam.dialogform.dialogid.length - 1);
					if(!pageparam.dialogform.dialogNoClose){
						getparent().dialogClose(callback);//getparent().window[callback+'F'].window[$form.attr("onSubmit")](data)
						if(!pageparam.dialogform.closeNoFresh) setTimeout(function(){(getparent().window[(listPageName || callback)] || top).window.location.reload();},2000);
					}else{
                        if(!again && pageparam.dialogform.closeNoFresh) getparent().dialogClose(callback);
						if(!pageparam.dialogform.closeNoFresh) setTimeout(function(){(getparent().window[(listPageName || callback)] || top).window.location.reload();},2000);
					}
					if(submitcallback){
						if (submitcallback.indexOf("()") > -1)
							//eval(window[dialogid+"F"].window[submitcallback.replace("()", "")](data.data.id));
							eval(getparent().window[callback+'F'].window[submitcallback.replace("()", "")](data.data || data));
						else
							//eval(window[dialogid+"F"].window[submitcallback](data.data.id));
							eval(getparent().window[callback+'F'].window[submitcallback](data.data || data));
					}
				}else{
                    getparent().dialogClose(callback);
					if(submitcallback){
						if (submitcallback.indexOf("()") > -1)
							//eval(submitcallback.replace("()", "")+"("+data.data.id+")");
							eval(getparent().window[callback+'F'].window[submitcallback.replace("()", "")](data.data || data));
						else
							//eval(submitcallback+"("+data.data.id+")");
							eval(getparent().window[callback+'F'].window[submitcallback](data.data || data));
					}
				}
			}else{
				if(pageparam){
					var dialogid=pageparam.dialogform.dialogid.substr(1, pageparam.dialogform.dialogid.length - 1);
					if(!pageparam.dialogform.dialogNoClose){
						$(pageparam.dialogform.dialogid).dialog("close");
						if(!pageparam.dialogform.closeNoFresh) setTimeout(function(){location.reload();},2000);
					}else{
                        if(!again && pageparam.dialogform.closeNoFresh) $(pageparam.dialogform.dialogid).dialog("close");
						if(!pageparam.dialogform.closeNoFresh) setTimeout(function(){location.reload();},2000);
					}
					if(submitcallback){
						if (submitcallback.indexOf("()") > -1)
							eval(window[dialogid+"F"].window[submitcallback.replace("()", "")](data.data || data));
						else
							eval(window[dialogid+"F"].window[submitcallback](data.data || data));
					}
				}else{
					if(submitcallback){
						if (submitcallback.indexOf("()") > -1)
							eval(window[submitcallback.replace("()", "")](data.data || data));
						else
							eval(window[submitcallback](data.data || data));
					}
				}
			}
		},sError:function(data){
			//getparent().mesAlert("温馨提示", data.data || data.message || "操作失败", 'error');
			//getparent().mesShow("温馨提示",data.data || data.message || "操作失败", 2000,'red');
			btn_sure = 1;
		},error:function(data){
			//getparent().mesAlert("温馨提示", "操作失败", 'error');
			getparent().mesShow("温馨提示","操作失败", 2000,'red');
			btn_sure = 1;
		}
	};
	if(contentType){
		ajaxopts.contentType=contentType;
	}
	ajaxgeneral(ajaxopts);
};
//form表单赋值
function formval(row,formid,ctable,img,ctablerender){
	var $formid=$(formid);
	for(var di in row){	
		row[di]=row[di]==null?"":row[di];
		var $did=$formid.find("#" + di + ",." + di);
		$did.each(function(i,v){
			switch (v.nodeName) {
				case "I"://普通i展示 i用于展示时间 前5个展示类
				case "SPAN"://普通input展示
				case "H1"://普通input展示
				case "H2"://普通input展示
				case "H3"://普通input展示
				case "H4"://普通input展示
				case "H5"://普通input展示
				case "H6"://普通input展示
				case "P"://普通input展示
					$(v).html(row[di]);
					break;
				case "DIV"://普通textarea展示
					if(typeof img!="undefined"){
						if((img.indexOf(di)>-1) && row[di]){
							var imgs=row[di].split(",");
							var htmls=[];
							for(var a in imgs){
								htmls.push("<img src='"+imgs[a]+"'/>");
							}
							$(v).html(htmls.join(""));
						}else{
							$(v).html(row[di]);
						}
					}else{
						$(v).html(row[di]);
					}
					break;
				case "IMG"://图片展示
					$(v).attr("src", row[di]);
					break;
				case "EMBED"://语音文件
					var urlh=window.location.href;
					var urlhz=urlh.split(web.rootdir);
					$(v).attr("src",urlhz[0]+row[di]);
					break;
				case "AUDIO"://语音文件
					var urlh=window.location.href;
					var urlhz=urlh.split(web.rootdir);
					$(v).attr("src",urlhz[0]+row[di]);
					break;
				case "A"://超链接展示
					$(v).attr("href", row[di]);
					break;
				case "TEXTAREA"://普通textarea 管理类
					$(v).val(htmlDecode(row[di])).height($(v).height()-1);
					if($(v).hasClass("kindeditor")) $(v).trigger("change");					
					if($(v).attr("required") || $(v).attr("validType")) $(v).validatebox("validate");
					break;
				case "SELECT"://select管理类
					if($(v).hasClass("easyui-combobox")){
						$(v).combobox("select",row[di]+"");//+""是为了配合有true、false或者数值型数据的情况，如果是true、false或者数值型数据建议使用input转换select的方式使用
						if($(v).attr("conchange")){//赋值之后对其他影响
							if ($(v).attr("conchange").indexOf("()") > -1)
								eval($(v).attr("conchange").replace("()", "") +"('"+row[di]+"')");
							else
								eval($(v).attr("conchange")+"('"+row[di]+"')");
						}
					}else if($(v).hasClass("easyui-combogrid")){
						$(v).combogrid("setValue",row[di]+"");
					}else{
						$(v).val(row[di]+"").trigger("change");
					}
					break;
				case "INPUT"://input管理类
					if(!$(v).attr("class"))//如果没有样式 就给个空
						$(v).attr("class","");
					else{
						$(v).attr("class"," "+$(v).attr("class"));
					}
					if($(v).hasClass("easyui-combobox")){
						$(v).combobox("select",row[di]);
					}else if($(v).hasClass("easyui-combotree")){
						$(v).combotree("setValues",row[di]);
					}else if($(v).hasClass("cselectorImageUpload")){//文件上传
						$(v).val(row[di]!=""?$.toJSON(row[di]):row[di]).trigger("change");
						if($(v).attr("inputrely")){//传值依赖其他字段来判断是否显示变形，用法：inputrely="type:android"表示当type字段的值为android时隐藏变形
							var inputrely=$(v).attr("inputrely").split(":");
							if(inputrely[1].indexOf(row[inputrely[0]])>-1){
								$(v).show().next(".cselectorImageUL").hide();
							}else{
								$(v).hide().next(".cselectorImageUL").show();
							}
						}
					} else if($(v).attr("class").indexOf(" datebox")>-1) {//日期框
						$(v).datebox("setValue", row[di]);
					}else if($(v).attr("class").indexOf("datetimebox")>-1) {//日期框
						$(v).datetimebox("setValue", row[di]);
					} else {
						$(v).val(htmlDecode(row[di]));
					}
					break;
				default://普通input select
					$(v).val(row[di]);
					break;
			};
		});
	}
	//特殊处理列表大json串
	if(ctable){
		var tabs=ctable.split(",");
		for(var i in tabs){
			var $table=$formid.find("table[id='"+tabs[i]+"']");
			if(typeof row[tabs[i]]=="string") row[tabs[i]]=htmlDecode(row[tabs[i]]);
			var data=$table.attr("listType")?row[tabs[i]]:$.evalJSON(row[tabs[i]]);
			for(var j in data){
			    if (ctablerender && ctablerender[tabs[i]]) {
					if (ctablerender[tabs[i]].indexOf("()") > -1)
						eval(ctablerender[tabs[i]].replace("()", "(data[j])"));
					else
						eval(ctablerender[tabs[i]]+"(data[j])");
				}
				var $tr=$($table.find("thead.trow").html());
				$tr.find("td[path]").each(function(x,y){
					if(!data[j][$(y).attr("path")] && data[j][$(y).attr("path")]!=0) data[j][$(y).attr("path")]="";
					$(y).html(data[j][$(y).attr("path")]+"" || "");
				});
				$tr.find("a[path]").each(function(x,y){
					if(!data[j][$(y).attr("path")] && data[j][$(y).attr("path")]!=0) data[j][$(y).attr("path")]="";
					$(y).attr("href",data[j][$(y).attr("path")]+"" || "");
				});
                $tr.find("textarea,input,select").each(function (x, y) {
                    tdPath($(y),data[j][$(y).attr("name")]);
                });
				$tr.appendTo($table.find("tbody"));
			}
		}
	}else{
		$formid.find("table[pathsave]").each(function(i,v){
			if(typeof row[$(v).attr("pathsave")]=="string") row[$(v).attr("pathsave")]=htmlDecode(row[$(v).attr("pathsave")]);
			var data=$(v).attr("listType")?row[$(v).attr("pathsave")]:$.evalJSON(row[$(v).attr("pathsave")]);
			for(var j in data){
			    if ($(v).attr("ctablerender")) {
					if ($(v).attr("ctablerender").indexOf("()") > -1)
						eval($(v).attr("ctablerender").replace("()", "(data[j])"));
					else
						eval($(v).attr("ctablerender")+"(data[j])");
				}
				var $tr=$($(v).find("thead.trow").html());
				$tr.find("td[path]").each(function(x,y){
					if(!data[j][$(y).attr("path")] && data[j][$(y).attr("path")]!=0) data[j][$(y).attr("path")]="";
					$(y).html(data[j][$(y).attr("path")]+"" || "");
				});
				$tr.find("a[path]").each(function(x,y){
					if(!data[j][$(y).attr("path")] && data[j][$(y).attr("path")]!=0) data[j][$(y).attr("path")]="";
					$(y).attr("href",data[j][$(y).attr("path")]+"" || "");
				});
                $tr.find("textarea,input,select").each(function (x, y) {
                    tdPath($(y),data[j][$(y).attr("name")]);
                });
				$tr.appendTo($(v).find("tbody"));
			}
		});
	}		
	$formid.find("span").removeClass("textbox-focused");
};
//取url参数
function getQueryString(url){
    var qs = {};
    var url = url || decodeURIComponent(window.location.href);
    //不管有没有伪静态 都看一下?问号后面的参数
    if (url.indexOf('?') > -1) {
        url = url.substring(url.indexOf('?') + 1);
        var prm = url.split('&');
        for (var p in prm) {
            if (prm[p]) {
                var sp = prm[p].split('=');
                if (sp.length > 1) {
                    var spkey = sp[0];
                    var spvalue = sp[1];

                    if (spvalue.indexOf('#') > -1) {
                        spvalue = spvalue.substring(0, spvalue.indexOf('#'));
                    }
                    qs[spkey] = spvalue;
                }
            }
        }
    }
    return qs;
};
//取当前时间返回年月日
function getNow(dateformat,noZero,t){
    var d = new Date();
	if(t) d=new Date(t);
    if (!dateformat) dateformat = "yyyy-MM-dd";
    dateformat = dateformat.replace("yyyy", d.getFullYear()); //代表年
    dateformat = dateformat.replace("MM", noZero?(d.getMonth() + 1):(d.getMonth() > 8 ? d.getMonth() + 1 : "0" + (d.getMonth() + 1)));   //代表月
    dateformat = dateformat.replace("dd", noZero?d.getDate():(d.getDate() > 9 ? d.getDate() : "0" + d.getDate()));   //代表日
    dateformat = dateformat.replace("hh", noZero?d.getHours():(d.getHours() > 9 ? d.getHours() : "0" + d.getHours()));   //代表时
    dateformat = dateformat.replace("mm", noZero?d.getMinutes():(d.getMinutes() > 9 ? d.getMinutes() : "0" + d.getMinutes()));   //代表分d.getMinutes()
    dateformat = dateformat.replace("ss", noZero?d.getSeconds():(d.getSeconds() > 9 ? d.getSeconds() : "0" + d.getSeconds()));   //代表秒d.getSeconds()
	var week = d.getDay();
	var day = "";
	if (week == 0)
		day = "日";
	else if (week == 1)
		day = "一";
	else if (week == 2)
		day = "二";
	else if (week == 3)
		day = "三";
	else if (week == 4)
		day = "四";
	else if (week == 5)
		day = "五";
	else if (week == 6)
		day = "六";
    dateformat = dateformat.replace("weekday", day);
    return dateformat;
};
//取当年之前之后几年
function getYear(year,years,type){
	var date=[];
	var nowY=new Date().getFullYear();
	for(var i=0;i<(years || 7);i++){
		var yval=(year || 0)+i+nowY+"";
		if(type)
			date.push({"name":yval,"value":yval});
		else
			date.push(yval);
	}
	return date;
};
//时间戳转日期
function getTimeDate(t,dateformat){
	return getNow(dateformat,false,t);
};
//转日期格式
function getdateformat(value,dateformat){
    if (value && dateformat) {
        var reg = /(\d{4})\S(\d{1,2})\S(\d{1,2})[\S\s](\d{1,2}):(\d{1,2}):(\d{1,2})/;
        var regdate = /(\d{4})\S(\d{1,2})\S(\d{1,2})/;
        if (reg.test(value) && value.toString().length < 20) {
            var result = value.match(reg);
            dateformat = dateformat.replace("yyyy", result[1]); //代表年
            dateformat = dateformat.replace("MM", result[2]);   //代表月
            dateformat = dateformat.replace("dd", result[3]);   //代表日
            dateformat = dateformat.replace("hh", result[4]);   //代表时
            dateformat = dateformat.replace("mm", result[5]);   //代表分
            dateformat = dateformat.replace("ss", result[6]);   //代表秒
            if (dateformat == "diff") {
                return zjs.getDateDiff(result[1] + "/" + result[2] + "/" + result[3] + " " + result[4] + ":" + result[5] + ":" + result[6]);
            }
            return dateformat;
        } else if (regdate.test(value) && value.toString().length < 20) {
            var result = value.match(regdate);
            dateformat = dateformat.replace("yyyy", result[1]); //代表年
            dateformat = dateformat.replace("MM", result[2]);   //代表月
            dateformat = dateformat.replace("dd", result[3]);   //代表日 
            if (dateformat == "diff") {
                return getDateDiff(result[1] + "/" + result[2] + "/" + result[3] + "");
            }
            return dateformat;
        }
    }
    return value;
};
//将时间转换成发表时间
function getDateDiff(dateadded) {
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();//当前时间的时间戳 时间戳是1970-1-1到现在的所有秒数
    var dateTimeStamp = new Date(dateadded).getTime();//你传的时间的时间戳
    var diffValue = now - dateTimeStamp;//相减 得出来相差的多少时间戳

    if (diffValue < 0) {
        //非法操作
        //alert("结束日期不能小于开始日期！");
    }

    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;

    if (monthC >= 1) {
        result = parseInt(monthC) + "月前";
    }
    else if (weekC >= 1) {
        result = parseInt(weekC) + "星期前";
    }
    else if (dayC >= 1) {
        result = parseInt(dayC) + "天前";
    }
    else if (hourC >= 1) {
        result = parseInt(hourC) + "小时前";
    }
    else if (minC >= 1) {
        result = parseInt(minC) + "分钟前";
    } else
        result = "刚刚";
    return result;
};
//菜单渲染
function menuH(data,ii,outH,outToken){
    var html=["<ul class='nav"+ii+"'>"];
    for (var i in data) {
        html.push("<li class='work'>");
        if(data[i].children){
            html.push("<a id='"+data[i].aid+"' path=''><i class='fr iconfont down'>&#xe673;</i><i class='fl iconfont'>"+(data[i].icon || "&#xe604;")+"</i><font>"+data[i].description+"</font></a>");
			html.push(menuH(data[i].children,(ii+1),outH,outToken));
        }else{
			var urlgps=data[i].url?data[i].url.split("/"):[];
			data[i].aid=urlgps.length>0?urlgps[urlgps.length-1].split(".")[0]:"";
			if(data[i].permissionCode && data[i].permissionCode.indexOf("out:")>-1){
                html.push("<a id='" + data[i].aid + "' isOut='true' path='"+outH + data[i].url+"?ACCESSTOKEN="+outToken + "'><i class='fl iconfont'>" + (data[i].icon || "&#xe604;") + "</i><font>" + data[i].description + "</font></a>");
			}else {
                html.push("<a id='" + data[i].aid + "' path='" + data[i].url + "'><i class='fl iconfont'>" + (data[i].icon || "&#xe604;") + "</i><font>" + data[i].description + "</font></a>");
            }
        }
        html.push("</li>");
    }
    html.push("</ul>");
    return html.join("");
};
//把后台传得扁平化JSON格式转化为EasyUI Tree树控件的JSON格式
//rows:json数据对象;idFieldName:表id的字段名;pidFieldName:表父级id的字段名;fileds:要显示的字段,多个字段用逗号分隔
function toTreeData(rows, id, parentid, fileds) {
    function exists(rows, ParentId) {
        for (var i = 0; i < rows.length; i++) {
            if (rows[i][id] == ParentId)
                return true;
        }
        return false;
    }
    var nodes = [];
    //for (var i = 0; i < rows.length; i++) {
	for(var i in rows){
        var row = rows[i];
		if(row.treeType){
			row.iconCls=row.treeType=='org'?"tree-org":"tree-user";
			fileds+=",iconCls";
		}
        if (!exists(rows, row[parentid])) {
            //var data = {
            //    id: row[id]
            //}
			var data={};
			data[id]=row[id];
            var arrFiled = fileds.split(",");
            for (var j = 0; j < arrFiled.length; j++) {
				var arrF=arrFiled[j].split("|");
                if (arrF[0] != id)
                    data[arrF[0]] = row[arrF[0]];
				if (arrF[1] && arrF[1] != id)
                    data[arrF[1]] = row[arrF[0]];
            }
            nodes.push(data);
        }
    }
    var toDo = [];
    for (var i = 0; i < nodes.length; i++) {
        toDo.push(nodes[i]);
    }
    while (toDo.length) {
        var node = toDo.shift(); // the parent node
        // get the children nodes
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row[parentid] == node[id]) {
                //var child = {
                //    id: row[id]
                //};
				var child={};
				child[id]=row[id];
                var arrFiled = fileds.split(",");
                for (var j = 0; j < arrFiled.length; j++) {
					var arrF=arrFiled[j].split("|");
					if (arrF[0] != id)
						child[arrF[0]] = row[arrF[0]];
					if (arrF[1] && arrF[1] != id)
						child[arrF[1]] = row[arrF[0]];
                }
                if (node.children) {
                    node.children.push(child);
                } else {
                    node.children = [child];
                }
                toDo.push(child);
            }
        }
    }
    return nodes;
};
//单行渲染
function fastrenderRow(datai, render) {
    var row = render;//new RegExp是正则表达式替换全局的语法 'g'为全局 为了解决js的替换bug 正常情况下js只能替换第一个
    for (var attr in datai) {
        if (datai[attr] == null)
            datai[attr] = "";
        row = row.replace(new RegExp("{{" + attr + "}}", 'g'), datai[attr]);
    }
    return row;
};
//数组渲染
function fastrender(data, render) {
    var tmp = [];
    for (var i = 0; i < data.length; i++) {
        var datai = data[i];//当前行 
        datai.datai = i;
        tmp.push(fastrenderRow(datai, render));
    }
    return (tmp.join(''));
};
//处理转义字符
function htmlDecode(value){		
	value=$('<div/>').html(value).text();
    if (typeof value == "string") {
		var dec=["&ldquo;-“","&rdquo;-”","&lsquo;-‘","&rsquo;-’","&quot;-\"","&#39;-'","&acute;-´","&lt;-<","&gt;->","&laquo;-«","&raquo;-»","&lsaquo;-‹","&rsaquo;-›"];
		for(var i in dec){
			var decA=dec[i].split("-");
			if(value.indexOf(decA[0])>-1) value = value.replace(new RegExp(decA[0], 'g'), decA[1]);
		}
    }
    return value;
};
//表单只读
function formReadonly(formid){
	var $formid=$("#"+formid);
	$formid.find("a.btn").hide();
    $formid.find("input[type=checkbox],input[type=radio]").prop("disabled","disabled");
	$formid.find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
		switch (v.nodeName) {
			case "TEXTAREA"://普通textarea 管理类
				$(v).attr("readonly","readonly").addClass("textAndInput_readonly");				
				if($(v).hasClass("kindeditor")) $(v).trigger("readonly");
				$("."+$(v).attr("id")+"Tip").hide();
				break;
			case "SELECT"://select管理类
				if($(v).hasClass("easyui-combobox")){
					$(v).combobox("readonly",true);
					$(v).next(".textbox").addClass("textAndInput_readonly");
				}else if($(v).hasClass("easyui-combogrid")){
					$(v).combogrid("readonly",true);
                    $(v).next(".textbox").addClass("textAndInput_readonly");
				}else{
					$(v).attr("readonly","readonly").addClass("textAndInput_readonly");
				}
				break;
			case "INPUT"://input管理类
				if(!$(v).attr("class"))//如果没有样式 就给个空
					$(v).attr("class","");
				else{
					$(v).attr("class"," "+$(v).attr("class"));
				}
				if($(v).hasClass("easyui-combobox")){
					$(v).combobox("readonly",true);
                    $(v).next(".textbox").addClass("textAndInput_readonly");
				}else if($(v).hasClass("cselectorImageUpload")){//文件上传
					$(v).attr("readonly","readonly");
					$(v).next().find(".uploadImage").css("left",0);
					$(v).next().find(".uploadImageI").css("padding-top",0);
					$(v).next().find("a.btn,a.fileDel").hide();
				} else if($(v).attr("class").indexOf(" datebox")>-1) {//
					$(v).datebox("readonly",true);
                    $(v).next(".textbox").addClass("textAndInput_readonly");
				}else if($(v).attr("class").indexOf("datetimebox")>-1) {//日期框
					$(v).datetimebox("readonly",true);
                    $(v).next(".textbox").addClass("textAndInput_readonly");
				} else {
					$(v).attr("readonly","readonly").addClass("textAndInput_readonly");
				}
				if($(v).attr("type")=="file") $(v).hide();
				break;
			default://普通input select
				$(v).attr("readonly","readonly").addClass("textAndInput_readonly");
				break;
		};
	});
	//特殊处理列表大json串
	if ($formid.attr("ctable")) {
		var tabs = $formid.attr("ctable").split(",");
		for (var i in tabs) {
			var $table = $("#"+formid+ " table[id='" + tabs[i] + "']");
			$table.find("a").hide();
		}
	}else{
		$formid.find("table[pathsave]").each(function(i,v){
			$(v).find("a").hide();
		});
	}
};
//放开表单只读
function formReadonlyNo(formid){
	var $formid=$("#"+formid);
	$formid.find("a.btn").show();
    $formid.find("input[type=checkbox],input[type=radio]").removeAttr("disabled");
	$formid.find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
		switch (v.nodeName) {
			case "TEXTAREA"://普通textarea 管理类
				$(v).removeAttr("readonly").removeClass("textAndInput_readonly");							
				if($(v).hasClass("kindeditor")) $(v).trigger("readonlyNo");				
				$("."+$(v).attr("id")+"Tip").show();
				break;
			case "SELECT"://select管理类
				if($(v).hasClass("easyui-combobox")){
					$(v).combobox("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				}else if($(v).hasClass("easyui-combogrid")){
					$(v).combogrid("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				}else{
					$(v).removeAttr("readonly").removeClass("textAndInput_readonly");
				}
				break;
			case "INPUT"://input管理类
				if(!$(v).attr("class"))//如果没有样式 就给个空
					$(v).attr("class","");
				else{
					$(v).attr("class"," "+$(v).attr("class"));
				}
				if($(v).hasClass("easyui-combobox")){
					$(v).combobox("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				}else if($(v).hasClass("cselectorImageUpload")){//文件上传
                    $(v).removeAttr("readonly");					
					$(v).next().find(".uploadImage").css("left",88);
					$(v).next().find(".uploadImageI").css("padding-top","38px");
					$(v).next().find("a.btn,a.fileDel").show();
				} else if($(v).attr("class").indexOf(" datebox")>-1) {//
					$(v).datebox("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				}else if($(v).attr("class").indexOf("datetimebox")>-1) {//日期框
					$(v).datetimebox("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				} else {
					$(v).removeAttr("readonly").removeClass("textAndInput_readonly");
				}				
				if($(v).attr("type")=="file") $(v).show();
				break;
			default://普通input select
				$(v).removeAttr("readonly").removeClass("textAndInput_readonly");
				break;
		};
	});
	//特殊处理列表大json串
	if ($formid.attr("ctable")) {
		var tabs = $formid.attr("ctable").split(",");
		for (var i in tabs) {
			var $table = $("#"+formid+ " table[id='" + tabs[i] + "']");
			$table.find("a").show();
		}
	}else{
		$formid.find("table[pathsave]").each(function(i,v){
			$(v).find("a").show();
		});
	}
};
//控件只读
function idReadonly(id){
	var $ids=$("#"+id+",."+id);
	$ids.each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
		switch (v.nodeName) {
			case "TEXTAREA"://普通textarea 管理类
				$(v).attr("readonly","readonly").addClass("textAndInput_readonly");				
				if($(v).hasClass("kindeditor")) $(v).trigger("readonly");
				$("."+$(v).attr("id")+"Tip").hide();
				break;
			case "SELECT"://select管理类
				if($(v).hasClass("easyui-combobox")){
					$(v).combobox("readonly",true);
					$(v).next(".textbox").addClass("textAndInput_readonly");
				}else if($(v).hasClass("easyui-combogrid")){
					$(v).combogrid("readonly",true);
                    $(v).next(".textbox").addClass("textAndInput_readonly");
				}else{
					$(v).attr("readonly","readonly").addClass("textAndInput_readonly");
				}
				break;
			case "INPUT"://input管理类
				if($(v).attr("type")=="checkbox" || $(v).attr("type")=="radio") $(v).prop("disabled","disabled");
				if(!$(v).attr("class"))//如果没有样式 就给个空
					$(v).attr("class","");
				else{
					$(v).attr("class"," "+$(v).attr("class"));
				}
				if($(v).hasClass("easyui-combobox")){
					$(v).combobox("readonly",true);
                    $(v).next(".textbox").addClass("textAndInput_readonly");
				}else if($(v).hasClass("cselectorImageUpload")){//文件上传
					$(v).attr("readonly","readonly");
					$(v).next().find(".uploadImage").css("left",0);
					$(v).next().find(".uploadImageI").css("padding-top",0);								
					$(v).next().find("a.btn,a.fileDel,input[type=file]").hide();							
					$(v).next().find("input[type=file]").attr("readonly","readonly");
				} else if($(v).attr("class").indexOf(" datebox")>-1) {//
					$(v).datebox("readonly",true);
                    $(v).next(".textbox").addClass("textAndInput_readonly");
				}else if($(v).attr("class").indexOf("datetimebox")>-1) {//日期框
					$(v).datetimebox("readonly",true);
                    $(v).next(".textbox").addClass("textAndInput_readonly");
				} else {
					$(v).attr("readonly","readonly").addClass("textAndInput_readonly");
				}
				if($(v).attr("type")=="file") $(v).hide();
				break;
			default://普通input select
				$(v).attr("readonly","readonly").addClass("textAndInput_readonly");
				break;
		};
	});
};
//控件取消只读
function idReadonlyNo(id){
	var $ids=$("#"+id+",."+id);
	$ids.each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
		switch (v.nodeName) {
			case "TEXTAREA"://普通textarea 管理类
				$(v).removeAttr("readonly").removeClass("textAndInput_readonly");							
				if($(v).hasClass("kindeditor")) $(v).trigger("readonlyNo");				
				$("."+$(v).attr("id")+"Tip").show();
				break;
			case "SELECT"://select管理类
				if($(v).hasClass("easyui-combobox")){
					$(v).combobox("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				}else if($(v).hasClass("easyui-combogrid")){
					$(v).combogrid("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				}else{
					$(v).removeAttr("readonly").removeClass("textAndInput_readonly");
				}
				break;
			case "INPUT"://input管理类
				if($(v).attr("type")=="checkbox" || $(v).attr("type")=="radio") $(v).removeAttr("disabled");
				if(!$(v).attr("class"))//如果没有样式 就给个空
					$(v).attr("class","");
				else{
					$(v).attr("class"," "+$(v).attr("class"));
				}			
				if($(v).hasClass("easyui-combobox")){
					$(v).combobox("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				}else if($(v).hasClass("cselectorImageUpload")){//文件上传
                    $(v).removeAttr("readonly");					
					$(v).next().find(".uploadImage").css("left",88);					
					$(v).next().find(".uploadImageI").css("padding-top","38px");			
					$(v).next().find("input[type=file]").removeAttr("readonly");		
					$(v).next().find("a.btn,a.fileDel,input[type=file]").show();
				} else if($(v).attr("class").indexOf(" datebox")>-1) {//
					$(v).datebox("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				}else if($(v).attr("class").indexOf("datetimebox")>-1) {//日期框
					$(v).datetimebox("readonly",false);
                    $(v).next(".textbox").removeClass("textAndInput_readonly");
                    $(v).next(".textbox").find(".textbox-text").removeClass("textAndInput_readonly");
				} else {
					$(v).removeAttr("readonly").removeClass("textAndInput_readonly");
				}				
				if($(v).attr("type")=="file") $(v).show();
				break;
			default://普通input select
				$(v).removeAttr("readonly").removeClass("textAndInput_readonly");
				break;
		};
	});
};
//表单加载
function loadForm(formid,ajaxD){
	var $formid=$("#"+formid);
	$formid.form("reset").find("input,textarea").removeClass("validatebox-invalid");//把对话框里面的样式重置
	$formid.find("span.textbox-invalid").removeClass("textbox-invalid");//把下拉选择框里面的样式重置
	$formid.find("input.cselectorImageUpload").each(function (i, v) {//重置form之后文件上传控件变形或者重置
		initfileupload($(v));
	});
	//重置form之后如果下拉框有需要特殊处理就特殊处理一下
	$formid.find("select.easyui-combobox").each(function (i, v) {
		if ($(v).attr("conchange")) {//赋值之后对其他影响
			if ($(v).attr("conchange").indexOf("()") > -1)
				eval($(v).attr("conchange").replace("()", "") + "('" + $(v).val() + "')");
			else
				eval($(v).attr("conchange") + "('" + $(v).val() + "')");
		}
	});
	//处理默认值
	if ($formid.attr("initsystem")) {
		eval($formid.attr("initsystem"));
		$("input").removeClass("validatebox-invalid");//把对话框里面的样式重置
		$("span.textbox-invalid").removeClass("textbox-invalid");//把下拉选择框里面的样式重置
	}
	$formid.find("table[pathsave]").each(function(i,v){
		$(v).find("tbody tr").remove();
	});
	if ($formid.attr("cmd-select") && ajaxD) {//如果需要调命令获取数据
		var ajaxopts={
			url: $formid.attr("cmd-select"),
			data: ajaxD,
			success: function (datai) {
				var row = datai.data;
				//数据赋值之前要干什么
				if ($formid.attr("beforerender")) {
					if ($formid.attr("beforerender").indexOf("()") > -1)
						eval($formid.attr("beforerender").replace("()", "(row,true)"));
					else
						eval($formid.attr("beforerender") + "(row,true)");
				}
				//把取到的数据赋值到对应form表单
				formval(row,"#"+formid);
				//数据赋值之后要干什么
				if ($formid.attr("getcallback")) {
					if ($formid.attr("getcallback").indexOf("()") > -1)
						eval($formid.attr("getcallback").replace("()", "(row)"));
					else
						eval($formid.attr("getcallback") + "(row)");
				}
				$formid.form("validate");
			}
		};
		if ($formid.attr("scontentType")) {
			ajaxopts.contentType=$formid.attr("scontentType");
		}
		ajaxgeneral(ajaxopts);
	}	
};
//取当天之前之后几天
function getNowArray(day,days,dateformat,type){
	var date=[];
	var nowC=new Date().getTime();
	for(var i=0;i<(days || 7);i++){
		var d=((day || 0)+i)*24*60*60*1000;
		var dval=getTimeDate(nowC+d,dateformat);
		if(type)
			date.push({"name":dval,"value":dval});
		else
			date.push(dval);
	}
	return date;
};
//扩展数组方法 按下标删除数组
function removeArray(array, dx) {
    if (isNaN(dx) || dx > array.length) { return false; }
    for (var i = 0, n = 0; i < array.length; i++) {
        if (array[i] != array[dx]) {
            array[n++] = array[i];
        }
    }
    array.length -= 1;
};
//扩展数组方法 按值下标删除数组
function removeArrayVal(array, val) {
	if(array.join(",").indexOf(val)<0){ return array;}
	var na=[];
	for (var i = 0, n = 0; i < array.length; i++) {
		if (array[i] != val) {
			na.push(array[i]);
		}
	}
	return na;
};
//获取数组中对应的一条记录
function getmyobject(data, id, idkey) {
    var temp = {};
    for (var di in data) {
        var datai = data[di];
        if (datai[idkey] == id) {
            temp = datai;
        }
    }
    return temp;
};
//多个值获取数组中对应的一条记录
function getmyobjectS(data, ids, idkeys) {
    var temp = {};
    for (var di in data) {
        var datai = data[di];
		var a=0;
		for(var i in ids){
			if (datai[idkey[i]] == ids[i]) {
				a++;
			}
		}
		if(a==ids.length) temp = datai;
    }
    return temp;
};
//获取数组中所有字段=值的记录   数组 值 字段
function getmylist(data, id, idkey) {
    var temp = [];
    for (var di in data) {
        var datai = data[di];
        if (datai[idkey] == id) {
            temp.push(datai);
        }
    }
    return temp;
};
//校验表单是否通过验证
function formValidate(formid){
	var $form=$("#"+formid);
	if ($form.form("validate")) {//表单检验是否成功
		var uploadv = 1;
		$form.find("input.cselectorImageUpload").each(function (i, v) {
			if ($(v).attr("required") && $(v).val() == "") {
				uploadv = 0;
				//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
				//getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
				return false;
			}
		});													
		$form.find("textarea.kindeditor").each(function (i, v) {//重置form之后文件上传控件变形或者重置
			$(v).trigger("getdata");
			if ($(v).attr("required") && $(v).val() == "") {
				uploadv = 0;
				//getparent().mesAlert("温馨提示", $(v).attr("mesInfo"), 'warning');
				//getparent().mesShow("温馨提示",$(v).attr("mesInfo"), 2000,'orange');
				return false;
			}
		});
		if (uploadv == 1) {
			var data=getFormValue(formid);
			if(data){
				if ($form.attr("onSubmit")) {//如果提交之前需要额外传参或者其他操作可在页面上配置onSubmit函数，要求有return true;或者return false;(说明中断提交)	
					if ($form.attr("onSubmit").indexOf("()") > -1){
						return eval($form.attr("onSubmit").replace("()", "") + "(data)");
					}else{
						return eval($form.attr("onSubmit") + "(data)");
					}
				}
				if ($form.attr("beforeSubmit")) {//如果提交之前需要额外传参或者其他操作可在页面上配置onSubmit函数，要求有return true;或者return false;(说明中断提交)	
					if ($form.attr("beforeSubmit").indexOf("()") > -1){
						return eval($form.attr("beforeSubmit").replace("()", "") + "(data)");
					}else{
						return eval($form.attr("beforeSubmit") + "(data)");
					}
				}
			}else{
				formValidateInfo(formid);
				return false;
			}
		}else{
			formValidateInfo(formid);
			return false;
		}
	}else{ //校验不成功，如果有提示信息弹出提示信息	
		formValidateInfo(formid);
		return false;
	}
	return true;
};
function mesSub(mes){
    if(mes.indexOf("{")>-1) {
        mes = mes.substr(0, mes.indexOf("{") - 1) + mes.substr(mes.indexOf("}") + 1, mes.length);
        mes=mesSub(mes);
    }
    return mes;
};
function formValidateInfo(formid){	
	var $form;
	if(typeof formid == "string")
		$form=$("#"+formid);
	else
		$form=formid;
	var validA=[];
	$form.find(".easyui-validatebox,.easyui-combobox,.easyui-datebox,.easyui-datetimebox,.easyui-combogrid,.easyui-combotree,input.cselectorImageUpload,textarea.kindeditor").each(function (i, v) {
		var cn=$(v).attr("class");
		var valid=true;
		if(cn.indexOf("easyui-validatebox")>-1) valid=$(v).validatebox("isValid");
		if(cn.indexOf("easyui-combobox")>-1) valid=$(v).combobox("isValid");
		if(cn.indexOf("easyui-datebox")>-1) valid=$(v).datebox("isValid");
		if(cn.indexOf("easyui-datetimebox")>-1) valid=$(v).datetimebox("isValid");
		if(cn.indexOf("easyui-combogrid")>-1) valid=$(v).combogrid("isValid");
		if(cn.indexOf("easyui-combotree")>-1) valid=$(v).combotree("isValid");
		if(cn.indexOf("cselectorImageUpload")>-1 || cn.indexOf("kindeditor")>-1) valid=!($(v).attr("required") && $(v).val() == "");
		if (!valid) {		
			var vi={};
			if ($(v).attr("validatemes")) {
				var mes=$(v).attr("validatemes").split("#");
				vi.idname=mes[0],
				vi.vMes=mes[1];					
			}else{
				vi.idname=$(v).parent("td").prev().text();
				var opts;
				if(cn.indexOf("easyui-validatebox")>-1){
					opts=$(v).validatebox("options");
					if(opts.required) vi.vMes=$(v).validatebox("options").missingMessage;
				}
				if(cn.indexOf("easyui-combobox")>-1){
					opts=$(v).combobox("options");
					if(opts.required) vi.vMes=$(v).combobox("options").missingMessage;
				}
				if(cn.indexOf("easyui-datebox")>-1){
					opts=$(v).datebox("options");
					if(opts.required) vi.vMes=opts.missingMessage;
				}
				if(cn.indexOf("easyui-datetimebox")>-1){
					opts=$(v).datetimebox("options");
					if(opts.required) vi.vMes=opts.missingMessage;
				}
				if(cn.indexOf("easyui-combogrid")>-1){
					opts=$(v).combogrid("options");
					if(opts.required) vi.vMes=$(v).combogrid("options").missingMessage;
				}
				if(cn.indexOf("easyui-combotree")>-1){
					opts=$(v).combotree("options");
					if(opts.required) vi.vMes=$(v).combotree("options").missingMessage;
				}
				if(cn.indexOf("cselectorImageUpload")>-1) {
					opts=null;
					vi.vMes=$(v).attr("mesInfo") || "必须上传附件";
				}
				if(cn.indexOf("kindeditor")>-1) {
					opts=null;
					vi.vMes=$(v).attr("mesInfo") || "必须填写富文本";
				}
				if(opts){					
					if(opts.validType){
						if(typeof opts.validType=="string"){	
							vi.vMes=formValidateInfoI(opts.validType,opts,vi.vMes,v);
						}else{
							for(var a in opts.validType){
								vi.vMes=formValidateInfoI(opts.validType[a],opts,vi.vMes,v);
							}
						}
					}
				}
			}
			validA.push(vi);
		}
	});		
	if(validA.length>0){
		var html=["<table class='validatesMesDiv' border='0' cellpadding='0' cellspacing='6'>"];
		for(var i in validA){
			//validA[i].idname=validA[i].idname.replace(new RegExp("*", 'g')," ");
			validA[i].idname=validA[i].idname.replace("*"," ");
			html.push("<tr><td width='200' align='right'><b>"+validA[i].idname+"</b></td><td width='330' align='left' class='col_r'>"+validA[i].vMes+"</td></tr>");
		}
		html.push("</table>");
		getparent().mesAlert("温馨提示",html.join(""), 'error');
	}
};
function formValidateInfoI(valT,opts,fMes,vv){	
var vMes=fMes;			
if(valT.indexOf("[")>-1){	
	var mes=valT.split("[");
	vMes=(vMes?(vMes+"并且"):"")+opts.rules[mes[0]].message;						
	var vs=/([a-zA-Z_]+)(.*)/.exec(valT);
	var vsI=opts.validParams||eval(vs[2]);
	if(vs[1]=="maxLength" && vs.length>1){
		if(vs[2].indexOf(",")>-1){
			vMes=vMes.replace("{0}",vsI[0]);
			if($(vv).val().length-vsI[0]>0) vMes+=("，已超 "+($(vv).val().length-vsI[0])+" 个字");
		}else{
			vMes=vMes.replace("{0}",vsI[0]);
		}			
	}else{
		if(vsI){
			for(var i=0;i<vsI.length;i++){
				vMes=vMes.replace(new RegExp("\\{"+i+"\\}","g"),vsI[i]);
			}
			vMes=mesSub(vMes);
		}
	}						
}else{
	vMes=(vMes?(vMes+"并且"):"")+opts.rules[valT].message;
}
return vMes;
};
//获取表单数据
function getFormValue(formid){
	var $form=$("#"+formid);
	var data = {};
	$form.find("input,select,textarea").each(function (i, v) {//取表单要提交的参数，以name为准，password会用md5加密
		if ($(v).attr("name")) {
			if ($(v).attr("type") == "password") {
				data[v.name] = hex_md5(v.value || "");
			} else if($(v).hasClass("cselectorImageUpload")){
                data[v.name] = v.value?($(v).attr("valType")?v.value:$.evalJSON(v.value)):[];
			} else{
				data[v.name] = v.value || "";
			}
		}
	});
	//特殊处理列表大json串
	if ($form.attr("ctable")) {
		var tabs = $form.attr("ctable").split(",");
		for (var i in tabs) {
			var list = [];
			var $table = $("#"+formid+ " table[id='" + tabs[i] + "']");
			$table.find("tbody tr").each(function (x, y) {
				var listi = {};
				$(y).find("td[path]").each(function (a, b) {
					listi[$(b).attr("path")] = $(b).text() || "";
				});
				$(y).find("a[path]").each(function (a, b) {
					listi[$(b).attr("path")] = $(b).attr("href") || "";
				});
				$(y).find("input,select,textarea").each(function (a, b) {
					if ($(b).attr("name")) {
						if ($(b).attr("type") == "password") {
							listi[b.name] = hex_md5(b.value || "");
						} else if($(b).hasClass("cselectorImageUpload")){
							listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
						} else{
							listi[b.name] = b.value || "";
						}
					}
				});
				list.push(listi);
			});
			data[tabs[i]] = $table.attr("listType")?list:$.toJSON(list);
		}
	}else{
		$form.find("table[pathsave]").each(function(i,v){
			var list=[];
			$(v).find("tbody tr").each(function (x, y) {
				var listi = {};
				$(y).find("td[path]").each(function (a, b) {
					listi[$(b).attr("path")] = $(b).text() || "";
				});
				$(y).find("a[path]").each(function (a, b) {
					listi[$(b).attr("path")] = $(b).attr("href") || "";
				});
				$(y).find("input,select,textarea").each(function (a, b) {
					if ($(b).attr("name")) {
						if ($(b).attr("type") == "password") {
							listi[b.name] = hex_md5(b.value || "");
						} else if($(b).hasClass("cselectorImageUpload")){
							listi[b.name] = b.value?($(b).attr("valType")?b.value:$.evalJSON(b.value)):[];
						} else{
							listi[b.name] = b.value || "";
						}
					}
				});
				list.push(listi);
			});
			data[$(v).attr("pathsave")] = $(v).attr("listType")?list:$.toJSON(list);
		});
	}
	var submitval=true;
    if ($form.attr("onSubmit")) {
        if ($form.attr("onSubmit").indexOf("()") > -1)
            submitval=eval($form.attr("onSubmit").replace("()", "")+"(data)");
            //getparent().window[callback+'F'].window[$form.attr("onSubmit").replace("()", "")](data);
        else
            submitval=eval($form.attr("onSubmit")+"(data)");
            //getparent().window[callback+'F'].window[$form.attr("onSubmit")](data);
    }
    if ($form.attr("beforeSubmit")) {
        if ($form.attr("beforeSubmit").indexOf("()") > -1)
            submitval=eval($form.attr("beforeSubmit").replace("()", "")+"(data)");
            //getparent().window[callback+'F'].window[$form.attr("beforeSubmit").replace("()", "")](data);
        else
            submitval=eval($form.attr("beforeSubmit")+"(data)");
            //getparent().window[beforeSubmit+'F'].window[$form.attr("beforeSubmit")](data);
    }
    if (!submitval) {
    	return false;
    }
	return data;
};
//ctable的td的控件变形
function tdPath($t,val){
	var classpath=$t.attr("classpath");	
	$t.attr("class",$t.attr("class")?($t.attr("class")+" "+$t.attr("classpath")):$t.attr("classpath"));
	if(val!=undefined) val=val==null?"":val;
	switch(classpath){
		case "validatebox":
			$t.addClass("easyui-validatebox").validatebox();
			if(val!=undefined) $t.val(val);
			$t.removeClass("validatebox-invalid");
			break;
		case "cselectorImageUpload":
			$t.addClass("cselectorImageUpload");
			initfileupload($t);			
            if (!val && val != 0) val = "";
			$t.val(val!=""?$.toJSON(val):val).trigger("change");
			break;
		case "combobox":		
			$t.addClass("easyui-combobox").combobox();
			if(val!=undefined) $t.combobox("setValue",val);
			//$t.removeClass("validatebox-invalid");
			break;
		default:
			if(val!=undefined) $t.val(val);
			break;
	}
};
//流程类型名称和页面
function appNameTH(appName,htmls,val){
	if(typeof appName=="string"){
		return {"type":appName,"html":htmls};
	}else{
		var hi,ni;
		for(var i in appName){
			if(i.indexOf(val)>-1) ni=i;
		}
		for(var i in htmls){
			if(i.indexOf(val)>-1) hi=i;
		}
		return {"type":appName[ni],"html":htmls[hi]};
	}
};
//拼接需要刷新的查询链接
function tourl(url,data){
	var tourl=url;
	for(var i in data){
		if(tourl.indexOf('?')>-1)
			tourl+='&'+i+'='+data[i];
		else
			tourl+='?'+i+'='+data[i];
	}
	return tourl;
};
// 选择时间不能再当前时间之前
function dateNowAfter(id){
	$("#"+id+",."+id).each(function(i,v){
		var opts={
			styler : function(date){
				var now = new Date();
				var d1 = new Date(now.getFullYear(),now.getMonth(),now.getDate());
				return date < d1?"color:#eee":"";
			},
			validator:function(date){
				var now = new Date();
				var d1 = new Date(now.getFullYear(),now.getMonth(),now.getDate());
				return date >= d1;
			}
		};
		if($(v).hasClass("easyui-datebox")){
			$(v).datebox('calendar').calendar(opts);
		}
		if($(v).hasClass("easyui-datetimebox")){		
			$(v).datetimebox('calendar').calendar(opts);
		}
	});
};
//处理树
function treedata(data,recursive,firstnode){
	if(data.errcode && !data.length){
		var newdata=[];
		newdata.push(data);
		data=newdata;
		function childsel(sdata) {
			var myselect = true;
			if (sdata.children && sdata.children.length>0) {//如果有子节点 就循环子节点
				for (var i in sdata.children) {
					var sdatai = sdata.children[i];//某一个子节点
					if (!childsel(sdatai)) {//递归当前这个节点 从递归里可以读到当前节点的子节点 如果有一个节点没选中 当前节点就不选中
						myselect = false;
					}
				}
				sdata.select = myselect;//设置当前节点状态 为子节点的逻辑
			} else {//如果没有子节点 就返回自己的选中状态
				myselect = sdata.select;
			}			
			if(sdata.treeType) sdata.iconCls=sdata.treeType=='org'?"tree-org":"tree-user";
			if(sdata.select){
				sdata.state="open";
			}else{
				sdata.state="closed";
			}
			return myselect;
		};
		childsel(data[0]);
	}
	if(recursive){
		function childtree(tdata){
			var tmp=recursive.split(",");
			if(tdata){
				for(var i in tdata){
					for (var j = 0; j < tmp.length; j++) {
						var t1 = tmp[j].split('|')[0];
						var t2 = tmp[j].split('|')[1];
						tdata[i][t1]=tdata[i][t2];
					}
					childtree(tdata[i].children);
				}
			}
		};
		childtree(data);
	}
	if(firstnode){
		data[0].state="open";
	}
	return data;
};
//图片放大
function tobigimg(e){
	$(".imgtobig").remove();
	var $imgdiv=$("<div class='imgtobig'><i class='iconfont'>&#xe690;</i></div>'");
	$("body").append($imgdiv);
	var $img=$("<img src='"+(e.src || e)+"'/>");
	$imgdiv.append($img);
	$img.css({"width":"100%","height":"auto"});
};
//写cookies
web.setCookie = function (name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();//escape将参数值进行编码 expires过期时间
};
//读取cookies
web.getCookie = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");//从完整的cookie字符串中提取要的字段值
    if (arr = document.cookie.match(reg)) return unescape(arr[2]);//unescape反编码
    else return null;
};
//删除cookies
web.delCookie = function (name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = web.getCookie(name);
    if (cval != null) document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
};
function getCurrent(func){
	if(web.currentUser){
		if(func){
			if(typeof func=="string")
				eval(func);
			else
				func();
		}
	}else{
		ajaxCmd({
			url:"getCurrentUser",
			async:false,
			success:function(data){
				web.currentUser=data.data;
                if(func){
					if(typeof func=="string")
						eval(func);
					else
						func();
				}
			},error:function(){
				getparent().mesShow("温馨提示","获取iuser失败", 2000,'red');
			}
		});
	}
};
//ajax通用
function ajaxgeneral(opts){
	if(opts.currentUser || opts.MOBILENO){
		if(web.currentUser){
			if(opts.currentUser){
                opts.url=tourl(opts.url,{"currentUserCode":web.currentUser.username});
			}
			if(opts.MOBILENO){
				if(!opts.data) opts.data={};
				opts.data.MOBILENO=web.currentUser.preferredMobile;
			}
			ajaxCmd(opts);
		}else{
			ajaxCmd({
				url:"getCurrentUser",
				async:false,
				success:function(data){
					web.currentUser=data.data;
                    if(opts.currentUser){
                        opts.url=tourl(opts.url,{"currentUserCode":web.currentUser.username});
                    }
                    if(opts.MOBILENO){
                        if(!opts.data) opts.data={};
                        opts.data.MOBILENO=web.currentUser.preferredMobile;
                    }
					ajaxCmd(opts);
				},error:function(){
					getparent().mesShow("温馨提示","获取iuser失败", 2000,'red');
				}
			});
		}
	}else{
		ajaxCmd(opts);
	}
};
function getparent() {
    try {
        top["test"] = 1;//跨域情况下 尝试访问top顶层对象 如果可以访问就访问不行就继续下面
        return top;
    } catch (ex) { };
    try {
        parent["test"] = 1;//跨域情况下 尝试访问parent父层对象 如果可以访问就访问不行就继续下面
        return parent;
    } catch (ex) { };
    return window;//不能访问 就用当前对象
};
//真正的ajax
function ajaxCmd(opts){
	var ajaxpara={
		url:web.rootdir+opts.url,
		async:opts.async==false?false:true,
		type:"post",
		dataType:"json",
		success:function(data){//成功
			getparent().mesProgressClose();
			if(typeof data.errcode!="undefined"){
				if(data.errcode==0){
					if(data.message) getparent().mesShow("温馨提示",data.message || "操作成功", 2000);
					opts.success(data);
				}else{
					if(data.message || data.data) getparent().mesShow("温馨提示",data.message || data.data || "操作失败", 2000,'red');
					if(opts.sError){//当data.errcode=0时要做什么可传可不传
						opts.sError(data);
					}
				}
			}else{
				opts.success(data);
			}
		},error:function(data){
			getparent().mesProgressClose();
			
			if ((data.responseText || data.statusText).indexOf("login_tab") > -1) {
				//getparent().location.href = web.rootdir+"login";
			} else {
				if (data.errcode) {
					if(data.message) getparent().mesShow("温馨提示",data.message || "操作失败", 2000,'red');
				}
				if (opts.error) {//当ajax失败时要做什么可传可不传
					opts.error(data);
				}
			}
		}
	};
	if(opts.async){//同步还是异步，默认异步
		ajaxpara.async=opts.async;
	}
	if(opts.type){//post还是get，默认post
		ajaxpara.type=opts.type;
	}
	if(opts.dataType){//返回数据格式，默认json
		ajaxpara.dataType=opts.dataType;
	}
	if(opts.data){//传参
		ajaxpara.data=opts.data;
	}
	if(opts.contentType){//传参方式及传值
		ajaxpara.contentType=opts.contentType;
		if(ajaxpara.contentType.indexOf("json")>-1 && ajaxpara.data){
			ajaxpara.data=$.toJSON(ajaxpara.data);
		}
	}
	getparent().mesProgress();		
	if(web.ajaxLocal){
		ajaxLocal(ajaxpara);
	}
	$.ajax(ajaxpara);
};
//批量替换
function allReplace(val,f,t){
	return val.replace(new RegExp((f || "\n"),"g"),(t || ""));
};
function ajaxLocal(opts){
	opts.type="get";
	var url=opts.url.split("?")[0].split("/");
	if(typeof opts.data=="string"){
		if(typeof $.evalJSON(opts.data)=="object")
			opts.data=$.evalJSON(opts.data);
		else
			opts.data={"data":opts.data};
	}
	if(web.appCode)
		opts.url="/"+web.appCode+(web.ajaxUrl || "/ajax/")+url[url.length-1]+".json";
	else
		opts.url=(web.ajaxUrl || "/ajax/")+url[url.length-1]+".json";
};
//校验是否存在
function isHaveCode(a){
	var $t=$(a);
	if($t.val()!=""){
		var cmd=$t.attr("cmd");
		var data={};
		data[$t.attr("id")]=$t.val();
		ajaxgeneral({
			url:cmd,
			data:data,
			success:function(datas){
				if(datas.data) {
					getparent().mesShow("温馨提示","该编码已存在！", 2000,'red');
					$t.attr("codeError",1);
				}else{
					$t.removeAttr("codeError");
				}
			}
		});
	}
};
function getStandIndex(nr,datas){
	var b=-1;
	for(var i in datas){
		if(datas[i]==nr) b=i;
	}
	return b;
};
function hasCol(name,datas){
	var a=-1;
	var b=false;
	for(var x in datas){
		if(datas[x].title==name){
			a=x;
			b=true;
		}
	}
	return {"index":a,"has":b};
};
function isNotMouseClickSelf(e, handler) {
	var reltg = e.target || e.srcElement;
	while (reltg && reltg != handler) {
		reltg = reltg.parentNode;//遍历当前点击的所有父元素 有任意一个和目标相等 就说明点的是目标
	}
	return (reltg != handler);
};
$(function(){
$(document).on("mouseover",".titleTooltipA",function(){
	$(".titleTooltipD").remove();
	var t=$(this).offset();	
	var width="auto";
	if($(this).parent()) width=$(this).parent().width()+"px";
	if($(this).attr("width")) width=$(this).attr("width")+"px";
	var hr=$(this).html();
	if($(this).find(".titleTooltipA-content").length>0) hr=$(this).find(".titleTooltipA-content").html();
	var lr="left:"+t.left+"px;";
	var slr="left:20px;";
	if($(this).attr("width") && $(window).width()-t.left<parseInt($(this).attr("width"))){
		lr="right:"+($(window).width()-t.left-$(this).width())+"px;";
		slr="right:15px;left:auto;";
	}
	var html="<div class='titleTooltipD titleTooltip tooltip tooltip-bottom' style='width:"+width+";"+lr+"top:"+(t.top+$(this).height()+4)+"px; z-index: 9000; background: #e2f4ff;font-size:12px; border-color:#39aef5;display:block;'>"
		+hr+"<div class='tooltip-arrow-outer' style='"+slr+" border-bottom-color:#39aef5;'></div><div class='tooltip-arrow' style='"+slr+" border-bottom-color:#e2f4ff;'></div></div>";	
	$("body").append(html);
});	
$(document).on("mouseout",".titleTooltipA",function(){
	$(".titleTooltipD").remove();
});
$("form").each(function(i,v){
	formreset($(v).attr("id"));
});
$("textarea.kindeditor").each(function(i,v){
	if ($(v).attr("edit") != "1") {
        $(v).attr("edit", "1");

        var editor = null;
        //KindEditor.ready(function (K) { 
        editor = KindEditor.create('textarea.kindeditor', {
            allowImageUpload: false,			
			items: [
				'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'template', 'cut', 'copy', 'paste',
				'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
				'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
				'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
				'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
				'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'audio',
				'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
				'anchor', 'link', 'unlink'
			]
        });
        $(v).attr("edit", "1");

        $(v).change(function () {
            editor.html($(v).val());
        });
        $(v).bind("getdata", function () {
            $(v).val(editor.html());
        });
        $(v).bind("readonly", function () {
            editor.readonly();
        });
        $(v).bind("readonlyNo", function () {
            editor.readonly(false);
        });
        //});
    }
});
//点击图片放大
$(document).on("click",".meitucrop img,.images img,.localephotos img",function(e){
	$(".imgtobig").remove();
	var $imgdiv=$("<div class='imgtobig'><i class='iconfont'>&#xe690;</i></div>'");
	$("body").append($imgdiv);
	var $img=$(this).clone();
	$imgdiv.append($img);
	$img.css({"width":"auto","height":"100%"});
});
$(document).on("click",".imgtobig i",function(){
	$(".imgtobig").remove();
});
$(document).on("click",".chooseuser .choose i",function(){
	$(this).parent().remove();
});
});
//打印
(function($) {
    var opt;

    $.fn.jqprint = function (options) {
        opt = $.extend({}, $.fn.jqprint.defaults, options);

        var $element = (this instanceof jQuery) ? this : $(this);
        
        if (opt.operaSupport && $.browser.opera) 
        { 
            var tab = window.open("","jqPrint-preview");
            tab.document.open();

            var doc = tab.document;
        }
        else 
        {
            var $iframe = $("<iframe  />");
        
            if (!opt.debug) { $iframe.css({ position: "absolute", width: "0px", height: "0px", left: "-600px", top: "-600px" }); }

            $iframe.appendTo("body");
            var doc = $iframe[0].contentWindow.document;
        }
         
        if (opt.printContainer) { doc.write($element.outer()); }
        else { $element.each( function() { doc.write($(this).html()); }); }
        
        doc.close();
        
        (opt.operaSupport && $.browser.opera ? tab : $iframe[0].contentWindow).focus();
        setTimeout( function() { (opt.operaSupport && $.browser.opera ? tab : $iframe[0].contentWindow).print(); if (tab) { tab.close(); } }, 1000);
    }
    
    $.fn.jqprint.defaults = {
		debug: false,
		importCSS: true, 
		printContainer: true,
		operaSupport: true
	};

    // Thanks to 9__, found at http://users.livejournal.com/9__/380664.html
    jQuery.fn.outer = function() {
      return $($('<div></div>').html(this.clone())).html();
    } 
})(jQuery);
function initCfocus($id){
	var that = this;
	var i = 0;
	var $id = $id;
	var $box = $id.find(".box");    //主容器
	var $page = $id.find(".page");  //页码
	var $items = $id.find(".item");//列表
	var $prev = $id.find(".prev");//上一个
	var $next = $id.find(".next");//下一个
	var maxshow = $id.attr("maxshow") || 0;//最大同时显示数
	
	if (!$id.attr("fixed")) {//fixed表示固定高度
		$(window).resize(function () {
			if ($id.attr("fullall")) {//fullall表示撑满屏幕
				$id.width($(window).width());//设置高度
				$id.height($(window).height());//设置高度
			} else {
				if ($id.attr("full")) {//fixed表示固定高度
					$id.width($(window).width());//设置高度
				}
	
				if ($id.attr("half")) {
					$id.height($id.width() / 2);//设置高度
				} else if ($id.attr("video")) {
					$id.height($id.width() / 1.77);//设置高度
				} else {
					$id.height($id.width());//设置高度
				}
			}
		});
		$(window).trigger("resize");
		setTimeout(function () {//500毫秒后 重置一下 防止加载不完
			$(window).trigger("resize");
		}, 300);
	}
	
	$page.empty();          //清空页码
	clearInterval(that.timer);
	
	if ($id.attr("thumbnail")) {//启用缩略图模式
		$page.addClass("thumbnail");
		$items.each(function (i, v) {
			$page.append("<a><img class='thumbnail' src='" + $(v).find("img").first().attr("src") + "' /></a>");//追加页码
		});
	} else {
		$page.removeClass("thumbnail");
		$items.each(function (i, v) {
			$page.append("<a><i class='iconfont'>" + ($id.attr("iconfont") || "&#xe656;") + "</i></a>");//追加页码
		});
	}
	var $pageItems = $page.find("a");
	if ($items.length > 1) {
		//转到对应项
		var touchstartx = 0;
		function goItem(isback, isfirst) {
			touchstartx = 0;
			if ($id.attr("fadein")) {//如果是淡入淡出
				$items.eq(i).fadeIn("slow").siblings().hide();//显示对应项
			} else if ($id.attr("showin")) {//如果是淡入淡出
				$items.eq(i).show().css({ "opacity": "0.5" }).animate({ "opacity": "1" }, 300).siblings().hide();//显示对应项
			} else {
				$items.eq(i).show().siblings().hide();//显示对应项
			}
			$pageItems.removeClass("hover");//显示对应页码
			$pageItems.eq(i).addClass("hover");//显示对应页码
	
			if (maxshow) {//如果有最大显示数 就把其他的隐藏
				if (i > maxshow) {//如果到最大显示数以外了 比如最大显示3 现在到4了 那么4-3之前的隐藏 5-3之前的隐藏
					var other = i - parseInt(maxshow);
					$pageItems.show();
					$id.find(".page a:lt(" + other + ")").hide();
				} else {
					$pageItems.show();
				}
				if ($pageItems.eq(i).css("display") == "none") {
					$pageItems.eq(i).show();
				}
			}
		};
		function goPrev() {
			i--;//i++
			if (i < 0) {
				i = $items.length - 1;
			}//如果i到达最后一个 就重置
			goItem(true);//显示对应项
		};
		function goNext() {
			i++;//i++
			if (i >= $items.length) {
				i = 0;
			}//如果i到达最后一个 就重置
			goItem();//显示对应项
		};
		function inter() {
			clearInterval(that.timer);
			that.timer = setInterval(function () {//定时器
				//if ($id.parents(".ismoveing").length == 0)//如果父元素没有在移动 就动 否则不动
				goNext();
			}, 3000);
		};
	
		$pageItems.click(function () {
			i = $(this).index();
			goItem();//显示对应项
			inter(); //重置定时器
		});
		$prev.bind("click", function (e) {//前一个
			goPrev();
			inter(); //重置定时器
			e.stopPropagation();
		});
		$next.bind("click", function (e) {//后一个
			goNext();
			inter(); //重置定时器
			e.stopPropagation();
		});
		$items.bind("touchstart", function (e) {//往左拖 就向前
			touchstartx = e.originalEvent.changedTouches[0].pageX;
		}).bind("touchend", function (e) {//往右拖 就向后
			var touchendx = e.originalEvent.changedTouches[0].pageX;
			var touchvalue = touchendx - touchstartx;
			if (touchvalue > 10) {
				goPrev();
				inter(); //重置定时器
			} else if (touchvalue < -10) {
				goNext();
				inter(); //重置定时器
			} else {
				touchstartx = 0;
			}
		});
		$id.mousemove(function () {
			clearInterval(that.timer);
		});
		$id.mouseout(function () {
			inter(); //重置定时器
		});
	
		goItem(false, true);//加载完先显示第一项
		inter();//加载定时器
	}
};