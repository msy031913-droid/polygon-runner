const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "leaderboard.json");
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));
function readBoard(){try{return JSON.parse(fs.readFileSync(DB_FILE,"utf8"))}catch{return []}}
function writeBoard(rows){fs.mkdirSync(DATA_DIR,{recursive:true});fs.writeFileSync(DB_FILE,JSON.stringify(rows,null,2))}
app.get("/api/health",(req,res)=>res.json({ok:true,service:"polygon-runner"}));
app.get("/api/leaderboard",(req,res)=>res.json(readBoard().sort((a,b)=>b.laps-a.laps).slice(0,10)));
app.post("/api/score",(req,res)=>{
  const name=String(req.body?.name||"익명").trim().replace(/[<>]/g,"").slice(0,12)||"익명";
  const laps=Math.max(0,Math.min(10000000,Math.floor(Number(req.body?.laps)||0)));
  if(!Number.isFinite(laps)) return res.status(400).json({error:"invalid laps"});
  const rows=readBoard(); const old=rows.find(x=>x.name===name);
  if(old) old.laps=Math.max(old.laps,laps); else rows.push({name,laps});
  const result=rows.sort((a,b)=>b.laps-a.laps).slice(0,100);writeBoard(result);
  res.json({ok:true});
});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,()=>console.log(`Polygon Runner listening on ${PORT}`));
