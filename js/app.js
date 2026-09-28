    const BILINGUAL = new URLSearchParams(window.location.search).get('lang') !== 'en';
    document.documentElement.lang = BILINGUAL ? 'ur' : 'en';
    const schools = window.SCHOOL_DATA;

    const copy = BILINGUAL ? {
      title:'تلنگانہ کے اردو میڈیم ہائی اسکول',
      intro:'ضلع یا زمرہ منتخب کرکے سرکاری فہرست میں شامل اسکولوں کی تفصیل دیکھیے۔ ہر نتیجے میں پہلی سطر اردو اور دوسری سطر انگریزی میں ہے۔',
      districtHeading:'اضلاع کے لحاظ سے اسکول', districtHint:'کم از کم ایک اور زیادہ سے زیادہ تین اضلاع منتخب کیجیے۔',
      districtLabel:'اضلاع منتخب کریں', filter:'فلٹر', clear:'انتخاب ختم کریں', selected:n=>`منتخب اضلاع: ${n}/3`,
      comparisonHeading:'زمرہ جاتی موازنہ', comparisonHint:'گورنمنٹ، ضلع پریشد یا گرلز اسکول منتخب کیجیے۔',
      comparisonLabel:'زمرہ منتخب کریں', compare:'موازنہ', empty:'نتائج دیکھنے کے لیے ضلع یا زمرہ منتخب کیجیے۔',
      chooseDistrict:'کم از کم ایک ضلع منتخب کرنا ضروری ہے۔', tooMany:'زیادہ سے زیادہ تین اضلاع منتخب کیے جا سکتے ہیں۔',
      districtResult:(n,d)=>`${d} منتخب اضلاع میں ${n} اسکول دکھائے جا رہے ہیں۔`,
      comparisonResult:(n,t)=>`${t}: ${n} اسکول دکھائے جا رہے ہیں۔`
    } : {
      title:'Telangana Urdu Medium High Schools',
      intro:'Select districts or a comparison category to view schools from the official directory on this page.',
      districtHeading:'Schools by District', districtHint:'Select at least one and no more than three districts.',
      districtLabel:'Select districts', filter:'Filter', clear:'Clear Selection', selected:n=>`Selected: ${n}/3`,
      comparisonHeading:'Comparison', comparisonHint:'Select Government, Zilla Parishad or Girls Schools.',
      comparisonLabel:'Select category', compare:'Compare', empty:'Select a district or comparison category to display results.',
      chooseDistrict:'Please select at least one district.', tooMany:'You can select a maximum of three districts.',
      districtResult:(n,d)=>`Showing ${n} schools from ${d} selected district${d===1?'':'s'}.`,
      comparisonResult:(n,t)=>`Showing ${n} ${t}.`
    };

    const el = id => document.getElementById(id);
    el('pageTitle').textContent=copy.title; el('pageIntro').textContent=copy.intro;
    el('districtHeading').textContent=copy.districtHeading; el('districtHint').textContent=copy.districtHint;
    el('districtLabel').textContent=copy.districtLabel; el('filterButton').textContent=copy.filter;
    el('clearButton').textContent=copy.clear; el('comparisonHeading').textContent=copy.comparisonHeading;
    el('comparisonHint').textContent=copy.comparisonHint; el('comparisonLabel').textContent=copy.comparisonLabel;
    el('compareButton').textContent=copy.compare; el('emptyState').textContent=copy.empty;
    const comparisonOptions=el('comparisonSelect').options;
    comparisonOptions[0].textContent=BILINGUAL?'گورنمنٹ — Govt':'Govt';
    comparisonOptions[1].textContent=BILINGUAL?'ضلع پریشد — ZP':'ZP';
    comparisonOptions[2].textContent=BILINGUAL?'گرلز اسکول — Girls-school':'Girls-school';

    const districtSelect=el('districtSelect');
    const districts=[...new Map(schools.map(s=>[s.district_key,{key:s.district_key,en:s.district_en,ur:s.district_ur}])).values()]
      .sort((a,b)=>a.en.localeCompare(b.en));
    districts.forEach(d=>{
      const option=document.createElement('option'); option.value=d.key;
      option.textContent=BILINGUAL?`${d.ur} — ${d.en}`:d.en; districtSelect.appendChild(option);
    });

    const selectedDistricts=()=>[...districtSelect.selectedOptions].map(o=>o.value);
    const updateCount=()=>el('selectionCount').textContent=copy.selected(selectedDistricts().length);
    updateCount();

    districtSelect.addEventListener('mousedown',e=>{
      if(e.target.tagName!=='OPTION') return;
      e.preventDefault();
      const option=e.target;
      if(!option.selected && selectedDistricts().length>=3){setMessage(copy.tooMany,true);return;}
      option.selected=!option.selected; updateCount(); setMessage('',false);
    });
    districtSelect.addEventListener('change',()=>{
      const selected=[...districtSelect.selectedOptions];
      if(selected.length>3){selected[selected.length-1].selected=false;setMessage(copy.tooMany,true);}
      updateCount();
    });

    el('clearButton').addEventListener('click',()=>{
      [...districtSelect.options].forEach(o=>o.selected=false); updateCount(); setMessage('',false);
      el('resultBox').innerHTML=`<div class="empty">${escapeHtml(copy.empty)}</div>`;
    });
    el('filterButton').addEventListener('click',renderDistricts);
    el('compareButton').addEventListener('click',renderComparison);

    function setMessage(text,error){const m=el('message');m.textContent=text;m.className='message'+(error?' error':'');}
    function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
    function yesNo(s,ur=false){return ur?(s.girls?'ہاں':'نہیں'):(s.girls?'Yes':'No');}
    function titleForComparison(type){
      if(BILINGUAL) return type==='GOVT'?'گورنمنٹ اسکول — Government Schools':type==='ZP'?'ضلع پریشد اسکول — Zilla Parishad Schools':'گرلز اسکول — Girls Schools';
      return type==='GOVT'?'Government Schools':type==='ZP'?'Zilla Parishad Schools':'Girls Schools';
    }

    function renderDistricts(){
      const selected=selectedDistricts();
      if(!selected.length){setMessage(copy.chooseDistrict,true);return;}
      if(selected.length>3){setMessage(copy.tooMany,true);return;}
      const groups=selected.map(key=>({key,items:schools.filter(s=>s.district_key===key)}));
      const count=groups.reduce((n,g)=>n+g.items.length,0);
      setMessage(copy.districtResult(count,selected.length),false);
      const columns=['school','address','pincode','mandal','management','girls'];
      let body=''; let serial=1;
      groups.forEach((group,idx)=>{
        const first=group.items[0];
        const groupTitle=BILINGUAL?`${first.district_ur} — ${first.district_en}`:first.district_en;
        body+=`<tr class="group-row ${idx===0?'first':''}"><th colspan="${columns.length+1}">${escapeHtml(groupTitle)}</th></tr>`;
        group.items.forEach(s=>{body+=recordRows(s,serial++,columns);});
      });
      drawTable(columns,body);
    }

    function renderComparison(){
      const type=el('comparisonSelect').value;
      const items=schools.filter(s=>type==='GIRLS'?s.girls:s.management===type);
      const columns=['school','address','pincode','district','mandal'];
      if(type==='GIRLS') columns.push('management'); else columns.push('girls');
      const title=titleForComparison(type);
      setMessage(copy.comparisonResult(items.length,title),false);
      let body=`<tr class="group-row first"><th colspan="${columns.length+1}">${escapeHtml(title)}</th></tr>`;
      items.forEach((s,i)=>{body+=recordRows(s,i+1,columns);});
      drawTable(columns,body);
    }

    const headers={
      school:['School name','اسکول کا نام'],address:['Address','پتا'],pincode:['Pincode','پن کوڈ'],
      district:['District','ضلع'],mandal:['Mandal name','منڈل'],management:['Management','انتظامیہ'],girls:['Girls','گرلز']
    };
    function drawTable(columns,body){
      const head=['<th>S.No.</th>',...columns.map(c=>BILINGUAL?`<th><span class="head-ur">${headers[c][1]}</span><span class="head-en">${headers[c][0]}</span></th>`:`<th>${headers[c][0]}</th>`)].join('');
      el('resultBox').innerHTML=`<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
      el('resultBox').scrollTo({top:0,left:0,behavior:'smooth'});
    }
    function value(s,col,ur){
      if(col==='school') return ur?s.school_ur:s.school_en;
      if(col==='address') return ur?s.address_ur:s.address_en;
      if(col==='pincode') return s.pincode;
      if(col==='district') return ur?s.district_ur:s.district_en;
      if(col==='mandal') return ur?s.mandal_ur:s.mandal_en;
      if(col==='management') return ur?s.management_ur:s.management_en;
      if(col==='girls') return yesNo(s,ur);
      return '';
    }
    function recordRows(s,serial,columns){
      if(!BILINGUAL){
        return `<tr><td class="sno">${serial}</td>${columns.map(c=>`<td class="${c==='pincode'?'pin':''}">${escapeHtml(value(s,c,false))}</td>`).join('')}</tr>`;
      }
      let ur=`<tr class="urdu-row"><td class="sno" rowspan="2">${serial}</td>`;
      let en='<tr class="english-row">';
      columns.forEach(c=>{
        if(c==='pincode'){ur+=`<td class="pin" rowspan="2">${escapeHtml(s.pincode)}</td>`;}
        else{ur+=`<td class="urdu" dir="rtl">${escapeHtml(value(s,c,true))}</td>`;en+=`<td>${escapeHtml(value(s,c,false))}</td>`;}
      });
      return ur+'</tr>'+en+'</tr>';
    }
