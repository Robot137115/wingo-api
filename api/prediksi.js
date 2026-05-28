export default function handler(req, res) {
  const now = new Date();
  const ymd = now.toISOString().slice(0,10).replace(/-/g,''); // 20260528
  const basePeriod = Number(ymd + "5750"); // mirip didihub

  let history = [];
  let lastNum = Math.floor(Math.random()*10);
  let naga = 0; // sisa streak

  for (let i = 0; i < 50; i++) {
    let num = lastNum;

    // 30% angka kembar 2-3 periode
    if (i > 0 && Math.random() < 0.3) {
      num = history[history.length-1].number;
    }
    // 10% mulai naga 3-6x
    else if (naga > 0) {
      num = lastNum;
      naga--;
    } else if (Math.random() < 0.12) {
      naga = 3 + Math.floor(Math.random()*4);
      num = lastNum;
    }
    // zigzag / normal
    else {
      // kadang zigzag warna
      if (Math.random() < 0.25 && i>0) {
        num = (lastNum + 5) % 10; // loncat bikin ganti warna
      } else {
        num = (lastNum + Math.floor(Math.random()*4) + 1) % 10;
      }
    }

    lastNum = num;
    let color = (num === 0 || num === 5)? 'violet' : (num % 2 === 0? 'green' : 'red');
    let size = num >= 5? 'Big' : 'Small';

    history.push({
      period: String(basePeriod - (49-i)),
      number: num,
      color: color,
      size: size
    });
  }

  history = history.reverse(); // terbaru di atas

  // === PREDIKSI OTOMATIS DARI 50 DATA ===
  const last10 = history.slice(0,10);
  const last3 = history.slice(0,3);

  // hitung tren warna
  const reds = last10.filter(h=>h.color==='red').length;
  const greens = last10.filter(h=>h.color==='green').length;

  // deteksi naga
  const streakColor = last3.every(h=>h.color===last3[0].color)? last3[0].color : null;
  let predColor = streakColor? (streakColor==='red'?'green':'red') : (reds>greens?'green':'red');
  if (Math.random()<0.15) predColor = 'violet'; // kadang ungu

  // deteksi kembar
  const sameNum = last3[0].number === last3[1].number;
  let predNumber = sameNum? (last3[0].number + 3) % 10 : (last3[0].number + 1) % 10;
  while (last3.some(h=>h.number===predNumber)) predNumber = (predNumber+1)%10;

  // size ikut zigzag
  const sameSize = last3.every(h=>h.size===last3[0].size);
  let predSize = sameSize? (last3[0].size==='Big'?'Small':'Big') : last3[0].size;

  res.setHeader('Access-Control-Allow-Origin','*');
  res.status(200).json({
    history,
    prediksi: {
      period: String(Number(history[0].period)+1),
      number: predNumber,
      color: predColor,
      size: predSize,
      analisa: streakColor? `Naga ${streakColor} ${last3.length}x -> putus` : (sameNum? 'Angka kembar -> ganti' : 'Ikut tren')
    }
  });
}
