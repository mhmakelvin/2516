javascript:
(function()
{
var midlist=[], titlelist=[];
var m_ex_list=[], m_ma_list=[], m_re_list=[], m_datalist=[], m_ex_comp=[], m_ma_comp=[], m_adata={};	//データ取得用変数
var m_id="", m_rating="", m_max_rating="", m_rankicon="", m_rankname="";
var play_hist=[], play_hist50=[], rcnt50=0, m_recent_ave=0, m_r_waku=0;

var clist=[], ranklist=[], complist=[];

var mainet_dom = 'https://maimai-net.com/maimai-mobile/';
var mra_update_algorithm = "2018.11.10";
var max_play_hist=50;

var music_count=maimai_inner_lv.length;
var music_update=mra_update_mlist;
var modoki_update=(mra_update_algorithm >= mra_update_llist)?mra_update_algorithm:mra_update_llist;
	
var md_ilist=maimai_inner_lv.map(function(x){return x.i});
var c_rank_trophy_list =
    [["元皆伝(旧)", "元十段(旧)", "元九段(旧)", "元八段(旧)", "元七段(旧)", "元六段(旧)",
      "元五段(旧)", "元四段(旧)", "元三段(旧)", "元二段(旧)", "元初段(旧)"]];
var c_rank_plate_list =[
	["青皆伝", "青十段", "青九段", "青八段"], 
	["緑皆伝(旧)", "緑十段(旧)", "緑九段(旧)", "緑八段(旧)", "緑七段(旧)", "緑六段(旧)", 
	 "緑五段(旧)", "緑四段(旧)", "緑三段(旧)", "緑二段(旧)", "緑初段(旧)"],
	["緑皆伝", "緑十段", "緑九段", "緑八段"],
	["橙皆伝(旧)", "橙十段(旧)", "橙九段(旧)", "橙八段(旧)", "橙七段(旧)", "橙六段(旧)", 
	 "橙五段(旧)", "橙四段(旧)", "橙三段(旧)", "橙二段(旧)", "橙初段(旧)"],
	["橙皆伝", "橙十段", "橙九段", "橙八段"], ["桃皆伝", "桃十段", "桃九段", "桃八段"],
	["紫皆伝", "紫十段", "紫九段", "紫八段"], ["白皆伝", "白十段", "白九段", "白八段"]
];

var c_comp_trophy_list = [["舞舞", "神", "極", "覇者"]];
var c_comp_plate_list=[
	["真舞舞", "真神", "真将", "真極"],
	["超舞舞", "超神", "超将", "超極"], ["檄舞舞", "檄神", "檄将", "檄極"],
	["橙舞舞", "橙神", "橙将", "橙極"], ["暁舞舞", "暁神", "暁将", "暁極"],
	["桃舞舞", "桃神", "桃将", "桃極"], ["櫻舞舞", "櫻神", "櫻将", "櫻極"],
	["紫舞舞", "紫神", "紫将", "紫極"], ["菫舞舞", "菫神", "菫将", "菫極"],
	["白舞舞", "白神", "白将", "白極"]
];

var music_ver_count=[1, 89, 59, 54, 32, 41, 40, 42, 57, 50, 55]; //最新は計算で
	
/* data.htmlを使う前提 */
function get_your_id(addr)
{
	$.ajax({type:'GET', url:addr, async: false})
		.done(function(data)
		{
			var tmp=$(data).find('.underline');
			if(tmp.length==0)
			{
				alert('maimai.netの利用権がない模様。\n1クレ以上プレーしてから再トライしてください。');
				window.location.href=mainet_dom + "home";
			}
			m_id = tmp[0].innerText.trim();
			var ratingstr = $(data).find('.blue')[1].innerText.trim();
			m_rating = ratingstr.replace(/（.*/, "");
			m_max_rating = ratingstr.replace(/.*（MAX |）/g, "");
			var ri=$($(data).find('.f_r')).find('img');
			m_rankicon=(ri.length!=0)?(ri[0].getAttribute('src')):("");
		}
	);
	return;
}

function get_music_lamp_data(md)
{
	var lamp=0; // 0x1000000:100sync, 0x10000:AP, 0x100:SSS, 0x1:FC
	var tmp =Array.prototype.slice.call($(md).find('img'))
		.map(function(x){ return $(x).attr('src').slice(46,-4);});
	for(var i=0; i<tmp.length; i++)
	{
		switch(tmp[i])
		{
			case "100": lamp |= 0x01000001 ; break;
			case "ap":
			case "ap_plus":
				lamp |= 0x00010101; break;
			case "sss":
			case "sss_plus":
				lamp |= 0x00000100; break;
			case "fc_gold":
			case "fc_silver":
				lamp |= 0x00000001; break;
			default:
				break;
		}
	}
	return lamp;
}

function get_music_mdata_achieve(achieve)
{
	var a_str=$(achieve).find('.achievement');
	return (a_str.length==0)?0:Number(a_str[0].innerText.trim().replace(/達成率：|\%|\./g, ""));
}
	
function get_pdata(achive_list, addr)
{
	$.ajax({type:'GET', url:addr, async: false})
		.done(function(data)
		{
			//成功時の処理本体
			var tablelist=Array.prototype.slice.call($(data).find('.list'))
			var scorelist = tablelist
				.map(function(x){return Number($(x).find('td')[3].innerText.replace(/,/g, '').replace(/---/, '0'));});
			var milist = tablelist
				.map(function(x){return Number($($(x).find('input')[2]).attr('value'));});
			var basedatalist=Array.prototype.slice.call($($(data).find('#accordion')[0]).find('h3'));
			var alist=basedatalist.map(get_music_mdata_achieve);
			var lamplist=basedatalist.map(get_music_lamp_data);
			for(var i=0; i<milist.length; i++)
				achive_list.push([milist[i], scorelist[i], lamplist[i], alist[i]]);
			music_ver_count.push((achive_list.length)-music_ver_count.reduce(function(x,y){return x+y;}))
			if(midlist.length==0){milist.map(function(x){midlist.push(x)})};
			if(titlelist.length==0)
			{
				basedatalist.map(function(x){titlelist.push(x.innerText.trim().replace(/\n.*/g, ''))});
			}
				
		}
	);
	return;
}

function get_trophy_data(collection_list, addr, dlist)
{
	$.ajax({type:'GET', url:addr, async: false})
		.done(function(data)
		{
			//成功時の処理本体
			var list_bom=$(data).find('.on');
			var np_list=Array.prototype.slice.call(list_bom).map(function(x){return x.innerText.trim();});
			var lnum = dlist.map(function(x){return np_list.indexOf(x);});
			lnum.push(-1);
			lnum=Array.from(new Set(lnum)).sort(function(a,b){return a-b;});
			lnum.shift();	// lnumの先頭(-1になるはず)を削除
			lnum.map(function(n){collection_list.push({name:list_bom[n].innerText.trim(), addr:""});});
		}
	);
	return;
}

function get_nameplate_data(collection_list, addr, dlist)
{
	$.ajax({type:'GET', url:addr, async: false})
		.done(function(data)
		{
			//成功時の処理本体
			var list_bom=$(data).find('.on');
			var np_list=Array.prototype.slice.call(list_bom).map(function(x){return x.innerText.trim();});
			var lnum = dlist.map(function(x){return np_list.indexOf(x);});
			lnum.push(-1);
			lnum=Array.from(new Set(lnum)).sort(function(a,b){return a-b;});
			lnum.shift();	// lnumの先頭(-1になるはず)を削除
			lnum.map(function(n){collection_list.push({name:list_bom[n].innerText.trim(),
						addr:$(list_bom[n]).find('img')[0].getAttribute('src')});});
		}
	);
	return;
}


function true_achive(score, score100per, achi)
{
	if(score == "---" || score100per == 0)
		return achi/10000;
	else
		return Number(score)/(score100per - (score100per%500));
}
	

	
	
function sort_condition(a,b)
{
	var lv_a, lv_b, achi_a, achi_b;
	if(b.music_rate != a.music_rate)
	{
		return b.music_rate - a.music_rate;
	}
	lv_a=[a.re_lv, a.ma_lv, a.ex_lv].map(mra_lv2tmp).sort(function(a,b){return b-a;});
	lv_b=[b.re_lv, b.ma_lv, b.ex_lv].map(mra_lv2tmp).sort(function(a,b){return b-a;});
	for(var i=0; i<3; i++)
	{
		if(lv_a[i] != lv_b[i])
			return lv_b[i] - lv_a[i];
	}
	achi_a=Math.max.apply(null, [a.ex_achi, a.ma_achi, a.re_achi]);
	achi_b=Math.max.apply(null, [b.ex_achi, b.ma_achi, b.re_achi]);
	return achi_b - achi_a;
}

function get_playdata_sub(li)
{
	if(play_hist.length >= max_play_hist)
		return;
	if($(li).find('hr').length == 0)	// resultではないところ
		return;
	if($(li).find('.playlog_utage').length!=0)	//宴はカウント対象外
		return;

	var name=$(li).find('.playdata_music_title')[0].innerText;
	var diff=($(li).find('.playlog_remaster').length!=0)?2:
		($(li).find('.playlog_master').length!=0)?1:
		($(li).find('.playlog_expert').length!=0)?0:-1;
	var achi=$(li).find('.result_icon_block3.text_c.f_l')[0].innerText.trim()
		.replace(/\n/g, "").replace(/.*：/, "").replace(/％/, "");
	achi=Number((Number(achi)/100).toFixed(4));
	
	var m_idx=md_ilist.indexOf(midlist[titlelist.indexOf(name)]);
	var rate_value=(diff<0 || m_idx<0)?0:(mra_achi2rate_100(achi, maimai_inner_lv[m_idx].l[diff]));
	
	play_hist.push({idx:play_hist.length, m_idx:m_idx, diff:diff, achi:achi, rate_value:rate_value});
	return;
}

function get_playdata(addr)
{
	$.ajax({type:'GET', url:addr, async: false})
		.done(function(data)
		{
			//成功時の処理本体
			var play_hist_raw = Array.prototype.slice.call($($(data).find('#accordion')[0]).find('li'));
			play_hist_raw.map(get_playdata_sub);	//play_histに必要データ格納
			play_hist_raw=null;
		}
	);
	return;
}

function lampnum2lampcount(lampstr)
{
	return ('00000000' + lampstr.toString(16)).slice(-8)	//必ず8文字化
		.match(/.{2}/g)	//2文字ずつ切り出し
		.map(function(x){return parseInt(x,16);})	//16->10進数化
}



function data2rating(dlist, ex_comp, ma_comp, ex_list, ma_list, re_list)
{
	var mlist_length=ma_list.length, re_length=re_list.length, lvlist_count=0;
	var ex_comp_tmp=new Array(music_ver_count.length +1).fill(0);
	var ma_comp_tmp=new Array(music_ver_count.length +1).fill(0);
	var tmp_achi, tmp_rate, tmp_bonus;
	var top_rate=0;	// 単曲レート最大値。bonusは含まず。
	
	var re_midlist=re_list.map(function(x){return x[0];});
	var idx=-1;
	var midx=-1;
	var ex_data, ma_data, re_data
	
	for(var i=0; i<mlist_length; i++)
	{
		function find(a){
			return a.i==i;
		}
		var found=maimai_inner_lv.findIndex(find);
		midx=md_ilist.indexOf(midlist[i]);
		if(midx < 0)
			continue;
		var md = maimai_inner_lv[midx];
		ex_data=ex_list[i];
		ma_data=ma_list[i];

		//単曲レート値計算
		dlist.push({
			mid:midlist[i],
			t:maimai_inner_lv[found].t,
			ex_lv:md.l[0],
			ex_achi:true_achive(ex_data[1], md.s[0][0], ex_data[3]),
			ex_rate:0,
			ex_bc:mra_sss_breakcount(ex_data[1], md.s[0]),
			ex_bk:md.s[0][1],
			ex_bonus:0,
			ex_lamp:ex_data[2],
			ma_lv:md.l[1],
			ma_achi:true_achive(ma_data[1], md.s[1][0], ma_data[3]),
			ma_rate:0,
			ma_bc:mra_sss_breakcount(ma_data[1], md.s[1]),
			ma_bk:md.s[1][1],
			ma_bonus:0,
			ma_lamp:ma_data[2],
			re_lv:md.l[2],
			re_achi:'---',
			re_rate:0,
			re_bc:0,
			re_bk:0,
			re_bonus:0,
			re_lamp:0,
			music_rate:0	
		});
		var tmp_dlist=dlist[lvlist_count];
		
		tmp_dlist.ex_rate = mra_achi2rate_100(tmp_dlist.ex_achi, tmp_dlist.ex_lv);
		tmp_dlist.ma_rate = mra_achi2rate_100(tmp_dlist.ma_achi, tmp_dlist.ma_lv);

		tmp_dlist.ex_bonus = (tmp_dlist.ex_bk==0)?0:
			Math.floor(tmp_dlist.ex_bc*100 / tmp_dlist.ex_bk);
		tmp_dlist.ma_bonus = (tmp_dlist.ma_bk==0)?0:
			Math.floor(tmp_dlist.ma_bc*100 / tmp_dlist.ma_bk);
		
		idx=re_midlist.indexOf(midlist[i]);

		if(idx>=0)
		{
			re_data=re_list[idx];
			tmp_dlist.re_achi= true_achive(re_data[1], md.s[2][0], re_data[3]);
			tmp_dlist.re_rate = (tmp_dlist.re_lv == "")?0:
					(mra_achi2rate_100(tmp_dlist.re_achi, tmp_dlist.re_lv));
			tmp_dlist.re_bk =md.s[2][1];
			tmp_dlist.re_bc = mra_sss_breakcount(re_data[1], md.s[2]);
			tmp_dlist.re_bonus = (tmp_dlist.re_bk==0)?0:
					Math.floor(tmp_dlist.re_bc*100 / tmp_dlist.re_bk);
			tmp_dlist.re_lamp = re_data[2];
		}
		
		var tdl=[tmp_dlist.ex_rate + tmp_dlist.ex_bonus,
			 tmp_dlist.ma_rate + tmp_dlist.ma_bonus,
			 tmp_dlist.re_rate + tmp_dlist.re_bonus];
		tmp_dlist.music_rate = Math.max.apply(null, tdl);
		
		top_rate=Math.max(top_rate, tmp_dlist.ex_rate, tmp_dlist.ma_rate, tmp_dlist.re_rate);

		ex_comp_tmp[md.v] += ex_data[2];
		ma_comp_tmp[md.v] += ma_data[2];

		lvlist_count++;
	}
	dlist.sort(sort_condition);

	ex_comp_tmp.map(lampnum2lampcount).map(function(x){ex_comp.push(x)});
	ma_comp_tmp.map(lampnum2lampcount).map(function(x){ma_comp.push(x)});
	
	return top_rate;
}
	
function current_rank()
{
	var colorlist=["", "", "", "", "", "", "", "", "", "金", "黒", "赤"];
	var ranklist=["", "初段", "二段", "三段", "四段", "五段", "六段", "七段", "八段", "九段", "十段", "皆伝"];

	if(m_rankicon!="")
	{
		m_rankname = colorlist[Number(m_rankicon.slice(-6, -4))];
		m_rankname += ranklist[Number(m_rankicon.slice(-9, -7))];
	}
	colorlist=null;
	ranklist=null;
	return;
}
	
function collection_filter(collection_list)
{
	var c_length = collection_list.length;
	var cf_length;
	var check=false;
	var lnum, tmpidx,tmplist=[];
	
	var collection_name_list = collection_list.map(function(y){return y.name;});

	// 初代のrank称号
	cf_length=c_rank_trophy_list.length;
	for(var i=0; i<cf_length; i++)
	{
		lnum = c_rank_trophy_list[i].map(function(x){return collection_name_list.indexOf(x);});
		tmpidx=-1;
		while(tmpidx==-1 && lnum.length!=0)
			tmpidx=lnum.shift();
		ranklist.push((tmpidx!=-1)?collection_list[tmpidx].name:"");
	}
	
	// nameplateなrank
	cf_length=c_rank_plate_list.length;
	for(var i=0; i<cf_length; i++)
	{
		lnum = c_rank_plate_list[i].map(function(x){return collection_name_list.indexOf(x);});
		tmpidx=-1;
		while(tmpidx==-1 && lnum.length!=0)
			tmpidx=lnum.shift();
		ranklist.push((tmpidx!=-1)?"<img src='"+ collection_list[tmpidx].addr + "' width=105>":"");
	}

	// 初代のcomp称号
	cf_length=c_comp_trophy_list.length;
	for(var i=0; i<cf_length; i++)
	{	tmplist=[];
		lnum = c_comp_trophy_list[i].map(function(x){return collection_name_list.indexOf(x);});
		if(lnum[0]!=-1 || lnum[1]!=-1) {lnum[2]=-1; lnum[3]=-1;} // 舞舞or神なら極, 覇者は表示しない
		if(lnum[2]!=-1) lnum[3]=-1; // 極なら覇者は表示しない
		while(lnum.length>0)
		{
			tmpidx=lnum.shift();	// tmpにlnumの先頭
			if(tmpidx!=-1) tmplist.push(collection_list[tmpidx].name);
		}
		complist.push(tmplist.join(' '));
	}

	// nameplateなcomplete
	cf_length=c_comp_plate_list.length;
	for(var i=0; i<cf_length; i++)
	{	
		lnum = c_comp_plate_list[i].map(function(x){return collection_name_list.indexOf(x);});
		if(lnum[0]!=-1) lnum[3]=-1; // 舞舞なら極は表示しない
		if(lnum[1]!=-1) {lnum[2]=-1; lnum[3]=-1;} // 神なら将、極は表示しない
		complist.push(lnum.map(function(x){ return (x==-1)?"":("<img src='"+ collection_list[x].addr + "' width=105>")}).join(""));
	}
	return;
}
	
function analyzing_rating(adata, dlist, crating, mrating, top_rate)
{
	var count=0, str="", best30=0, history=0, rating_count=[];
	var best_ave=0, best_limit=0, hist_limit=0, expect_max=0;
	var best_rating=0, best_left=0, recent_rating=0, hist_rating=0, hist_left=0, your_recent=0;
	var tweet_rate_str="";

	for(var i=0; i<30; i++)
	{
		best30 += dlist[i].music_rate;
	}	
	history=best30;
	for(var i=30 ;i<mra_history;i++)
	{
		history += dlist[i].music_rate;
	}

	best_ave = (Math.floor(best30/30)/100).toFixed(2);
	best_limit = (Math.floor(dlist[29].music_rate)/100).toFixed(2);
	hist_limit = (Math.floor(dlist[mra_history-1].music_rate)/100).toFixed(2);
	
	if(Number(hist_limit)<=0)
	{
		var count=0;
		for(count=0; dlist[count].music_rate > 0; count++);
		hist_limit= (mra_history-count) + "曲不足";
	}
	
	best_rating = Math.floor(best30/44);	//best30はRating*100
	recent_rating = Math.floor(top_rate*10/44);
	hist_rating = Math.floor(history/(mra_history*11));	// multiply 4/(473*44)
	
	your_recent= Number(crating)*100-hist_rating-best_rating;
	
	best_left = ((44 - Math.ceil(best30%44))/100).toFixed(2);
	hist_left = ((mra_history*11 - Math.ceil(history%(mra_history*11)))/100).toFixed(2);

	expect_max = (Math.floor(best_rating + recent_rating + hist_rating)/100).toFixed(2);
	best_rating = (best_rating/100).toFixed(2);
	recent_rating = (recent_rating/100).toFixed(2);
	hist_rating = (hist_rating/100).toFixed(2);
	your_recent=(your_recent/100).toFixed(2);

	// tweet用文字列
	tweet_rate_str = m_id + m_rankname + "%20%3a" + m_rating +"%28" + m_max_rating + "%29" + "%0D%0A";
	tweet_rate_str += "B平均%3a" + best_ave + "%0D%0A";
	tweet_rate_str += "R平均%3a" + m_recent_ave + "%0D%0A";
	tweet_rate_str += "B下限%3a" + best_limit + "%0D%0A";
	tweet_rate_str += "H下限%3a" + hist_limit + "%0D%0A";
	tweet_rate_str += "予想到達Rating%3a" + expect_max + "%0D%0A";
	tweet_rate_str += "B%3a" + best_rating + "%20%2B%20R%3a" + recent_rating + "%20%2B%20H%3a" + hist_rating + "%0D%0A";
	
	count=0;
	for( ; dlist[count].music_rate >= 1500; count++);
	rating_count.push(count);
	for( ; dlist[count].music_rate >= 1450; count++);
	rating_count.push(count);
	for( ; dlist[count].music_rate >= 1400; count++);
	rating_count.push(count);
	for( ; dlist[count].music_rate >= 1300; count++);
	rating_count.push(count);
	
	
	adata.best_average = Number(best_ave);	//num
	adata.best_limit = Number(best_limit);	//num
	adata.hist_limit = hist_limit;	//str
	adata.expect_max = Number(expect_max);	//num
	adata.b_waku = best_rating;		//str ok
	adata.b_left = best_left;		//str
	adata.r_waku = recent_rating;		//str ok
	adata.r_top = Number(top_rate);		//num
	adata.h_waku = hist_rating;		//str ok
	adata.h_left = hist_left;		//str
	adata.r_ref = your_recent;		//str ok
	adata.tweet = tweet_rate_str;		//str
	adata.r_count = rating_count;

	return;
}

function get_justnow()
{
	var today = new Date();
	var data_str = today.getFullYear() + "/" + (today.getMonth()+1) + "/" + today.getDate() + " ";
	data_str += (("0"+today.getHours()).slice(-2)) + ":" + (("0"+today.getMinutes()).slice(-2)) + ":" + (("0"+today.getSeconds()).slice(-2));
	return data_str;
}
	
function analysis_playdata()
{
	play_hist.sort(function(a,b){return b.rate_value-a.rate_value;});
	var rcnt50=play_hist.slice(0,10).map(function(x){return x.rate_value;})
		.reduce(function(a,b){return a+b;});
	m_recent_ave=Math.floor(rcnt50/10)/100;
	m_r_waku=(Math.floor(rcnt50/44)/100).toFixed(2);

	play_hist=null;
	
	return;
}

function uso_level(lv)
{
	if(lv.slice(-1) != ')') return lv;
	if(lv.slice(-2) == '+)') return lv;
	if(lv.slice(-2) == '-)') return lv.slice(0,-2) + ')';
	if(Number(lv.slice(-2, -1)) < 7) return lv.slice(0,-3) + ')';
	if(Number(lv.slice(-2, -1)) >= 7) return lv.slice(0,-3) + '+)';
	return lv;
}

function datalist_recalc(datalist)
{
	var d_len=datalist.length;
	var tmp;
	for(var i=0; i<d_len; i++)
	{
		tmp=datalist[i];
		tmp.ex_lv = uso_level(tmp.ex_lv);
		tmp.ma_lv = uso_level(tmp.ma_lv);
		tmp.re_lv = uso_level(tmp.re_lv);
	}
	return;
}
	
function get_ratingrank(rating)
{
	return (rating>=15)?("mai_rainbow"):(rating>=14.5)?("mai_gold"):(rating>=14)?("mai_silver"):(rating>=13)?("mai_copper"):
	(rating>=12)?("mai_violet"):(rating>=10)?("mai_red"):(rating>=7)?("mai_yellow"):(rating>=4)?("mai_green"):
	(rating>=1)?("mai_blue"):("mai_white");
}
	
function print_rank_comp(ver, background, fontcolor, rank1, rank2, comp1, comp2)
{
	var tmp = "";
	tmp += "<tr bgcolor=" + background + " align=center valign=middle>";
	tmp += "<th rowspan=2><font color='" + fontcolor + "'>" + ver + "</font></th>";
	tmp += "<th rowspan=2><font color='" + fontcolor + "'>";
	tmp += (rank2=="")?(rank1):(rank1=="")?(rank2):(rank1+"<br>"+rank2);
	tmp += "</font></th>";
	tmp += "<th><font color='" + fontcolor + "'>" + comp1 + "</th>";
	tmp += "</tr>";
	tmp += "<tr bgcolor=" + background + " align=center valign=middle>";
	tmp += "<th><font color='" + fontcolor + "'>" + comp2 + "</th>";
	tmp += "</tr>";
	
	return tmp;
}
	
function print_result_sub_print_header(title)
{
	var rslt_str ="";
	rslt_str += "<head>";
	rslt_str += "<title>" + title + " | 新・CYCLES FUNの寝言</title>";
    	rslt_str += "<link rel='stylesheet' media='all' type='text/css' href='https://sgimera.github.io/mai_RatingAnalyzer/css/mai_rating.css'>";
 	rslt_str += "<link rel='stylesheet' media='all' type='text/css' href='https://sgimera.github.io/mai_RatingAnalyzer/css/display.css'>";
 	rslt_str += "<link rel='stylesheet' media='all' type='text/css' href='https://sgimera.github.io/mai_RatingAnalyzer/css/result.css'>";
  	rslt_str += "</head>";
	
	return rslt_str;
}
	
function print_result_sub_print_title(str)
{
	var rslt_str="";
	rslt_str += "<h2 align=center>舞レート解析・あならいざもどき<br>";
	rslt_str += str;
	rslt_str += "</h2>";
	
	rslt_str += "<hr><p align=center>" + music_count + "songs(" + music_update + ") version<br>";
	rslt_str += "Last Update : " + modoki_update + "<br>";
	rslt_str += "Programmed by <a href='https://twitter.com/sgimera'>@sgimera</a></p><hr>";

	return rslt_str;
}

function print_result_sub_lamp2str(lampnum)
{
	var str = '';
	if((lampnum & 0x01000000) != 0)
		str += '舞';
	if((lampnum & 0x00010000) != 0)
		str += '神';
	if(str != '')
		return str;	//ここまでで何か入っていれば確定
	if((lampnum & 0x00000001) != 0)
		str += '極';
	return str;
}
	
function print_result_sub_print_data(rate_value, lv, achive, bc, bk, lmp, classname) // rate, lv, achive
{
	var str="", tmplv;
	str += "<th class=" + classname + ">" + (rate_value/100).toFixed(2) + "</th>";
	str += "<th class=" + classname + ">" + lv + "</th>";
	str += (bc==0)?"<th class=" + classname + ">" + (100*achive).toFixed(4) + "%</th>":
		"<th class=" + classname + ">" + bc + '/' + bk + "</th>";
	str += "<th class=" + classname + ">" + print_result_sub_lamp2str(lmp) + "</th>";

	return str;
}
	
function print_result_sub_print_datalist(dlist, datedata, id, dan, top_rate)
{
	var rslt_str ="", tmp_rate=0, m_name="";
	var print_str_array=[], ex_r=0, ma_r=0, re_r=0;

	rslt_str += "<p align=center><b>()付きは今作未検証。</b>過去値で計算。<br>12以上は最低値で計算</p>";
	rslt_str += "<table class=alltable border=1 align=center>";
	
	rslt_str += "<tr><th colspan=6 bgcolor=#000000><font color=#ffffff>" + id + dan + "　全曲レート値データ<br>";
	rslt_str += datedata + "現在</font></th></tr>";

	for(var i=0; i<dlist.length; i++)
	{
		var dli=dlist[i];
		re_r=dli.re_rate + dli.re_bonus;
		ma_r=dli.ma_rate + dli.ma_bonus;
		ex_r=dli.ex_rate + dli.ex_bonus;
		print_str_array=[];
	
		if(dli.re_lv != "" && dli.re_achi != "---" && dli.re_achi != 0)
		{
			print_str_array.push(print_result_sub_print_data
				(re_r, dli.re_lv, dli.re_achi, dli.re_bc, dli.re_bk, dli.re_lamp, "mai_remaster"));
		}
	
		if(dli.ma_achi != 0)	/* 0なら未プレー */
		{
			print_str_array.push(print_result_sub_print_data
				(ma_r, dli.ma_lv, dli.ma_achi, dli.ma_bc, dli.ma_bk, dli.ma_lamp, "mai_master"));
		}

		if(print_str_array.length==0 || Math.max(re_r, ma_r) < mra_achi2rate_100(1, dli.ex_lv)+100)	/* 0なら未プレー */
		{
			print_str_array.push(print_result_sub_print_data
				(ex_r, dli.ex_lv, dli.ex_achi, dli.ex_bc, dli.ex_bk, dli.ex_lamp, "mai_expert"));
		}

		m_name = dli.t;
		
		rslt_str += "<tr><th colspan=6 class=music_title>" + m_name + "</th></tr>"
		rslt_str += "<tr>";
		rslt_str += "<td align=center rowspan=" + print_str_array.length + ">";
		rslt_str += (Math.max(dli.re_rate, dli.ma_rate, dli.ex_rate) == top_rate)?"☆☆":(i+1);
		rslt_str += "</td>";
		rslt_str += "<th rowspan=" + print_str_array.length + " ";
		rslt_str += "class=" + get_ratingrank(dli.music_rate/100) + ">"
		rslt_str += (dli.music_rate/100).toFixed(2)  + "</th>"
		rslt_str += print_str_array.join('</tr><tr>')
		rslt_str += "</tr>";
	}
	
	rslt_str += "</table>";
	
	return rslt_str;
}


function print_lest_comp(ver, background, fontcolor, ma_data, ex_data, music_count)
{
	var tmp = "";
	tmp += "<tr bgcolor=" + background + " align=center>";
	tmp += "<th rowspan=2><font color='" + fontcolor + "'>" + ver + '(' + music_count + ')' + "</font></th>";
	tmp += "<td class=mai_master>M</td>";
	for(var i=0; i<4; i++)
		tmp += "<td><font color='" + fontcolor + "'>" + (music_count - ma_data[i]) + "</font></td>";
	tmp += "</tr>";
	tmp += "<tr bgcolor=" + background + " align=center>";
	tmp += "<td class=mai_expert>E</td>";
	for(var i=0; i<4; i++)
		tmp += "<td><font color='" + fontcolor + "'>" + (music_count - ex_data[i]) + "</font></td>";
	tmp += "</tr>";
	
	return tmp;
}

function print_result_sub(title, value, explain)
{
	var tmp = "";
	tmp += "<tr>";
	tmp += "<th>" + title + "</th>";
	tmp += "<th align=center class='tweet_info mai_white'>" + value + "</th>"
	tmp += "<td class=explain>" + explain + "</td>";
	tmp += "</tr>";
	
	return tmp;
}

function print_result_rating(title, value, explain, dispbasevalue)
{
	var tmp = "";
	tmp += "<tr>";
	tmp += "<th>" + title + "</th>";
	tmp += "<th align=center class='tweet_info " + get_ratingrank(dispbasevalue) + "'>" + value + "</td>"
	tmp += "<td class=explain>" + explain + "</td>";
	tmp += "</tr>";
	
	return tmp;
}

function print_result_comp_lest(date_str, id, ma_comp, ex_comp)
{
	var rslt_str = "";
	rslt_str += "<table class=complist border=1 align=center>";
	rslt_str += "<tr bgcolor='#000000' align=center valign=middle>";
	rslt_str += "<th colspan=6><font color='#ffffff'>" + id + "のComp plate残り状況<br>" + date_str + "現在</font></th>";
	rslt_str += "<tr bgcolor='#FFFFFF' align=center valign=middle>";
	rslt_str += "<th>ver.</th><th>難</th><th>舞舞</th><th>神</th><th>将</th><th>極</th>";
	rslt_str += "</tr>";

	rslt_str += print_lest_comp('真', '#0095d9', '#FFFFFF', ma_comp[1], ex_comp[1], music_ver_count[1]);
	rslt_str += print_lest_comp('超', '#00b300', '#FFFFFF', ma_comp[2], ex_comp[2], music_ver_count[2]);
	rslt_str += print_lest_comp('檄', '#00b300', '#FFFFFF', ma_comp[3], ex_comp[3], music_ver_count[3]);
	rslt_str += print_lest_comp('橙', '#fab300', '#000000', ma_comp[4], ex_comp[4], music_ver_count[4]);
	rslt_str += print_lest_comp('暁', '#fab300', '#000000', ma_comp[5], ex_comp[5], music_ver_count[5]);
	rslt_str += print_lest_comp('桃', '#FF83CC', '#000000', ma_comp[6], ex_comp[6], music_ver_count[6]);
	rslt_str += print_lest_comp('櫻', '#FF83CC', '#000000', ma_comp[7], ex_comp[7], music_ver_count[7]);
	rslt_str += print_lest_comp('紫', '#b44c97', '#FFFFFF', ma_comp[8], ex_comp[8], music_ver_count[8]);
	rslt_str += print_lest_comp('菫', '#b44c97', '#FFFFFF', ma_comp[9], ex_comp[9], music_ver_count[9]);
	rslt_str += print_lest_comp('白', '#FFFFFF', '#b44c97', ma_comp[10], ex_comp[10], music_ver_count[10]);
	rslt_str += print_lest_comp('白+', '#FFFFFF', '#b44c97', ma_comp[11], ex_comp[11], music_ver_count[11]);
				    
	rslt_str += "</table>";
	return rslt_str;

}
	
function print_result(ydata)
{
	var rslt_str="";

	rslt_str += "<html>";
	rslt_str += print_result_sub_print_header(m_id + m_rankname +"の舞レート解析結果");
	
	rslt_str += "<body>";
	
	var date_str = get_justnow();
	
	rslt_str += "<p align=right><a href='" + mainet_dom + "home'>maimai.net HOMEに戻る</a></p>";
	rslt_str += print_result_sub_print_title("(動作確認版)");
	
	rslt_str += '<p align=center>動作を見せるためのものです。内部lvデータが最低値なので、解析結果は意味がありません。</p>'
	rslt_str += '<hr>';
	
	rslt_str += "<h2 align=center>" + m_id + m_rankname + "</h2>";
	
	rslt_str += "<h2 align=center>Rating解析結果</h2>";

	rslt_str += "<table class=datatable border=1 align=center>";
	rslt_str += "<tr valign=middle>";
	rslt_str += "<th colspan=3 bgcolor='#000000'>";
	rslt_str += "<font color='#ffffff' class=tweet_info>" + m_id + "</font>";
	rslt_str += (m_rankicon!="")?("<img src='" + m_rankicon + "' height=50>"):"";
	rslt_str += "</th>";
	rslt_str += "</tr>";

	rslt_str += "<tr><th colspan=3 bgcolor='#000000'><font color='#ffffff'>" + date_str + "現在</font></th></tr>";
	
	rslt_str += print_result_rating("現在の<br>Rating", m_rating + "<br>(" + m_max_rating + ")", "maimai.netで確認できるRating", 
					m_rating);
	rslt_str += print_result_rating
		("BEST平均", ydata.best_average.toFixed(2), "上位30曲の平均レート値", ydata.best_average);
	rslt_str += print_result_rating("RECENT<br>50平均※", m_recent_ave.toFixed(2) +'<br>('+ m_r_waku + ')',
			"直近50譜面の上位10譜面平均<br>()内はR枠換算 参考値:" + ydata.r_ref, m_recent_ave);
	rslt_str += print_result_rating("BEST下限", ydata.best_limit.toFixed(2), "30位のレート値", ydata.best_limit);
	rslt_str += print_result_rating("HIST下限", ydata.hist_limit, mra_history + "位のレート値", Number(ydata.hist_limit));
	rslt_str += "<tr><th colspan=3 bgcolor='#000000'><font color='#ffffff'>達成個数</font></th></tr>";
	rslt_str += print_result_rating("15以上", ydata.r_count[0], "単曲レート値15以上の曲数", 15);
	rslt_str += print_result_rating("14.5以上", ydata.r_count[1], "単曲レート値14.5以上の曲数", 14.5);
	rslt_str += print_result_rating("14以上", ydata.r_count[2], "単曲レート値14以上の曲数", 14);
	rslt_str += print_result_rating("13以上", ydata.r_count[3], "単曲レート値13以上の曲数", 13);
	
	rslt_str += "<tr><th colspan=3 bgcolor='#000000'><font color='#ffffff'>予想到達可能Rating</font></th></tr>";

	rslt_str += print_result_rating("予想値", ydata.expect_max.toFixed(2), "下の3つの値の合計", ydata.expect_max);
	rslt_str +=
		print_result_rating("BEST枠", ydata.b_waku + "<br>(" + ydata.b_left + ")",
				    "(上位30曲の合計)/44<br>()は+0.01する為の必要レート", ydata.best_average);
	rslt_str +=
		print_result_rating("RECENT<br>枠", ydata.r_waku + "<br>(" + ((ydata.r_top/100).toFixed(2)) + ")",
				    "レート値1位を10回達成<br>()は1位の単曲レート値", ydata.r_top/100);
	rslt_str +=
		print_result_sub("HISTORY<br>枠", ydata.h_waku + "<br>(" + ydata.h_left + ")",
				 "(上位" + mra_history +"曲の合計)*(4/" + mra_history + ")/44<br>()は+0.01する為の必要レート");
	rslt_str += "</table>";
	rslt_str += "<p align=center>※RECENT平均は予測到達可能には影響しません。<br>あくまで現状の確認。</p>";

	rslt_str += "<p align=center>";
	rslt_str += "<a href='https://sgimera.github.io/mai_RatingAnalyzer/' target=_blank>";
	rslt_str += "＞＞解説は”新・CYCLES FUNの寝言”へ＜＜</a></p>";

	rslt_str += "<h2 align=center>Rank/Complete情報</h2>";

	rslt_str += "<table class=complist border=1 align=center>";
	
	rslt_str += "<tr bgcolor='#000000' align=center valign=middle>";
	rslt_str += "<th colspan=3><font color='#ffffff'>" + m_id + "のRank/Complete情報<br>" + date_str + "現在</font></th>";
	rslt_str += "</tr>";

	rslt_str += "<tr bgcolor='#FFFFFF' align=center valign=middle>";
	rslt_str += "<th>ver.</th>";	
	rslt_str += "<th>段位</th>";	
	rslt_str += "<th>制覇</th>";
	rslt_str += "</tr>";

	rslt_str += print_rank_comp
		('青<br>真', '#0095d9', '#FFFFFF', ranklist[0], ranklist[1], complist[0], complist[1]);
	rslt_str += print_rank_comp
		('緑<br>檄', '#00b300', '#FFFFFF', ranklist[2], ranklist[3], complist[2], complist[3]);
	rslt_str += print_rank_comp
		('橙<br>暁', '#fab300', '#000000', ranklist[4], ranklist[5], complist[4], complist[5]);
	rslt_str += print_rank_comp
		('桃<br>櫻', '#FF83CC', '#000000', ranklist[6], "", complist[6], complist[7]);
	rslt_str += print_rank_comp
		('紫<br>菫', '#b44c97', '#FFFFFF', ranklist[7], "", complist[8], complist[9]);
	rslt_str += print_rank_comp
		('白<br>白+', '#FFFFFF', '#b44c97', ranklist[8], "", complist[10], "");

	rslt_str += "</table>";
	
	rslt_str += "<h2 align=center>Comp plate残り状況</h2>";
	
	rslt_str += print_result_comp_lest(date_str, m_id, m_ma_comp, m_ex_comp);
	
	rslt_str += "</div>";
	
	ranklist=null;
	complist=null;

        rslt_str += "<h2 align=center>全曲レート値データ</h2>";

	rslt_str += print_result_sub_print_datalist(m_datalist, date_str, m_id, m_rankname, ydata.r_top);	/* 全譜面データ出力 */

	rslt_str += "</body>";
	rslt_str += "</html>";
	
	m_datalist=null;
	document.open();
	document.write(rslt_str);
	rslt_str=null;
	document.close();

}

/* ココからメイン */
if(!confirm('これは体験版で、Fucking testing解析結果に意味asdはなsdfewsarいです。\nそれでもよければ続けてください。\nクレームは受け付けません。'))
	return;
	
var top_rate;
get_your_id(mainet_dom + 'playerData/');	// プレイヤーデータの取得・共通処理
current_rank();	// 段位アイコンから段位名称に変更・共通処理

get_pdata(m_ex_list, mainet_dom + 'music/expertGenre/');	// EXPERTデータ取得
get_pdata(m_ma_list, mainet_dom + 'music/masterGenre/');	// MASTERのデータ取得
get_pdata(m_re_list, mainet_dom + 'music/remasterGenre/');	// Re:MASTERのデータ取得
get_trophy_data(clist, mainet_dom + 'collection/trophy/',
	   Array.prototype.concat.apply([],c_rank_trophy_list.concat(c_comp_trophy_list)));	// 称号データ取得
get_nameplate_data(clist, mainet_dom + 'collection/namePlate/',
	   Array.prototype.concat.apply([],c_rank_plate_list.concat(c_comp_plate_list)));	// ネームプレートデータ取得
collection_filter(clist);
get_playdata(mainet_dom + 'playLog/');// プレー履歴取得
analysis_playdata();	// プレー履歴・recent算出

top_rate=data2rating(m_datalist, m_ex_comp, m_ma_comp, m_ex_list, m_ma_list, m_re_list);
analyzing_rating(m_adata, m_datalist, m_rating, m_max_rating, top_rate);	// 全体データ算出・自分

maimai_inner_lv=null;	//データ消去
m_ex_list=null; m_ma_list=null; m_re_list=null;

clist=null;

if(Number(m_adata.best_limit)<=0)
	return -1;
	

print_result(m_adata);	//全譜面リスト表示

})(); void(0);
