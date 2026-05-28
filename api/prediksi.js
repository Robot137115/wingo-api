export default function handler(req, res) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,'0');
  const d = String(now.getDate()).padStart(2,'0');
  const h = String(now.getHours()).padStart(2,'0');
  const mi = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  const period = `${y}${m}${d}01${h}${mi}${s}`;
  const num = Math.floor(Math.random()*10);
  const color = num < 5 ? "red" : num > 5 ? "green" : "violet";
  const size = num >= 5 ? "Big" : "Small";
  res.setHeader('Access-Control-Allow-Origin','*');
  res.status(200).json({history:[{period,number:num,color,size}]});
}
