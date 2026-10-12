(function () {
  function options(answer, gap) { return [answer, answer + gap, answer - gap, answer + gap * 2].sort(function(){ return Math.random() - 0.5; }); }
  function make(id, sequence, answer, explain, topic) { const choices = options(answer, Math.max(2, Math.ceil(Math.abs(answer) * 0.12))); return {id:id,topic:topic,prompt:"Choose the number that completes the sequence.",sequence:sequence.concat("?"),choices:choices,answer:choices.indexOf(answer),explain:explain}; }
  const easy = Array.from({length:15}, function(_,i){ const start=i+2, step=i%7+2, seq=Array.from({length:4},(_,n)=>start+step*n); return make("e"+i,seq,start+step*4,"Each term increases by the same amount: +"+step+".","Constant difference"); });
  const medium = Array.from({length:15}, function(_,i){ const start=i+2, gap=i%5+2, seq=[start]; for(let n=0;n<3;n++) seq.push(seq[seq.length-1]+gap*(n+1)); return make("m"+i,seq,seq[3]+gap*4,"The gaps grow by "+gap+" each time: +"+gap+", +"+(gap*2)+", +"+(gap*3)+", then +"+(gap*4)+".","Growing differences"); });
  const hard = Array.from({length:15}, function(_,i){ const a=i%6+2,b=i%5+3,seq=[a,b]; while(seq.length<5) seq.push(seq[seq.length-1]+seq[seq.length-2]); const answer=seq.pop(); return make("h"+i,seq,answer,"Each term is the sum of the two previous terms. Add "+seq[seq.length-1]+" and "+seq[seq.length-2]+".","Recursive sequence"); });
  window.ARCADE_GAME={number:"01",title:"Pattern Sprint",description:"Read the signal, spot the rule, and complete each sequence before the clock runs out.",questions:{easy:easy,medium:medium,hard:hard}};
})();
