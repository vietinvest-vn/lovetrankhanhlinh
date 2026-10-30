const ALBUMS={"anhlinhyeu": ["1792341410169.jpeg", "1792341410173.jpeg", "1792341410177.jpeg", "1792341410180.jpeg", "1792341410184.jpeg", "1792341410188.jpeg", "1792341410192.jpeg", "1792341410195.jpeg", "1792341410199.jpeg", "1792341410204.jpeg", "1792341410208.jpeg", "1792341410212.jpeg", "1792341410216.jpeg", "1792341410220.jpeg", "1792341410224.jpeg", "1792341410230.jpeg", "1792341410234.jpeg", "1792341410241.jpeg", "1792341410245.jpeg", "1792341410249.jpeg", "1792341410256.jpeg", "1792341410270.jpeg", "1792341410282.jpeg", "1792341410296.jpeg", "1792341410310.jpeg", "1792341410315.jpeg", "1792341410325.jpeg", "1792341410328.jpeg", "1792341410332.jpeg", "1792341410341.jpeg", "1792341410345.jpeg", "1792341410349.jpeg", "1792341410354.jpeg", "1792341410359.jpeg", "1792341410363.jpeg", "1792341410368.jpeg", "1792341410380.jpeg", "1792341410386.jpeg", "1792341410392.jpeg", "1792341410395.jpeg", "1792341410399.jpeg", "1792341410406.jpeg", "1792341410410.jpeg", "1792341410414.jpeg", "1792341410421.jpeg", "1792341410425.jpeg", "1792341410433.jpeg", "1792341410438.jpeg", "1792341410442.jpeg", "1792341410446.jpeg", "received_1418377900268155.mp4", "received_2101537870751678.mp4"], "bomevalinhyeu": ["1792341476261.jpeg", "1792341476270.jpeg", "1792341476276.jpeg", "1792341476283.jpeg", "1792341476289.jpeg", "1792341476296.jpeg", "1792341476304.jpeg", "1792341476311.jpeg", "1792341476318.jpeg", "1792341476325.jpeg", "1792341476333.jpeg", "1792341476339.jpeg", "1792341476348.jpeg", "1792341476355.jpeg", "1792341476361.jpeg", "1792341476368.jpeg", "1792341476375.jpeg"]};

let imgs=[];let idx=0;let timer=null;
function flat(){imgs=[];for(const k in ALBUMS) for(const f of ALBUMS[k]) imgs.push(k+'/'+f);}
flat();
const img=document.getElementById('img');
function show(i){idx=(i+imgs.length)%imgs.length;img.src=imgs[idx];document.getElementById('counter').textContent=(idx+1)+' / '+imgs.length;}
document.getElementById('prev').onclick=()=>show(idx-1);
document.getElementById('next').onclick=()=>show(idx+1);
function play(){if(timer)return;timer=setInterval(()=>show(idx+1),4500);}
function stop(){if(timer){clearInterval(timer);timer=null;}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
show(0);play();
