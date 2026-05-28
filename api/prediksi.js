export default async function handler(req, res) {
  try {
    // ambil 50 data asli dari Didihub
    const r = await fetch('https://didihub.com/api/webapi/GetNoAverageEmerdList', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({ pageSize: 50, pageNo: 1, typeId: 1, language: 0, random: Date.now() })
    });
    const j = await r.json();
    const list = j?.data?.list || [];

    const history = list.map(it => {
      const num = Number(it.number);
      const color = num === 0 || num === 5? 'violet' : ([1,3,7,9].includes(num)? 'green' : 'red');
      const size = num >= 5? 'Big' : 'Small';
      return { period: it.issueNumber, number: num, color, size };
    });

    // prediksi dari data asli
    const last10 = history.slice(0,10);
    const last3 = history.slice(0,3);
    const reds = last10.filter(h=>h.color==='red').length;
    const greens = last10.filter(h=>h.color==='green').length;
    const streak = last3.every(h=>h.color===last3[0].color)? last3[0].color : null;

    let predColor = streak? (streak==='red'?'green':'red') : (reds>greens?'green':'red');
    if ([0,5].includes(last3[0].number)) predColor = 'violet';

    let predNumber = (last3[0].number + 3) % 10;
    let predSize = predNumber >=5? 'Big' : 'Small';

    res.setHeader('Access-Control-Allow-Origin','*');
    res.status(200).json({ history, prediksi: {
      period: String(Number(history[0].period)+1),
      number: predNumber,
      color: predColor,
      size: predSize,
      analisa: streak? `Naga ${streak} 3x` : 'Ikut tren asli'
    }});
  } catch(e){
    res.status(500).json({error: e.message});
  }
}
