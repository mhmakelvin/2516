javascript:
(function()
{

var ex_list=[], ma_list=[], re_list=[], datalist=[], clist=[], ranklist=[], complist=[], addr="", your_id="", your_rating="";
var hashtag = "%e8%88%9e%e3%83%ac%e3%83%bc%e3%83%88%e8%a7%a3%e6%9e%90";	// 舞レート解析
var mra_update_algorithm = "2018.02.24";

var best_ave=0, best_limit=0, hist_limit=0;
var expect_max=0, best_rating=0, top_rate=0, recent_rating=0, hist_rating=0, best_left=0, hist_left=0;
var tweet_rate_str="", 	tweet_best_str="";

function get_nextpage_address(j,html,diff)	//次の楽曲リストページを探す
{
	var nextaddr="";
	var e = $(j).find('a');	// hrefが含まれると思われるものlist
	var e_length=e.length;	// その個数
	for(var i=0; i<e_length; i++)	//楽曲リストページ用ループ
	{
		var url=e[i].getAttribute('href');	// <a>内のリンク先取得
		if(url.indexOf(html + "?d=" + diff) == 0)
		{
			return url;
		}
	}
	for(var i=0; i<e_length; i++)	//楽曲リストページ以外用ループ
	{
		var url=e[i].getAttribute('href');
		if(url.indexOf(html) == 0)
		{
			return url + "&d=" + diff;
		}
	}

	return nextaddr;
}

function get_next_collection_page_address(j,html,diff)	//次の楽曲リストページを探す
{
	var nextaddr="";
	var e = $(j).find('a');	// hrefが含まれると思われるものlist
	var e_length=e.length;	// その個数
	for(var i=0; i<e_length; i++)	//楽曲リストページ用ループ
	{
		var url=e[i].getAttribute('href');	// <a>内のリンク先取得
		if(url.indexOf(html + "?c=" + diff) == 0)
		{
			return url;
		}
	}
	for(var i=0; i<e_length; i++)	//楽曲リストページ以外用ループ
	{
		var url=e[i].getAttribute('href');
		if(url.indexOf(html) == 0)
		{
			return url + "&c=" + diff;
		}
	}

	return nextaddr;
}



	
function get_music_mdata2(achive_list, addr, diff)	//データ取得と次のアドレス
{
	var nextaddr="";

	$.ajax({type:'GET', url:addr, async: false})
		.done(function(data)
		{
			//成功時の処理本体
			var m=$(data).find("#accordion");
			var m_length=m.find("h3").length;
			for(var i=0; i<m_length; i++)
			{
				achive_list.push(
					[m.find("h3")[i].innerText.trim(), 
					 $(m.find('tbody')[i]).find('td')[4].innerText]
					);
			}
			if(diff != 6)
				nextaddr=get_nextpage_address($(data), "music.html", diff+1);
			else
				nextaddr=get_next_collection_page_address($(data), "collection.html", 3);				
		});

	return nextaddr;
}

function get_collection_data(collection_list, addr, number)	//データ取得と次のアドレス
{
	var nextaddr="";
	$.ajax({type:'GET', url:addr, async: false})
		.done(function(data)
		{
			//成功時の処理本体
			var m=Array.prototype.slice.call($(data).find('.on')).map(function(x){ return x.innerText.trim()});
			collection_list = Array.prototype.push.apply(collection_list, m);
			if(number != 4)
				nextaddr=get_next_collection_page_address($(data), "collection.html", number+1);
			else
				nextaddr=get_nextpage_address($(data), "home.html", 0);
	});

	return nextaddr;
}

function true_achive(score, score100per)
{
	if(score == "---" || score100per == 0)
		return 0;
	else
		return Number(score)/score100per;
}
	
function sort_condition(a,b)
{
	var lv_a, lv_b, achi_a, achi_b;
	if(b.music_rate != a.music_rate)
	{
		return b.music_rate - a.music_rate;
	}
	lv_a=a.lv.map(mra_diff2tmp).sort(function(a,b){return b-a;});
	lv_b=b.lv.map(mra_diff2tmp).sort(function(a,b){return b-a;});
	for(var i=0; i<3; i++)
	{
		if(lv_a[i] != lv_b[i])
			return lv_b[i] - lv_a[i];
	}
	achi_a=Math.max.apply(null, a.achive);
	achi_b=Math.max.apply(null, b.achive);
	return achi_b - achi_a;
}	
function data2rating(golliramode)
{
	var mlist_length=ma_list.length, re_length=re_list.length, re_count=0, lvlist_count=0;

	for(var i=0; i<mlist_length; i++)
	{
		//lv表と取得データの名前が一致なら処理を進める
		if(ma_list[i][0] == maimai_inner_lv[lvlist_count].name)
		{
			datalist.push({
				name:ma_list[i][0],
				nick:maimai_inner_lv[lvlist_count].nick,
				achive:[(golliramode == 0)?true_achive(ex_list[i][1], maimai_inner_lv[lvlist_count].score[0]):0,
				true_achive(ma_list[i][1], maimai_inner_lv[lvlist_count].score[1]),
				(re_count >= re_length)?"---":
					(re_list[re_count][0]==ma_list[i][0])?
						true_achive(re_list[re_count++][1], maimai_inner_lv[lvlist_count].score[2]):"---"],
				lv:maimai_inner_lv[lvlist_count].levels,
				rate_values:[0,	0, 0],
				music_rate : 0
			});
			datalist[i].rate_values[0] =
				(golliramode == 0)?mra_arch2rate_100(datalist[i].achive[0], datalist[i].lv[0]):0;
			datalist[i].rate_values[1] = mra_arch2rate_100(datalist[i].achive[1], datalist[i].lv[1]);
			datalist[i].rate_values[2] = mra_arch2rate_100(datalist[i].achive[2], datalist[i].lv[2]);
			datalist[i].music_rate = Math.max.apply(null, datalist[i].rate_values);
			
			lvlist_count++;
		}
		else	// 違う場合は空データを入れて終了。
		{
			datalist.push(
				{name:ma_list[i][0],
				 nick:"",
				achive:[0,0,(re_count >= re_length)?"---":
							(re_list[re_count][0]==ma_list[i][0])?0:"---"],
				lv:["","",""],
				rate_values:[0,	0, 0],
				music_rate : 0
			});
		}
	}
	datalist.sort(sort_condition);
	maimai_inner_lv=[];	//データ消去
	return;
}
	
function collection_filter(collection_list)
{
	var new_clist=[];
	var c_rank_list =[
//		["元皆伝(旧)", "元十段(旧)", "元九段(旧)", "元八段(旧)"],
		["青皆伝", "青十段", "青九段", "青八段"],
//		["緑皆伝(旧)", "緑十段(旧)", "緑九段(旧)", "緑八段(旧)"],
		["緑皆伝", "緑十段", "緑九段", "緑八段"],
//		["橙皆伝(旧)", "橙十段(旧)", "橙九段(旧)", "橙八段(旧)"],
		["橙皆伝", "橙十段", "橙九段", "橙八段"],
		["桃皆伝", "桃十段", "桃九段", "桃八段"],
		["紫皆伝", "紫十段", "紫九段", "紫八段"]
	];

	var c_comp_list=[
		["舞舞", "神", "極", "覇者"], ["真舞舞", "真神", "真将", "真極"],
		["超舞舞", "超神", "超将", "超極"], ["檄舞舞", "檄神", "檄将", "檄極"],
		["橙舞舞", "橙神", "橙将", "橙極"], ["暁舞舞", "暁神", "暁将", "暁極"],
		["桃舞舞", "桃神", "桃将", "桃極"], ["櫻舞舞", "櫻神", "櫻将", "櫻極"],
		["紫舞舞", "紫神", "紫将", "紫極"], ["菫舞舞", "菫神", "菫将", "菫極"]
	];
	var c_length = collection_list.length;
	var cf_length;
	var check=false;
	
	cf_length=c_rank_list.length;
	for(var j=0; j<cf_length; j++)
	{
		for(var k=0; k<4; k++)
		{
			if(collection_list.indexOf(c_rank_list[j][k]) >=0)
			{
				ranklist.push(c_rank_list[j][k]);
				break;
			}
		}
		if(k>=4)
			ranklist.push("");
	}

	cf_length=c_comp_list.length;
	var tmplist=[], tmp_comp="";
	for(var j=0; j<cf_length; j++)
	{
		tmplist=[];
		for(var k=0; k<4; k++)
		{
			tmp_comp=c_comp_list[j][k];
			if(collection_list.indexOf(tmp_comp) >=0)
			{
				switch(tmp_comp.slice(-1))
				{
					case "神" :
						tmplist.push(tmp_comp);
						k=4;
						break;
					case "将" :
						if(tmplist.length != 0) 
							k=4;
						tmplist.push(tmp_comp);
						break;
					case "極" :
						tmplist.push(tmp_comp);
						k=4;
						break;
					default :
						tmplist.push(tmp_comp);
						break;
				}
			}
		}
		if(k>=4)
			(tmplist.length>=2)?(complist.push(tmplist[0].slice(0,2)+tmplist[1].slice(-1))):
			(tmplist.length==1)?(complist.push(tmplist[0])):(complist.push(""));
	}
	
	return;
}
	
function get_ratingrank(rating)
{
	return (rating>=15)?("mai_rainbow"):
	(rating>=14.5)?("mai_gold"):
	(rating>=14)?("mai_silver"):
	(rating>=13)?("mai_copper"):
	(rating>=12)?("mai_violet"):
	(rating>=10)?("mai_red"):
	(rating>=7)?("mai_yellow"):
	(rating>=4)?("mai_green"):
	(rating>=1)?("mai_blue"):("mai_white");
}
	
function print_result_sub(title, value, explain)
{
	var tmp = "";
	tmp += "<tr>";
	tmp += "<th>" + title + "<\/th>";
	tmp += "<td align=center>" + value + "<\/td>"
	tmp += "<td>" + explain + "<\/td>";
	tmp += "<\/tr>";
	
	return tmp;
}

function print_result_rating(title, value, explain)
{
	var tmp = "";
	tmp += "<tr>";
	tmp += "<th>" + title + "<\/th>";
	tmp += "<td align=center class=" + get_ratingrank(value) + ">" + value + "<\/td>"
	tmp += "<td>" + explain + "<\/td>";
	tmp += "<\/tr>";
	
	return tmp;
}
function print_result(golliramode, homeaddr)
{
	var result_str="";
	var rank=ranklist.slice(-1)[0].slice(1,3);

	result_str += "<html>";
	result_str += "<head>";
	result_str += "<title>" + your_id + rank +"の舞レート解析結果 | CYCLES FUNの寝言<\/title>";
	result_str += "<style type='text/css'>";
	result_str += "\ttable { border-collapse: collapse; font-size:0.75em; }";
	result_str += "<\/style>";
    	result_str += "<link rel='stylesheet' media='all' type='text/css' href='https://sgimera.github.io/mai_RatingAnalyzer/css/mai_rating.css?'+Date.now() \/>";
	result_str += "<\/head>";
	
	result_str += "<body>";
	result_str += "<p align=right><a href=\"" + homeaddr + "\">maimai.net HOMEに戻る<\/a><\/p>";
	result_str += "<h2>" + your_id + rank +"のRating情報<\/h2>";
	result_str += "<table border=1 align=\"center\">";
	
	var today = new Date();
	var data_str = today.getFullYear() + "\/" + (today.getMonth()+1) + "\/" + today.getDate() + " ";
	data_str += (("0"+today.getHours()).slice(-2)) + ":" + (("0"+today.getMinutes()).slice(-2)) + ":" + (("0"+today.getSeconds()).slice(-2));
	
	result_str += "<tr>";
	result_str += "<th colspan=3 bgcolor=\"\#000000\"><font color=\"\#ffffff\">基本データ<br>";
	result_str += data_str + "現在<\/font><\/th>";
	result_str += "<\/tr>";
	
	result_str += "<tr>";
	result_str += "<th>現在のRating<\/th>";
	result_str += "<td align=center class=";
	result_str += get_ratingrank(Number(your_rating.slice(0, 5)));
	result_str += ">" + your_rating.replace(/\(/g, '<br>(') + "<\/td>"
	result_str += "<td>maimai.netで確認できるRating<\/td>";
	result_str += "<\/tr>";

	result_str += print_result_rating("BEST平均", best_ave, "上位30曲の平均レート値");
	result_str += print_result_rating("BEST下限", best_limit, "30位のレート値");
	result_str += print_result_sub("HIST下限", hist_limit, mra_history + "位のレート値");

	result_str += "<tr>";
	result_str += "<th colspan=3 bgcolor=\"\#000000\"><font color=\"\#ffffff\">予想到達可能Rating<\/font><\/th>";
	result_str += "<\/tr>";

	result_str += print_result_rating("予想値", expect_max, "BEST枠、RECENT枠、HISTORY枠の合計");
	result_str +=
		print_result_sub("BEST枠", best_rating + "<br>(" + best_left + ")", "(上位30曲の合計)/44<br>()は+0.01する為の必要レート");
	result_str += print_result_sub("RECENT枠", recent_rating, "レート値1位を10回達成");
	result_str +=
		print_result_sub("HISTORY枠", hist_rating + "<br>(" + hist_left + ")",
				 "(上位" + mra_history +"曲の合計)/(" + mra_history + "*44/4)<br>()は+0.01する為の必要レート");
	result_str += "<\/table>";

	result_str += "<table border=1 align=\"center\">";
	result_str += "<tr>";
	result_str += "<th colspan=11 bgcolor=\"\#000000\"><font color=\"\#ffffff\">Rank/Complete情報<\/th>";
	result_str += "<\/tr>";
	result_str += "<tr>";
	result_str += "<th colspan=1 bgcolor=\"\#FFFFFF\"><font color=\"\#000000\">ver.<\/font><\/th>";	
	result_str += "<th colspan=2 bgcolor=\"\#0095d9\"><font color=\"\#ffffff\">maimai<\/font><\/th>";
	result_str += "<th colspan=2 bgcolor=\"\#00b300\"><font color=\"\#ffffff\">GreeN<\/font><\/th>";
	result_str += "<th colspan=2 bgcolor=\"\#fab300\"><font color=\"\#ffffff\">ORANGE<\/font><\/th>";
	result_str += "<th colspan=2 bgcolor=\"\#FF83CC\"><font color=\"\#000000\">PiNK<\/font><\/th>";
	result_str += "<th colspan=2 bgcolor=\"\#b44c97\"><font color=\"\#ffffff\">MURASAKi<\/font><\/th>";	
	result_str += "<\/tr>";
	result_str += "<tr>";
	result_str += "<th colspan=1 bgcolor=\"\#ffffff\"><font color=\"\#000000\">段位<\/font><\/th>";	
	result_str += "<td colspan=2 align=center bgcolor=\"\#0095d9\"><font color=\"\#ffffff\">" + ranklist[0] + "<\/font><\/th>";
	result_str += "<td colspan=2 align=center bgcolor=\"\#00b300\"><font color=\"\#ffffff\">" + ranklist[1] + "<\/font><\/th>";
	result_str += "<td colspan=2 align=center bgcolor=\"\#fab300\"><font color=\"\#ffffff\">" + ranklist[2] + "<\/font><\/th>";
	result_str += "<td colspan=2 align=center bgcolor=\"\#FF83CC\"><font color=\"\#000000\">" + ranklist[3] + "<\/font><\/th>";
	result_str += "<td colspan=2 align=center bgcolor=\"\#b44c97\"><font color=\"\#ffffff\">" + ranklist[4] + "<\/font><\/th>";
	result_str += "<\/tr>";
	result_str += "<tr>";
	result_str += "<th bgcolor=\"\#ffffff\"><font color=\"\#000000\">制覇<\/font><\/th>";	
	result_str += "<td align=center bgcolor=\"\#0095d9\"><font color=\"\#ffffff\">" + complist[0] + "<\/font><\/th>";
	result_str += "<td align=center bgcolor=\"\#0095d9\"><font color=\"\#ffffff\">" + complist[1] + "<\/font><\/th>";
	result_str += "<td align=center bgcolor=\"\#00b300\"><font color=\"\#ffffff\">" + complist[2] + "<\/font><\/th>";
	result_str += "<td align=center bgcolor=\"\#00b300\"><font color=\"\#ffffff\">" + complist[3] + "<\/font><\/th>";
	result_str += "<td align=center bgcolor=\"\#fab300\"><font color=\"\#ffffff\">" + complist[4] + "<\/font><\/th>";
	result_str += "<td align=center bgcolor=\"\#fab300\"><font color=\"\#ffffff\">" + complist[5] + "<\/font><\/th>";
	result_str += "<td align=center bgcolor=\"\#FF83CC\"><font color=\"\#000000\">" + complist[6] + "<\/font><\/th>";
	result_str += "<td align=center bgcolor=\"\#FF83CC\"><font color=\"\#000000\">" + complist[7] + "<\/font><\/th>";
	result_str += "<td align=center bgcolor=\"\#b44c97\"><font color=\"\#ffffff\">" + complist[8] + "<\/font><\/th>";
	result_str += "<td align=center bgcolor=\"\#b44c97\"><font color=\"\#ffffff\">" + complist[9] + "<\/font><\/th>";
	result_str += "<\/tr>";
	
	result_str += "<\/table>";

	result_str += "<p align=center>";
	result_str += "<a href=\"https:\/\/twitter.com\/intent\/tweet\?hashtags=";
	result_str += hashtag;
	result_str += "\&text=";
	result_str += tweet_rate_str + "\" ";
	result_str += "target=\"_blank\">＞＞Rating情報のツイートはここをクリック＜＜<\/a><\/p>";

	result_str += "<p align=center>";
	result_str += "<a href=\"https:\/\/sgimera.github.io\/mai_RatingAnalyzer\" target=\"_blank\">";
	result_str += "＞＞解説は新・CYCLES FUNの寝言 siteへ＜＜<\/a><\/p>";

	result_str += "<h2>" + your_id + "の全譜面レート値データ<\/h2>";
	result_str += "<p>寝言サイトにも書いてますが、<b>ただの飾り<\/b>です。参考情報。<\/p>";

	if(hashtag.slice(-4)=="test")
	{
	result_str += "<p align=center>";
	result_str += "<a href=\"https:\/\/twitter.com\/intent\/tweet\?hashtags=";
	result_str += hashtag;
	result_str += "\&text=";
	result_str += tweet_best_str + "\" ";
	result_str += "target=\"_blank\">＞＞TOP10のツイートはここをクリック＜＜<\/a><\/p>";
	}
	
	result_str += "<h3>内部Lv.＆レート値について<\/h3>";
	result_str += "<p>Master、Re:Master<\/p><ul>"
	result_str += "<li>カッコありは<font color=red><b>牛乳ver.では未検証譜面<\/b><\/font>なので、<br>一旦、紫+ver.の値を設定してます。<\/p><\/li>";
	result_str += "<li>カッコなしは牛乳ver.で調査済みです。<br>Lv.11+以下については調査値で示してます。<\/li><\/ul>";
	result_str += "<p>Expert<\/p><ul>"
	result_str += "<li>カッコありは紫+ver.で調査済みで<font color=red><b>牛乳ver.では未検証<\/b><\/font>な譜面です。<\/p><\/li>";
	result_str += "<li>カッコなしは小数第1位まであれば牛乳ver.で調査済みです。<br>無い物は未調査です。<\/li><\/ul>";
	result_str += "<h3>単曲レート値について<\/h3>";
	result_str += "<p>内部Lv.として表示している値で算出した値です。<\/p>";
	result_str += "12, 12+, 13となっているものは、それぞれの最低値で算出してます。<\/p>";
	
	
	
	result_str += "<table border=1 align=\"center\">";

	for(var i=0; i<datalist.length; i++)
	{
		var rowspan_num = 3-golliramode - ((datalist[i].lv[2] != "")?0:1);
		var tmp_rate=0;
		var tmplv;
		
		result_str += "<tr>";
		result_str += "<th colspan=5>" + datalist[i].name + "<\/th>"
		result_str += "<\/tr>"
	
		result_str += "<tr>";
		result_str += "<td align=\"center\" rowspan=" + rowspan_num + ">" + (i+1) + "<\/td>";
		result_str += "<th rowspan=" + rowspan_num + " ";
		result_str += "class=" + get_ratingrank(datalist[i].music_rate/100) + ">"
		result_str += (datalist[i].music_rate/100).toFixed(2)  + "<\/th>"
		
		if(datalist[i].lv[2] != "")
		{
			result_str += "<th class=mai_remaster>";
			result_str += (datalist[i].rate_values[2]/100).toFixed(2);
			result_str += "<\/th>";
	
			tmplv=(datalist[i].lv[2].slice(-1)=='-')?(datalist[i].lv[2].slice(0, -1)):
				(datalist[i].lv[2].slice(-1)=='=')?(datalist[i].lv[2].slice(0, -1)):datalist[i].lv[2];
			result_str += "<th class=mai_remaster>" + tmplv + "<\/th>";
			result_str += "<th class=mai_remaster>" + (100*datalist[i].achive[2]).toFixed(4) + "%<\/th>";
			result_str += "<\/tr>";
			
			result_str += "<tr>";
		}
		
		result_str += "<th class=mai_master>";
			result_str += (datalist[i].rate_values[1]/100).toFixed(2);
		result_str += "<\/th>";

		tmplv=(datalist[i].lv[1].slice(-1)=='-')?(datalist[i].lv[1].slice(0, -1)):
			(datalist[i].lv[1].slice(-1)=='=')?(datalist[i].lv[1].slice(0, -1)):datalist[i].lv[1];
		
		result_str += "<th class=mai_master>" + tmplv + "<\/th>";
		result_str += "<th class=mai_master>" + (100*datalist[i].achive[1]).toFixed(4) + "%<\/th>";
		result_str += "<\/tr>";

		if(golliramode == 0)
		{
			result_str += "<tr>";
			result_str += "<th class=mai_expert>";
			result_str += (datalist[i].rate_values[0]/100).toFixed(2);
			result_str += "<\/th>";

			tmplv=(datalist[i].lv[0].slice(-1)=='-')?(datalist[i].lv[0].slice(0, -1)):datalist[i].lv[0];
			result_str += "<th class=mai_expert>" + tmplv + "<\/th>";
			result_str += "<th class=mai_expert>" + (100*datalist[i].achive[0]).toFixed(4) + "%<\/th>";
			result_str += "<\/tr>";
		}
	}
	
	result_str += "<\/table>";
	result_str += "<\/body>";
	result_str += "<\/html>";
	
	document.open();
	document.write(result_str);
	document.close();
}

function get_your_id(addr)
{
	$.ajax({type:'GET', url:addr, async: false})
		.done(function(data)
		{
			//成功時の処理本体
			var m=$(data).find('.status_data')[0];
			your_id = m.children[1].innerText;
			your_rating = m.children[7].innerText.trim().replace(/MAX /g, "");
		});
	return your_id;
}
	
function tweet_best(id)
{
	tweet_best_str = your_id + (ranklist.slice(-1)[0].slice(1,3)) + "%20:" + your_rating + "%0D%0A";
	tweet_best_str += "B%3a" + best_rating + "%20%2B%20R%3a";
	tweet_best_str += recent_rating + " %2B%20H%3a"
	tweet_best_str += hist_rating + "%20%3d%20" + expect_max + "%0D%0A%0D%0A";
	
	for(var i=0; i<10; i++)
	{
		tmp_rate = datalist[i].music_rate;
		tweet_best_str += (tmp_rate/100).toFixed(2) + ": "
		if(datalist[i].nick != "")
		{
			tweet_best_str += datalist[i].nick;
		}
		else if(datalist[i].name.length < 15)
		{
			tweet_best_str += datalist[i].name;
		}
		else
		{
			tweet_best_str += datalist[i].name.slice(0, 14) + "%ef%bd%9e";
		}
		(datalist[i].rate_values[1] == tmp_rate)?(tweet_best_str+=""):
		(datalist[i].rate_values[2] == tmp_rate)?(tweet_best_str+=" 白"):(tweet_best_str+= " 赤");
		tweet_best_str +="%0D%0A";
	}

}

function lv2tmp(lv)
{
	var olddata = ((lv.slice(0,1))=="(");
	var tmplv = olddata?lv.slice(1,-1):lv;
	if(isNaN(tmplv))
	{
		var i_part = Number(tmplv.slice(0,-1));
		var d_part = (mra_diff2tmp(tmplv)-i_part).toFixed(1);
		switch(i_part)
		{
			case 13:
				tmplv = i_part + "-"; break;
			case 12:
				tmplv = i_part;
				tmplv += (Number(d_part)>=0.7)?("+"):Number(d_part)>=0.3?("="):("-");
				break;
			default:
				break;
		}
	}
	
	return (olddata)?('('+tmplv+')'):tmplv;
}
	
function datalist_recalc()
{
	var listlength=datalist.length, tmplv="", count=0;
	
	for(var i=0; i<listlength; i++)
	{
		tmplv=datalist[i].lv[2];
		if( (tmplv != "") && isNaN(tmplv) && (tmplv.slice(0,1)!="("))
		{
			// re:masterあり
			datalist[i].lv[2]= lv2tmp(tmplv);
			datalist[i].rate_values[2] = mra_arch2rate_100(datalist[i].achive[2], datalist[i].lv[2]);
		}

		tmplv=datalist[i].lv[1];
		if( isNaN(tmplv) && (tmplv.slice(0,1)!="("))	//条件復活の可能性を考慮
		{
			datalist[i].lv[1]= lv2tmp(tmplv);
			datalist[i].rate_values[1] = mra_arch2rate_100(datalist[i].achive[1], datalist[i].lv[1]);
		}
		
		// 曲別レート値の最大が変化するので再計算。
		datalist[i].music_rate = Math.max.apply(null, datalist[i].rate_values);
	}
	
	datalist.sort(sort_condition);
	return count;

}
	
function analyzing_rating()
{
	var tmp=0, str="", best30=0, history473=0;
	for(var i=0; i<30; i++)
	{
		best30 += datalist[i].music_rate;
	}	
	history473=best30;
	for(var i=30 ;i<mra_history;i++)
	{
		history473 += datalist[i].music_rate;
	}

	best_ave = (Math.floor(best30/30)/100).toFixed(2);
	top_rate = (Math.floor(datalist[0].music_rate)/100).toFixed(2);
	best_limit = (Math.floor(datalist[29].music_rate)/100).toFixed(2);
	hist_limit = (Math.floor(datalist[mra_history-1].music_rate)/100).toFixed(2);
	if(Number(hist_limit)<=0)
	{
		var count=0;
		for(count=0; datalist[count].music_rate > 0; count++);
		hist_limit= (mra_history-count) + "曲不足";
	}
	
	best_rating = Math.floor(best30/44);	//best30はすでにRating*100
	recent_rating = Math.floor(datalist[0].music_rate*10/44);
	hist_rating = Math.floor(history473/(mra_history*11));	// multiply 4/(473*44)
	
	best_left = (44 - Math.ceil(best30%44))/100;
	hist_left = (mra_history*11 - Math.ceil(history473%(mra_history*11)))/100;

	expect_max = (Math.floor(best_rating + recent_rating + hist_rating)/100).toFixed(2);
	best_rating = (best_rating/100).toFixed(2);
	recent_rating = (recent_rating/100).toFixed(2);
	hist_rating = (hist_rating/100).toFixed(2);

	// tweet用文字列
	tweet_rate_str = your_id + (ranklist.slice(-1)[0].slice(1,3)) + "%20:" + your_rating + "%0D%0A";
	tweet_rate_str += "BEST平均%3a" + best_ave + "%0D%0A";
	tweet_rate_str += "BEST下限%3a" + best_limit + "%0D%0A";
	tweet_rate_str += "HIST下限%3a" + hist_limit + "%0D%0A";
	tweet_rate_str += "予想到達Rating%3a" + expect_max + "%0D%0A";
	tweet_rate_str += "B%3a" + best_rating + "%20%2B%20R%3a" + recent_rating + "%20%2B%20H%3a" + hist_rating + "%0D%0A";
}

var tmpstr = "--舞レート解析 (trial)--\n\n";
tmpstr += maimai_inner_lv.length + "songs(" + mra_update_mlist + ") version\n";
tmpstr += "Last Update : ";
tmpstr += (mra_update_algorithm >= mra_update_llist)?mra_update_algorithm:mra_update_llist;
tmpstr += "\n\n";
tmpstr += "Programmed by @sgimera";
if(!confirm(tmpstr))
	return;
	
var gollira = 0;
	
//if(confirm('EXPERTのデータを取得しますか？'))
if(true)
{
	addr=get_nextpage_address($(document), "music.html", 4);	// EXPERTリストのアドレス取得 
	addr=get_music_mdata2(ex_list, addr, 4);	// EXPERTデータ取得&MASTERリストのアドレス取得
}
else
{
	gollira = 1;
	addr=get_nextpage_address($(document), "music.html", 5);	// EXPERTリストのアドレス取得 
}
	addr=get_music_mdata2(ma_list, addr, 5);	// MASTERのデータ取得&Re:MASTERリストのアドレス取得
	addr=get_music_mdata2(re_list, addr, 6);	// Re:MASTERのデータ取得&HOMEのアドレス取得
	addr=get_collection_data(clist, addr, 3);	// 称号データ取得＆ネームプレートアドレス取得
	addr=get_collection_data(clist, addr, 4);	// ネームプレートデータ取得＆Homeアドレス取得
	tmpstr = get_your_id(addr);
	
	collection_filter(clist);
	
	data2rating(gollira);	// データ集計
	
	analyzing_rating();	// 全体データ算出
	
	// 再計算。未検証扱いの譜面は最低値になる。全譜面データ表示用で、到達Ratingの計算への影響はない。
	if(hashtag.slice(-4)!="test")
		datalist_recalc();
	else
		tweet_best();	//tweet用文言生成
	
	print_result(gollira, addr);	//全譜面リスト表示

})(); void(0);
