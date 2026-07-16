"use client";

import { use, useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { 
  collection,
  onSnapshot,
  addDoc
} from "firebase/firestore";


export default function TablePage({ params }) {

  const { id: tableId } = use(params);
 const [category,setCategory] = useState("SVE");
  const [menu,setMenu] = useState([]);
  const [cart,setCart] = useState([]);
  const [step, setStep] = useState(0);
  const [intro,setIntro]=useState(true);
const [introStep,setIntroStep]=useState(0);
const [success,setSuccess] = useState(false);
  const [open,setOpen] = useState(false);

  useEffect(() => {

  if (navigator.vibrate) {
    navigator.vibrate(40);
  }

  const timers = [
    setTimeout(() => setStep(1), 500),
    setTimeout(() => setStep(2), 1500),
    setTimeout(() => setStep(3), 2600),
    setTimeout(() => setIntro(false), 4200),
  ];

  return () => timers.forEach(clearTimeout);

}, []);
  
  useEffect(()=>{

const t1=setTimeout(()=>setIntroStep(1),500);

const t2=setTimeout(()=>setIntroStep(2),1700);

const t3=setTimeout(()=>setIntroStep(3),2700);

const t4=setTimeout(()=>{
setIntro(false);
},3700);

return ()=>{

clearTimeout(t1);
clearTimeout(t2);
clearTimeout(t3);
clearTimeout(t4);

};

},[]);
  
  useEffect(()=>{

    const unsub = onSnapshot(
      collection(db,"menu"),
      (snap)=>{

        setMenu(
          snap.docs.map(doc=>({
            id:doc.id,
            ...doc.data()
          }))
        );

      }
    );


    return ()=>unsub();

  },[]);



  function add(item){

    setCart(prev=>{

      const exists = prev.find(
        x=>x.id===item.id
      );


      if(exists){

        return prev.map(x=>
          x.id===item.id
          ?
          {
            ...x,
            quantity:x.quantity+1
          }
          :
          x
        );

      }


      return [
        ...prev,
        {
          ...item,
          quantity:1
        }
      ];

    });

  }


function remove(id){

  setCart(prev => 
    prev
      .map(item => {

        if(item.id === id){

          return {
            ...item,
            quantity: item.quantity - 1
          };

        }

        return item;

      })
      .filter(item => item.quantity > 0)
  );

}



 async function order(){

  if(cart.length===0)
    return;


  try {

    await addDoc(
      collection(db,"orders"),
      {
        table:String(tableId),
        items:cart,
        time:Date.now(),
        status:"Čeka"
      }
    );


    setCart([]);
    setOpen(false);

    setSuccess(true);

    setTimeout(()=>{
      setSuccess(false);
    },2500);


  } catch(error){

    console.log("GRESKA ORDER:", error);

  }

setSuccess(true);

setTimeout(()=>{
  setSuccess(false);
},2500);

  }



  const total =
    cart.reduce(
      (a,b)=>
      a+(b.price*b.quantity),
      0
    );
  
const categories = [
  "SVE",
  ...new Set(
    menu
      .map(item => item.category)
      .filter(Boolean)
  )
];


const filteredMenu =
  category === "SVE"
    ? menu
    : menu.filter(
        item => item.category === category
      );


return (

<main className="min-h-screen bg-black text-white p-4">


{
intro && (

<div className="fixed inset-0 z-[999] overflow-hidden bg-black">

<div className="absolute inset-0 bg-gradient-to-br from-black via-[#14001d] to-black"/>

<div className="absolute -left-40 top-10 w-[450px] h-[450px] rounded-full bg-fuchsia-600/25 blur-[180px] animate-float"/>

<div className="absolute -right-40 bottom-0 w-[450px] h-[450px] rounded-full bg-cyan-500/20 blur-[180px] animate-float2"/>

<div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,black_95%)]"/>

<div className="relative flex h-full flex-col items-center justify-center text-center px-8">

<img
src="/logo.png"
alt=""
className={`
w-64
h-auto
object-contain
transition-all
duration-1000
drop-shadow-[0_0_60px_rgba(192,38,211,.8)]

${introStep>=1
?"opacity-100 scale-100 blur-0"
:"opacity-0 scale-75 blur-xl"}
`}
/>

<h1
className={`
mt-10
text-5xl
font-black
tracking-wide
text-white
transition-all
duration-700

${introStep>=1
?"opacity-100 translate-y-0"
:"opacity-0 translate-y-8"}
`}
>

Dobrodošli u

</h1>

<div
className={`
text-7xl
font-black
bg-gradient-to-r
from-fuchsia-400
via-pink-500
to-cyan-400
text-transparent
bg-clip-text
transition-all
duration-700

${introStep>=1
?"opacity-100 scale-100"
:"opacity-0 scale-90"}
`}
>

SECRET PARTY

</div>

<div
className={`
mt-10
text-xl
text-gray-300
transition-all
duration-700

${introStep>=2
?"opacity-100"
:"opacity-0"}
`}
>

🥂 Sto {tableId} je spreman

</div>

<div
className={`
mt-4
text-gray-500
tracking-[5px]
uppercase
transition-all
duration-500

${introStep>=3
?"opacity-100"
:"opacity-0"}
`}
>

Pripremamo meni...

</div>

</div>

</div>

)
}
  
<div className="flex items-center justify-between mb-6">

<div className="flex items-center gap-3">

<img
src="/logo.png"
className="w-10 h-10"
/>

<h1 className="text-xl font-bold">
Sto {tableId}
</h1>

</div>


<button
onClick={()=>setOpen(true)}
className="
bg-gradient-to-r
from-blue-600
to-purple-600
px-5
py-3
rounded-2xl
font-bold
shadow-lg
"
>
🛒 Korpa ({cart.length})
</button>


</div>

<div className="
flex
gap-2
overflow-x-auto
mb-5
">

{
categories.map(cat=>(

<button

key={cat}

onClick={()=>setCategory(cat)}

className={`
px-4
py-2
rounded-full
whitespace-nowrap
${
category===cat
?
"bg-purple-600"
:
"bg-white/10"
}
`}

>

{cat}

</button>

))
}

</div>

<div className="space-y-3">


{
filteredMenu.map(item=>(

<div
key={item.id}
className="
bg-white/5 
border 
border-white/10
p-4
rounded-2xl
flex
justify-between
items-center
shadow-lg
"
>


<div>

<div className="font-bold">
{item.name}
</div>


<div className="text-yellow-400">
{item.price} din
</div>


</div>



<button

onClick={()=>add(item)}

className="
bg-green-500
text-black
w-12
h-12
rounded-2xl
font-bold
text-xl
active:scale-90
transition
"

>
+
</button>


</div>


))
}


</div>





{
open &&

<div className="
fixed
inset-0
bg-black
z-50
p-5
flex
flex-col
">

<h2 className="text-2xl font-bold mb-5">
🛒 Korpa
</h2>

<div className="
flex-1
overflow-y-auto
pb-5
">

{
cart.map(item => (

<div
key={item.id}
className="
bg-white/5
p-4
rounded-xl
mb-3
"
>

<div className="font-bold">
{item.name}
</div>

<div className="text-gray-400">
x{item.quantity}
</div>


<div className="text-yellow-400 font-bold">
{item.price * item.quantity} din
</div>


<div className="flex gap-3 mt-3">

<button
onClick={()=>remove(item.id)}
className="bg-red-500 px-4 py-2 rounded-xl"
>
−
</button>


<button
onClick={()=>add(item)}
className="bg-green-500 text-black px-4 py-2 rounded-xl"
>
+
</button>

</div>


</div>

))

}

<div className="
border-t
border-white/10
mt-6
pt-5
">

<div className="
text-yellow-400
font-bold
text-xl
mb-4
">
Ukupno: {total} din
</div>


<button
onClick={order}
className="
w-full
bg-blue-600
py-3
rounded-xl
font-bold
"
>
🚀 Poruči
</button>

</div>
<button
onClick={()=>setOpen(false)}
className="mt-5 bg-red-500 px-5 py-3 rounded-xl"
>
Zatvori
</button>

</div> 

</div>

}
{
success && (

<div className="
fixed
inset-0
z-[100]
bg-black/80
flex
items-center
justify-center
">

<div className="
bg-zinc-900
border
border-white/10
p-6
rounded-3xl
text-center
">

<div className="text-5xl mb-4">
✅
</div>


<h2 className="
text-2xl
font-bold
">
Porudžbina primljena
</h2>


<p className="
text-gray-400
mt-2
">
Konobar dolazi uskoro 🍸
</p>


</div>

</div>

)
}
</main>

);

}