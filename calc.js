javascript:

function mra_diff2tmp(lv)
{
	var lvtable =
		[["7-", 7.0], ["7+", 7.7], ["8-", 8.0], ["8+", 8.7], ["9-", 9.0], ["9+", 9.7],["10-", 10.0], 
 		 ["10+", 10.7], ["11-", 11.0], ["11+", 11.7], ["12-", 12.0], ["12+", 12.7], ["13-", 13.0], ["", 0],
		 ["12.O", 12.0], ["12.I", 12.1], ["12.Z", 12.2], ["12.E", 12.3], ["12.A", 12.4],
      		 ["12.S", 12.5], ["12.b", 12.6], ["12.L", 12.7], ["12.B", 12.8], ["12.q", 12.9],
		 ["13.O", 13.0], ["13.I", 13.1], ["13.Z", 13.2], ["13.E", 13.3], ["13.A", 13.4],
		 ["13.S", 13.5], ["13.b", 13.6], ["13.L", 13.7], ["13.B", 13.8], ["13.q", 13.9]];
	var tmplv=(lv.slice(0,1)=="(")?(lv.slice(1,-1)):lv;
	for(var i=0; i< lvtable.length; i++)
	{
		if(tmplv == lvtable[i][0])
		{
			return lvtable[i][1];
		}
	}
	return Number(tmplv);
}

function mra_diff2s(lv)
{
	var tmp = Math.round(100*mra_diff2tmp(lv)), retval=0;
	switch(Math.floor(tmp/100))
	{
		case 13:
			retval = tmp+50;
			break;
		case 12:
			retval = tmp+(tmp%1200)/2;
			break;
		default:
			retval = tmp;
			break;
	}
	return retval/100;
}

function mra_diff2sss(lv)
{
	var tmp=Math.round(100*mra_diff2tmp(lv)), retval=0;
	switch(Math.floor(tmp/100))
	{
		case 13:
			retval = tmp+300;
			break;
		case 12:
			retval = tmp*2-1000;
			break;
		case 11:
			retval = tmp+200;
			break;
		case 10:
			retval = 750+tmp/2;
			break;
		case 9:
		case 8:
			retval = 250+tmp;
			break;
		case 7:
		default:
			retval = 650+tmp/2;
			break;
	}
	return retval/100;
}

function mra_rate_XtoY(basis, max, gap, n)
{
	return basis+(max-basis)*n/gap
}

function mra_diff2waku(lv)
{
	var waku=0;
	var rate_sss = Math.round(100*mra_diff2sss(lv));
	waku = Math.floor(rate_sss/4.4);
	waku += Math.floor(waku/10);
	return (waku/100).toFixed(2);
}

function mra_arch2rate_100(achi, lv)	//achiは百分率ではなく小数。99%なら0.99
{
	var temp = 0;
	var rate_sss = Math.round(100*mra_diff2sss(lv));
	var rate_s = Math.round(100* mra_diff2s(lv));
	var lv100 = Math.round(100*mra_diff2tmp(lv));
	temp = (achi >= 1.00)?(rate_sss):
		(achi >= 0.99)?(mra_rate_XtoY(rate_sss-100, rate_sss-25,  0.01,  achi-0.99)):
		(achi >= 0.97)?(mra_rate_XtoY(rate_s,       rate_sss-125, 0.02,  achi-0.97)):
		(achi >= 0.94)?(mra_rate_XtoY(lv100-150,    rate_s-100,   0.03,  achi-0.94)):
		(achi >= 0.90)?(mra_rate_XtoY(lv100-200,    lv100-150,    0.04,  achi-0.90)):
		(achi >= 0.80)?(mra_rate_XtoY(lv100-300,    lv100-200,    0.10, achi-0.80)):
		(achi >= 0.60)?(mra_rate_XtoY(lv100*0.4,    lv100-300,    0.20, achi-0.60)):
		(achi >= 0.40)?(mra_rate_XtoY(lv100*0.2,    lv100*0.4,    0.20, achi-0.40)):
		(achi >= 0.20)?(mra_rate_XtoY(lv100*0.1,    lv100*0.2,    0.10, achi-0.20)):
		(achi >= 0.10)?(mra_rate_XtoY(0,            lv100*0.1,    0.10, achi-0.10)):0;
	return Math.floor(temp);
}
