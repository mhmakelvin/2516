javascript:

function mra_lv2tmp(lv)
{
	return Number(lv.replace(/\(|\)/g, '').replace(/\+/, '.7').replace(/\-/, '.0').replace(/\=/, '.3'));
}

function mra_lv2s_100(lv)
{
	var disp_lv=mra_lv2tmp(lv)
	var tmp = Math.round(100*disp_lv), retval=0;
	disp_lv=Math.floor(disp_lv);
	switch(disp_lv)
	{
		case 13:
			retval = tmp+50;
			break;
		case 12:
			retval = tmp*3/2-600;
			break;
    		case 7:
      			retval = tmp/2 + 400;
      			break;
		default:
			retval = tmp;
			break;
	}
	return retval;
}

function mra_lv2s(lv)
{
	return mra_lv2s_100(lv)/100;
}

function mra_lv2ss_100(lv)
{
	var disp_lv=mra_lv2tmp(lv)
	var tmp = Math.round(100*disp_lv), retval=0;
	disp_lv=Math.floor(disp_lv);
	switch(disp_lv)
	{
		case 13:
			retval = tmp+200;
			break;
		case 12:
			retval = tmp*2-1100;
			break;
		case 11:
			retval = tmp+100;
			break;
		case 10:
			retval = 650+tmp/2;
			break;
		case 9:
		case 8:
			retval = 150+tmp;
			break;
		case 7:
		default:
			retval = 550+tmp/2;
			break;
	}
	return retval;
}

function mra_lv2ss(lv)
{
	return mra_lv2ss_100(lv)/100;
}

function mra_lv2aa(lv)
{
	switch(Math.floor(lv))
  	{
    		case 13:
		case 12:
		case 11:
		case 10:
		case 9:
			return lv-2.0;
		case 8:
			return 6.5+(Math.round(lv*10) % 10)*0.05;
		case 7:
			return 6+(Math.round(lv*10) % 10)*0.05;
		default:
			return lv;
	}
}

function mra_lv2aaa(lv)
{
	switch(Math.floor(lv))
	{
		case 13:
		case 12:
		case 11:
		case 10:
		case 9:
			return lv-1.5;
		case 8:
			return 7.25+(Math.round(lv*10) % 10)*0.025;
		case 7:
			return 7+(Math.round(lv*10) % 10)*0.025;
		default:
			return lv;
	}
}

function mra_rate_XtoY(basis, max, gap, n)
{
	return basis+(max-basis)*n/gap
}

function mra_diff2waku(lv)
{
	var waku=0;
	var rate_sss = mra_lv2ss_100(lv)+100;
	waku = Math.floor(rate_sss/4.4);
	waku += Math.floor(waku/10);
	return (waku/100).toFixed(2);
}

function mra_lv2tenSSS(lv, score, score100, b_count)
{
	var rate_value = mra_diff2ss_100(lv)+100;
	var bonus=Math.floor((score-score100)/b_count);
	return Math.floor((rate_value + bonus)/44) + Math.floor((10*rate_value)/44);
}

function mra_achi2rate_100(achi, lv)	//achiは百分率ではなく小数。99%なら0.99
{
	var temp = 0;
	var rate_ss = mra_lv2ss_100(lv);
	var rate_s = mra_lv2s_100(lv);
	var lv100 = Math.round(100*mra_lv2tmp(lv));
	temp = (achi >= 1.00)?(rate_ss+100):
		(achi >= 0.99)?(mra_rate_XtoY(rate_ss,   rate_ss+75, 0.01, achi-0.99)):
		(achi >= 0.97)?(mra_rate_XtoY(rate_s,    rate_ss-25, 0.02, achi-0.97)):
		(lv100<900)?0:	// Lv9未満のS落ちは0とする。暫定。
		(achi >= 0.94)?(mra_rate_XtoY(lv100-150, rate_s-100, 0.03, achi-0.94)):
		(achi >= 0.90)?(mra_rate_XtoY(lv100-200, lv100-150,  0.04, achi-0.90)):
		(achi >= 0.80)?(mra_rate_XtoY(lv100-300, lv100-200,  0.10, achi-0.80)):
		(achi >= 0.60)?(mra_rate_XtoY(lv100*0.4, lv100-300,  0.20, achi-0.60)):
		(achi >= 0.40)?(mra_rate_XtoY(lv100*0.2, lv100*0.4,  0.20, achi-0.40)):
		(achi >= 0.20)?(mra_rate_XtoY(lv100*0.1, lv100*0.2,  0.10, achi-0.20)):
		(achi >= 0.10)?(mra_rate_XtoY(0,         lv100*0.1,  0.10, achi-0.10)):0;
	return Math.floor(temp);
}

