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
  
const [success,setSuccess] = useState(false);
  const [open,setOpen] = useState(false);


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