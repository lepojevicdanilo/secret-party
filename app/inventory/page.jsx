"use client";

import {useEffect,useState} from "react";

import {
collection,
onSnapshot,
doc,
setDoc,
updateDoc,
getDocs,
deleteDoc,
increment
} from "firebase/firestore";

import {db} from "@/lib/firebase";


export default function Inventory(){


const [items,setItems]=useState([]);

const [search,setSearch]=useState("");

const [modal,setModal]=useState(false);

const [editId,setEditId]=useState(null);



const empty={
name:"",
category:"",
price:"",
quantity:0
};


const [form,setForm]=useState(empty);





// LIVE INVENTORY

useEffect(()=>{


return onSnapshot(

collection(db,"inventory"),

snap=>{


setItems(

snap.docs.map(d=>({

id:d.id,
...d.data()

}))

);


}

);


},[]);






// PREBACI CEO MENI U INVENTORY


const syncMenu=async()=>{


const snap =
await getDocs(
collection(db,"menu")
);



for(const item of snap.docs){


const data=item.data();



await setDoc(

doc(
db,
"inventory",
item.id
),

{

menuId:item.id,

name:data.name,

category:data.category,

price:data.price,

quantity:0

},

{
merge:true
}

);


}


alert("Meni ubačen u inventory");


};








// NOVO


const openNew=()=>{


setEditId(null);

setForm(empty);

setModal(true);


};







// IZMENA


const openEdit=(item)=>{


setEditId(item.id);


setForm({

name:item.name,
category:item.category,
price:item.price,
quantity:item.quantity

});


setModal(true);


};







// SAVE


const save=async()=>{


if(!form.name)
return;



let id=editId;



if(!id){

id=
form.name
.toLowerCase()
.replaceAll(" ","_");

}



await setDoc(

doc(
db,
"inventory",
id
),

{

name:form.name,

category:form.category,

price:Number(form.price),

quantity:Number(form.quantity)

},

{
merge:true
}

);



setModal(false);


};








// BRISANJE


const remove=async(id)=>{


if(!confirm("Obrisati proizvod?"))
return;


await deleteDoc(

doc(
db,
"inventory",
id
)

);


};







// DODAVANJE KOLICINE


const addQuantity=async(id,value)=>{


await updateDoc(

doc(
db,
"inventory",
id
),

{

quantity:
increment(value)

}

);


};









return (

<main className="
bg-black
min-h-screen
text-white
p-5
">



<div className="
flex
justify-between
items-center
mb-5
">


<h1 className="
text-3xl
font-bold
">

📦 Inventory

</h1>



<div className="flex gap-2">


<button

onClick={syncMenu}

className="
bg-purple-600
px-3
py-2
rounded
"

>

🔄 Meni

</button>




<button

onClick={openNew}

className="
bg-green-500
text-black
px-3
py-2
rounded
"

>

➕ Dodaj

</button>


</div>


</div>






<input

placeholder="Pretraga..."

value={search}

onChange={
e=>setSearch(e.target.value)
}

className="
w-full
bg-zinc-900
p-3
rounded
mb-5
"

/>







<div className="
grid
gap-3
">


{

items

.filter(i=>

i.name
?.toLowerCase()
.includes(
search.toLowerCase()
)

)

.map(item=>(


<div

key={item.id}

className="
bg-zinc-900
border
border-white/10
rounded-xl
p-4
"


>


<div className="
flex
justify-between
">


<div>


<h2 className="font-bold text-lg">

{item.name}

</h2>


<p className="text-gray-400">

{item.category}

</p>


<p className="text-yellow-400">

{item.price} din

</p>


</div>



<div className="text-xl">

{item.quantity} kom

</div>


</div>







<div className="
flex
gap-2
mt-4
flex-wrap
">


<button

onClick={()=>addQuantity(item.id,10)}

className="
bg-green-600
px-3
py-2
rounded
"

>
+10
</button>


<button

onClick={()=>addQuantity(item.id,50)}

className="
bg-green-700
px-3
py-2
rounded
"

>
+50
</button>


<button

onClick={()=>addQuantity(item.id,100)}

className="
bg-green-800
px-3
py-2
rounded
"

>
+100
</button>



<button

onClick={()=>openEdit(item)}

className="
bg-blue-500
px-3
py-2
rounded
"

>

✏️

</button>



<button

onClick={()=>remove(item.id)}

className="
bg-red-600
px-3
py-2
rounded
"

>

🗑

</button>



</div>




</div>


))


}



</div>









{
modal &&


<div className="
fixed
inset-0
bg-black/70
z-50
flex
items-center
justify-center
">


<div className="
bg-zinc-900
rounded-xl
p-5
w-full
max-w-md
relative
">


<button

onClick={()=>setModal(false)}

className="
absolute
right-3
top-3
text-2xl
"

>

✕

</button>



<h2 className="
text-xl
font-bold
mb-4
">

{editId?"Izmeni":"Dodaj"}

</h2>




<input
placeholder="Naziv"
value={form.name}
onChange={e=>setForm({...form,name:e.target.value})}
className="w-full bg-black p-3 rounded mb-2"
/>



<input
placeholder="Kategorija"
value={form.category}
onChange={e=>setForm({...form,category:e.target.value})}
className="w-full bg-black p-3 rounded mb-2"
/>




<input
placeholder="Cena"
type="number"
value={form.price}
onChange={e=>setForm({...form,price:e.target.value})}
className="w-full bg-black p-3 rounded mb-2"
/>



<input
placeholder="Količina"
type="number"
value={form.quantity}
onChange={e=>setForm({...form,quantity:e.target.value})}
className="w-full bg-black p-3 rounded mb-4"
/>



<button

onClick={save}

className="
bg-green-500
text-black
w-full
p-3
rounded
"

>

💾 Sačuvaj

</button>



</div>


</div>


}



</main>

);


}