function mra_sss_bonus_100(score, scoredata) //scoredata[100%score, breakcount]
{
	if(score <= 0 || scoredata == [0, 0])
		return 0;
	return (score <= scoredata[0])?0:Math.floor((score-scoredata[0])/scoredata[1]);
}

function mra_sss_breakcount(score, scoredata) //scoredata[100%score, breakcount]
{
	if(score <= 0 || scoredata[0] == 0 || scoredata[1] == 0)
		return 0;
	return (score <= scoredata[0])?0:Math.floor((score-scoredata[0])/50)/2;
}

function mra_shortage_achive(tr, il, ca)
{
	if((il=="") || (ca >= 1))
		return "";
	if(tr >= mra_lv2ss_100(il)+100 )
		return "";

	var ah=1, al=Math.floor(ca*10000)/10000;
	while(ah.toFixed(6)!=al.toFixed(6))
	{
		var ta = (ah+al)/2;
		var tempr = mra_achi2rate_100(ta, il);
		(tempr >= tr)?(ah=ta):(al=ta);
	}

	ah=Math.ceil(ah*10000);
	al=Math.floor(ca*10000);
	return ((ah-al)/100) + "%";
}

function array_sum(a)
{
  return a.reduce(function(x, y) { return x + y; });
}

function array_sum_count(array, count)
{
	return array_sum(array.sort(function(a,b){return b - a}).slice(0,count));
}

function score100percent(score, achivement)
{
  return Math.floor(score / achivement * 100 / 500)*500;
}

function score_expected(score100, achivement)
{
  return Math.ceil(score100 * achivement / 100 / 50)*50;
}

function check_border(n)
{
	var tmp = n - Math.floor(n);
	return (tmp<0.03)?"↓":(tmp>=0.97)?"↑":"";
}

// dlist:難易度, bc_list:break個数, lv_list:Lv, achi_list:達成率, r_list:表示rating, outlist:算出rating
function mra_calc_rating(dlist, bc_list, lv_list, score_list, achi_list, r_list, outlist, score100_list)
{
	var recent_list = []; // 確定分置き場。
	var crnt_diff="", current_lv="", rate_value=0, score100=0, true_achi=0, bonus=0, break_count=0, max_rate=0, out_rate=0;

	for(var i = 0; i<score_list.length; ++i)
	{
		if(dlist[i] != "")
		{
			if(crnt_diff!="")
				score100_list.push({diff:crnt_diff, score:score100, break_c:break_count});
			
			// 新しいLv設定。これを基準にレート値算出
			if(!(Number(lv_list[i])>=7)){ outlist.push("内部Lv<br>error"); return ""; }
			if(!(Number(bc_list[i])>0)){ outlist.push("BREAK個数<br>error"); return "";}

			crnt_diff=dlist[i];
			break_count = bc_list[i];
			current_lv=lv_list[i];
			score100=0;	//難易度変更なので100%scoreも初期化
		}
		
		if(score_list[i] == "" && achi_list[i] == "" && r_list[i] =="") break;
		
		if(!(Number(score_list[i])>0)){ outlist.push("SCORE<br>error"); return "";}
		if(!(Number(achi_list[i])>0)){ outlist.push("達成率<br>error"); return "";}
		if(!(Number(current_lv)>=9) && !(Number(achi_list[i])>=97)){ outlist.push("達成率<br>error"); return "";}
		if(!(Number(r_list[i])>0)){ outlist.push("Rating<br>error"); return "";}

		score100=Math.max(score100, score100percent(score_list[i], achi_list[i]) );
		true_achi= score_list[i] / score100;

		if(true_achi < 0)
      			continue;
      
    		// 単曲レート計算
    		rate_value = mra_achi2rate_100(true_achi, current_lv);
		if(true_achi > 1) { bonus=(score_list[i]-score100)/break_count; }
		else { bonus=0; }
		
		max_rate = Math.max(max_rate, rate_value+bonus);	// Best最大値更新
		recent_list.push(rate_value);

		var b_waku = max_rate/44;
		var r_waku = array_sum_count(recent_list, 10)/44; 
		out_rate = (Math.floor(b_waku) + Math.floor(r_waku))/100;
		out_rate = out_rate.toFixed(2) + check_border(r_waku);
		
		outlist.push(out_rate);
		console.log([i+1, true_achi, out_rate, b_waku, r_waku, rate_value, bonus]);
	}
	score100_list.push({diff:crnt_diff, score:score100, break_c:break_count});
 
  return;
}
