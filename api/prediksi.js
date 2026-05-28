export default async function handler(req, res) {
  try {
    // coba langsung dulu
    let r = await fetch('https://didihub.com/api/webapi/GetNoAverageEmerdList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'https://didihub.com',
        'Referer': 'https://didihub.com/wingo',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36'
      },
      body: JSON.stringify({ pageSize: 50, pageNo: 1, typeId: 1, language: 0, random: Date.now() })
    });

    // kalau diblokir, pakai proxy gratis
    if (!r.ok) {
      r = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://didihub.com/api/webapi/GetNoAverageEmerdList'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSize: 50, pageNo: 1, typeId: 1, language: 0 })
      });
    }

    const j = await r.json();
    const list = j?.data?.list || j?.list || [];

    const history = list.map(it => {
      const num = Number(it.number);
      const color = num === 0 || num === 5? 'violet' : ([1,3,7,9].includes(num)? 'green' : 'red');
      const size = num >= 5? 'Big' : 'Small';
      return { period: it.issueNumber, number: num, color, size };
    });

    // === PREDIKSI SUPER CEPAT 30 DETIK ===
    const last = history[0];
    const last3 = history.slice(0,3);
    const last10 = history.slice(0,10);

    // deteksi naga
    const naga = last3.every(h => h.color === last3[0].color);
    // deteksi zigzag
    const zigzag = last3[0].color!== last3[1].color && last3[1].color!== last3[2].color;
    // deteksi kembar
    const kembar = last3[0].number === last3[1].number;

    let predColor = naga? (last.color === 'red'? 'green' : 'red') : last.color;
    let predSize = last.size === 'Big'? 'Small' : 'Big';
    let predNumber = (last.number + (kembar? 2 : 1)) % 10;

    // aturan Didihub
    if (predNumber === 0 || predNumber === 5) predColor = 'violet';
    else predColor = [1,3,7,9].includes(predNumber)? 'green' : 'red';

    predSize = predNumber >= 5? 'Big' : 'Small';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      source: 'didihub-real',
      updated: new Date().toISOString(),
      history,
      prediksi: {
        period: String(Number(last.period) + 1),
        number: predNumber,
        color: predColor,
        size: predSize,
        analisa: naga? `NAGA ${last.color} 3x` : zigzag? 'ZIGZAG' : kembar? 'KEMBAR' : 'NORMAL'
      }
    });

  } catch (e) {
    res.status(200).json({ error: e.message, history: [], prediksi: null });
  }
}
