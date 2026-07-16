"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  where
} from "firebase/firestore";


export default function TablesPage() {


  const router = useRouter();


  const tables = Array.from(
    {length:70},
    (_,i)=>i+1
  );


  const [tablesState,setTablesState]=useState({});
  const [orders,setOrders]=useState([]);

  const [selectedTable,setSelectedTable]=useState(null);
  const [reservationName,setReservationName]=useState("");



  // AUTH

  useEffect(()=>{

    return onAuthStateChanged(
      auth,
      user=>{

        if(!user){
          router.push("/login");
        }

      }
    );

  },[router]);




  // AKTIVNE PORUDZBINE

  useEffect(()=>{


    const q=query(
      collection(db,"orders"),
      where(
        "status",
        "!=",
        "Servirano"
      )
    );


    return onSnapshot(
      q,
      snap=>{

        setOrders(
          snap.docs.map(d=>({
            id:d.id,
            ...d.data()
          }))
        );

      }
    );


  },[]);





  // STOLOVI

  useEffect(()=>{


    return onSnapshot(
      collection(db,"tables"),
      snap=>{


        const data={};


        snap.forEach(d=>{

          data[d.id]=d.data();

        });


        setTablesState(data);


      }
    );


  },[]);





  // STATISTIKA


  const stats=useMemo(()=>{


    let free=0;
    let busy=0;
    let reserved=0;


    tables.forEach(t=>{


      const hasOrder =
        orders.some(
          o=>Number(o.table)===t
        );


      const hasReservation =
        tablesState[t]?.reservationName;



      if(hasReservation){
        reserved++;
      }
      else if(hasOrder){
        busy++;
      }
      else{
        free++;
      }


    });



    return {
      free,
      busy,
      reserved
    };


  },[
    orders,
    tablesState
  ]);







  const saveReservation=async()=>{


    if(!selectedTable)
      return;



    await setDoc(

      doc(
        db,
        "tables",
        String(selectedTable)
      ),

      {
        reservationName,
        occupied:true
      },

      {
        merge:true
      }

    );


    // AUTOMATSKI ZATVARA MENI

    setSelectedTable(null);


  };





  const clearReservation=async()=>{


    if(!selectedTable)
      return;



    await setDoc(

      doc(
        db,
        "tables",
        String(selectedTable)
      ),

      {
        reservationName:"",
        occupied:false
      },

      {
        merge:true
      }

    );


    setReservationName("");

  };







  const openTable=(table)=>{


    setSelectedTable(table);


    setReservationName(
      tablesState[table]?.reservationName || ""
    );


  };







  const selectedOrders =
    orders.filter(
      o=>
      Number(o.table)===Number(selectedTable)
    );






return (

<main className="
min-h-screen
bg-black
text-white
p-4
">



<h1 className="
text-2xl
font-bold
mb-4
">

🪑 Stolovi

</h1>





{/* STATISTIKA */}

<div className="
grid
grid-cols-3
gap-2
mb-5
text-center
">


<div className="
bg-green-600/30
border
border-green-500
rounded
p-3
">

Slobodni

<div className="font-bold text-xl">
{stats.free}
</div>

</div>




<div className="
bg-yellow-500/30
border
border-yellow-500
rounded
p-3
">

Zauzeti

<div className="font-bold text-xl">
{stats.busy}
</div>

</div>




<div className="
bg-blue-600/30
border
border-blue-500
rounded
p-3
">

Rezervisani

<div className="font-bold text-xl">
{stats.reserved}
</div>

</div>


</div>








{/* STOLOVI */}


<div className="
grid
grid-cols-3
sm:grid-cols-5
md:grid-cols-7
gap-3
">


{
tables.map(t=>{


const reserved =
tablesState[t]?.reservationName;


const busy =
orders.some(
o=>Number(o.table)===t
);



return (

<button

key={t}

onClick={()=>openTable(t)}

className={`
h-24
rounded-xl
border
font-bold

${
reserved
?
"bg-blue-600"

:

busy
?
"bg-yellow-500 text-black"

:

"bg-zinc-900"

}

`}

>


<div>
Sto {t}
</div>


{
reserved &&
<div className="
text-xs
truncate
">

👤 {reserved}

</div>

}



</button>


);


})

}



</div>








{/* MODAL */}



{
selectedTable &&


<div className="
fixed
inset-0
bg-black/70
flex
items-center
justify-center
z-50
">


<div className="
bg-zinc-900
rounded-xl
p-5
w-full
max-w-md
max-h-[90vh]
overflow-y-auto
">


<button

onClick={()=>{
setSelectedTable(null)
}}

className="
float-right
text-xl
"

>
✕
</button>



<h2 className="
text-xl
font-bold
mb-4
">

Sto {selectedTable}

</h2>




<input

value={reservationName}

onChange={
e=>setReservationName(e.target.value)
}

placeholder="Ime rezervacije"

className="
w-full
p-3
rounded
bg-black
mb-3
"

/>




<button

onClick={saveReservation}

className="
w-full
bg-blue-500
text-black
p-3
rounded
mb-2
"

>

💾 Sačuvaj rezervaciju

</button>





<button

onClick={clearReservation}

className="
w-full
bg-gray-600
p-3
rounded
mb-5
"

>

🗑 Očisti

</button>






<h3 className="
font-bold
mb-2
">

Porudžbine

</h3>



{
selectedOrders.length===0 ?


<p className="text-gray-400">
Nema porudžbina
</p>


:

selectedOrders.map(order=>(


<div

key={order.id}

className="
bg-black
rounded
p-3
mb-3
"


>


<div className="text-xs mb-2">

Račun #{order.id.slice(0,6)}

</div>



{
order.items?.map(
(item,i)=>(


<div

key={i}

className="
flex
justify-between
"

>

<span>

{item.name}
×
{item.quantity}

</span>


<span>

{
item.price * item.quantity
}
 din

</span>


</div>


)

)

}




<div className="
border-t
border-white/20
mt-2
pt-2
font-bold
flex
justify-between
">

<span>
Ukupno
</span>

<span>
{order.total} din
</span>


</div>


</div>


))


}



</div>


</div>


}



</main>

);


}